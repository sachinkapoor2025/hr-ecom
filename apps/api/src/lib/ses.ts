import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { sesEmailKeys, sesSettingsSchema, type SesSettings } from "@hr-ecom/shared";
import { docClient, EMAIL_CAMPAIGNS_TABLE } from "./db";

const region = process.env.SES_AWS_REGION || process.env.AWS_REGION || "us-east-1";

let client: SESv2Client | null = null;

function getClient(): SESv2Client {
  if (!client) {
    client = new SESv2Client({ region });
  }
  return client;
}

export type SesSendInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  configurationSetName?: string;
};

export class SesSendError extends Error {
  readonly code?: string;
  readonly httpStatusCode?: number;

  constructor(message: string, options?: { code?: string; httpStatusCode?: number; cause?: unknown }) {
    super(message);
    this.name = "SesSendError";
    this.code = options?.code;
    this.httpStatusCode = options?.httpStatusCode;
    if (options?.cause !== undefined) {
      try {
        (this as Error & { cause?: unknown }).cause = options.cause;
      } catch {
        // ignore if cause is non-writable on older runtimes
      }
    }
  }
}

/** Build a valid RFC5322 From header value. */
export function formatSesFromAddress(fromName: string, fromEmail: string): string {
  const email = fromEmail.trim();
  const name = fromName.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new SesSendError(
      `Invalid From email address "${fromEmail || "(empty)"}". Use a verified sender (e.g. order@usarakhi.com).`
    );
  }
  if (!name) return email;
  const needsQuotes = /[<>,"\\()]/.test(name);
  const safeName = needsQuotes
    ? `"${name.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
    : name;
  return `${safeName} <${email}>`;
}

type AwsLikeError = {
  name?: string;
  message?: string;
  Code?: string;
  $metadata?: { httpStatusCode?: number };
  reason?: string;
};

/** Map AWS SES / SDK failures to actionable operator-facing messages. */
export function formatSesError(err: unknown): SesSendError {
  if (err instanceof SesSendError) return err;

  const e = (err ?? {}) as AwsLikeError;
  const code = e.name || e.Code || "SesError";
  const raw = (e.message || e.reason || (err instanceof Error ? err.message : String(err))).trim();
  const httpStatusCode = e.$metadata?.httpStatusCode;
  const combined = `${code}: ${raw}`;

  if (/MessageRejected/i.test(code) || /MessageRejected/i.test(raw)) {
    return new SesSendError(
      `SES rejected the email (${code}): ${raw}. Confirm the From address/domain is verified in SES (${region}) and the account is out of sandbox (or the recipient is a verified identity).`,
      { code, httpStatusCode, cause: err }
    );
  }
  if (/MailFromDomainNotVerified|EmailAddressNotVerified|not verified/i.test(combined)) {
    return new SesSendError(
      `SES identity not verified (${code}): ${raw}. Verify usarakhi.com and ${process.env.SES_FROM_EMAIL || "order@usarakhi.com"} in Amazon SES (${region}).`,
      { code, httpStatusCode, cause: err }
    );
  }
  if (/AccountSendingPaused|sending.*paused/i.test(combined)) {
    return new SesSendError(
      `SES sending is paused for this account (${code}): ${raw}. Check the SES console reputation dashboard.`,
      { code, httpStatusCode, cause: err }
    );
  }
  if (/ConfigurationSetDoesNotExist|InvalidConfigurationSet|configuration set/i.test(combined)) {
    return new SesSendError(
      `SES configuration set error (${code}): ${raw}. Check the SES_CONFIGURATION_SET environment variable.`,
      { code, httpStatusCode, cause: err }
    );
  }
  if (/AccessDenied|UnauthorizedOperation|not authorized/i.test(combined)) {
    return new SesSendError(
      `SES AccessDenied (${code}): ${raw}. The API Lambda IAM role may be missing sesv2:SendEmail in ${region}.`,
      { code, httpStatusCode, cause: err }
    );
  }
  if (/DailyQuotaExceeded|MaxSendRateExceeded|Throttl/i.test(combined)) {
    return new SesSendError(
      `SES sending limit hit (${code}): ${raw}. Wait and retry, or raise the SES sending quota.`,
      { code, httpStatusCode, cause: err }
    );
  }
  if (/InvalidParameterValue|ValidationException|BadRequest/i.test(combined)) {
    return new SesSendError(`SES rejected the request (${code}): ${raw}`, {
      code,
      httpStatusCode,
      cause: err,
    });
  }

  return new SesSendError(`SES send failed (${code}): ${raw || "Unknown SES error"}`, {
    code,
    httpStatusCode,
    cause: err,
  });
}

type MarketingSmtp = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
};

type ResolvedTransport = {
  mode: "smtp" | "ses";
  smtp?: MarketingSmtp;
};

const PASSWORD_REDACTED = "********";
const CACHE_MS = 30_000;
let transportCache: { at: number; value: ResolvedTransport } | null = null;

/** Call after admin saves settings so the next send picks up new SMTP creds. */
export function clearMarketingTransportCache() {
  transportCache = null;
}

function envMarketingSmtp(): MarketingSmtp | null {
  const host =
    process.env.MARKETING_SMTP_HOST?.trim() ||
    process.env.SMTP_HOST?.trim() ||
    "";
  const user =
    process.env.MARKETING_SMTP_USER?.trim() ||
    process.env.SES_FROM_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "";
  const pass =
    process.env.MARKETING_SMTP_PASS?.trim() ||
    process.env.SMTP_PASS?.trim() ||
    process.env.SMTP_PASSWORD?.trim() ||
    "";
  if (!host || !user || !pass) return null;
  const port = Number(process.env.MARKETING_SMTP_PORT ?? "587");
  const secureRaw = process.env.MARKETING_SMTP_SECURE?.trim().toLowerCase();
  const secure = secureRaw === "true" || secureRaw === "1" || port === 465;
  return {
    host,
    port: Number.isFinite(port) && port > 0 ? port : 587,
    secure,
    user,
    pass,
  };
}

async function loadStoredSettings(): Promise<Partial<SesSettings>> {
  try {
    const res = await docClient.send(
      new GetCommand({
        TableName: EMAIL_CAMPAIGNS_TABLE,
        Key: { PK: sesEmailKeys.settingsPk(), SK: sesEmailKeys.settingsSk() },
      })
    );
    return (res.Item?.settings as Partial<SesSettings> | undefined) ?? {};
  } catch (err) {
    console.error("Failed to load marketing email settings", err);
    return {};
  }
}

async function resolveTransport(): Promise<ResolvedTransport> {
  const nowMs = Date.now();
  if (transportCache && nowMs - transportCache.at < CACHE_MS) {
    return transportCache.value;
  }

  const stored = await loadStoredSettings();
  const mode = (stored.marketingTransport ||
    process.env.MARKETING_TRANSPORT?.trim() ||
    "smtp") as "smtp" | "ses";

  const envSmtp = envMarketingSmtp();
  const host =
    stored.smtpHost?.trim() ||
    process.env.MARKETING_SMTP_HOST?.trim() ||
    "smtp-prod.mailrcld.com";
  const port = Number(stored.smtpPort ?? process.env.MARKETING_SMTP_PORT ?? 587);
  const secure =
    typeof stored.smtpSecure === "boolean"
      ? stored.smtpSecure
      : process.env.MARKETING_SMTP_SECURE?.trim().toLowerCase() === "true" ||
        port === 465;
  const user =
    stored.smtpUser?.trim() ||
    process.env.MARKETING_SMTP_USER?.trim() ||
    process.env.SES_FROM_EMAIL?.trim() ||
    "order@usarakhi.com";
  const pass =
    (stored.smtpPassword && stored.smtpPassword !== PASSWORD_REDACTED
      ? stored.smtpPassword.trim()
      : "") ||
    envSmtp?.pass ||
    "";

  let value: ResolvedTransport;
  if (mode === "smtp" && host && user && pass) {
    value = {
      mode: "smtp",
      smtp: {
        host,
        port: Number.isFinite(port) && port > 0 ? port : 587,
        secure,
        user,
        pass,
      },
    };
  } else if (mode === "smtp" && envSmtp) {
    value = { mode: "smtp", smtp: envSmtp };
  } else {
    value = { mode: "ses" };
  }

  transportCache = { at: nowMs, value };
  return value;
}

async function sendViaMarketingSmtp(
  input: SesSendInput,
  smtp: MarketingSmtp
): Promise<{ messageId?: string }> {
  const from = formatSesFromAddress(input.fromName, input.fromEmail);
  const options: SMTPTransport.Options = {
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    requireTLS: !smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
  };
  const transporter = nodemailer.createTransport(options);
  try {
    const info = await transporter.sendMail({
      from,
      to: input.to,
      replyTo: input.replyTo?.trim() || input.fromEmail,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return { messageId: typeof info.messageId === "string" ? info.messageId : undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new SesSendError(`Marketing SMTP failed: ${message}`, {
      code: "MarketingSmtpError",
      cause: err,
    });
  }
}

async function sendViaSesApi(input: SesSendInput): Promise<{ messageId?: string }> {
  const from = formatSesFromAddress(input.fromName, input.fromEmail);
  const configurationSetName =
    input.configurationSetName || process.env.SES_CONFIGURATION_SET || undefined;

  try {
    const result = await getClient().send(
      new SendEmailCommand({
        FromEmailAddress: from,
        Destination: { ToAddresses: [input.to] },
        ReplyToAddresses: input.replyTo?.trim() ? [input.replyTo.trim()] : undefined,
        Content: {
          Simple: {
            Subject: { Data: input.subject, Charset: "UTF-8" },
            Body: {
              Html: { Data: input.html, Charset: "UTF-8" },
              ...(input.text
                ? { Text: { Data: input.text, Charset: "UTF-8" } }
                : {}),
            },
          },
        },
        ...(configurationSetName ? { ConfigurationSetName: configurationSetName } : {}),
      })
    );
    return { messageId: result.MessageId };
  } catch (err) {
    const formatted = formatSesError(err);
    console.error("[SES] sendViaSes failed", {
      code: formatted.code,
      httpStatusCode: formatted.httpStatusCode,
      from,
      to: input.to,
      subject: input.subject,
      region,
      configurationSetName: configurationSetName || null,
      message: formatted.message,
      cause: err,
    });
    throw formatted;
  }
}

/**
 * Send one marketing email.
 * Prefer admin/env SMTP (mailrcld) — SES API only when marketingTransport=ses
 * or SMTP is not configured.
 */
export async function sendViaSes(input: SesSendInput): Promise<{ messageId?: string }> {
  const transport = await resolveTransport();
  if (transport.mode === "smtp" && transport.smtp) {
    try {
      return await sendViaMarketingSmtp(input, transport.smtp);
    } catch (err) {
      if (err instanceof SesSendError) {
        console.error("[Marketing SMTP] send failed", {
          to: input.to,
          subject: input.subject,
          message: err.message,
        });
        throw err;
      }
      const formatted = new SesSendError(
        `Marketing SMTP failed: ${err instanceof Error ? err.message : String(err)}`,
        { code: "MarketingSmtpError", cause: err }
      );
      console.error("[Marketing SMTP] send failed", {
        to: input.to,
        subject: input.subject,
        message: formatted.message,
      });
      throw formatted;
    }
  }
  return sendViaSesApi(input);
}

export function redactSettingsForAdmin(settings: SesSettings): SesSettings {
  const parsed = sesSettingsSchema.parse(settings);
  return {
    ...parsed,
    smtpPassword: parsed.smtpPassword ? PASSWORD_REDACTED : "",
  };
}

export function isRedactedPassword(value?: string | null): boolean {
  return !value || value === PASSWORD_REDACTED;
}

export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 10_000);
}

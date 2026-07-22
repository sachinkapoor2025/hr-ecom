import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";

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

/** Build a valid RFC5322 From header value for SESv2. */
export function formatSesFromAddress(fromName: string, fromEmail: string): string {
  const email = fromEmail.trim();
  const name = fromName.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new SesSendError(
      `Invalid From email address "${fromEmail || "(empty)"}". Use a verified SES identity (e.g. order@usarakhi.com).`
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

/** Send one email via Amazon SES API (not SMTP). */
export async function sendViaSes(input: SesSendInput): Promise<{ messageId?: string }> {
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

export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 10_000);
}

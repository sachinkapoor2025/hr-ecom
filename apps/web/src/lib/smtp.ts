import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const SITE_NAME = "UsaRakhi";
const DEFAULT_NOTIFY = "order@usarakhi.com";

export type SmtpSendResult = { ok: boolean; error?: string; skipped?: boolean };

function configured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

function hosts(): string[] {
  const primary = process.env.SMTP_HOST?.trim();
  const extras = (process.env.SMTP_HOSTS ?? "mail.usarakhi.com,smtp.usarakhi.com")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  return [...new Set(primary ? [primary, ...extras] : extras)];
}

function configs(host: string): SMTPTransport.Options[] {
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();
  const portEnv = process.env.SMTP_PORT?.trim();

  if (portEnv) {
    const port = Number(portEnv);
    const secure = process.env.SMTP_SECURE?.trim()
      ? process.env.SMTP_SECURE === "true"
      : port === 465;
    return [{ host, port, secure, auth: { user, pass } }];
  }

  return [
    { host, port: 465, secure: true, auth: { user, pass } },
    { host, port: 587, secure: false, auth: { user, pass }, requireTLS: true },
  ];
}

async function transporter() {
  let lastError: unknown;
  for (const host of hosts()) {
    for (const config of configs(host)) {
      const t = nodemailer.createTransport({
        ...config,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
      });
      try {
        await t.verify();
        return t;
      } catch (err) {
        lastError = err;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("SMTP failed");
}

function notifyTo(): string {
  return process.env.NOTIFY_EMAIL?.trim() || DEFAULT_NOTIFY;
}

function from(): string {
  return process.env.SMTP_FROM?.trim() || process.env.SMTP_USER!.trim() || notifyTo();
}

async function send(to: string, subject: string, text: string, replyTo?: string): Promise<SmtpSendResult> {
  if (!configured()) {
    return { ok: false, skipped: true, error: "SMTP not configured" };
  }
  try {
    const t = await transporter();
    await t.sendMail({
      from: `"${SITE_NAME}" <${from()}>`,
      to,
      subject,
      text,
      html: text.replace(/\n/g, "<br>"),
      replyTo,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function sendContactFormEmails(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<SmtpSendResult> {
  const adminText = [
    "Source: Contact form (website)",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : null,
    "",
    "Message:",
    input.message,
  ]
    .filter(Boolean)
    .join("\n");

  const admin = await send(
    notifyTo(),
    `[${SITE_NAME}] New contact enquiry from ${input.name}`,
    adminText,
    input.email
  );
  if (!admin.ok) return admin;

  await send(
    input.email,
    `We received your message — ${SITE_NAME}`,
    `Hi ${input.name},

Thank you for contacting ${SITE_NAME}. We received your message and will reply as soon as possible.

— ${SITE_NAME} Team
https://www.usarakhi.com`
  );

  return { ok: true };
}

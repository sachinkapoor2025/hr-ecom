import nodemailer from "nodemailer";
import type { Order } from "@hr-ecom/shared";
import type { LeadCaptureInput } from "@hr-ecom/shared";

const DEFAULT_NOTIFY = "order@usarakhi.com";
const SITE_NAME = "UsaRakhi";

function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

function getTransporter() {
  if (!smtpConfigured()) return null;

  const port = Number(process.env.SMTP_PORT?.trim()) || 465;
  const secure = process.env.SMTP_SECURE?.trim()
    ? process.env.SMTP_SECURE === "true"
    : port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!.trim(),
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASS!.trim(),
    },
  });
}

function notifyAddress(): string {
  return process.env.NOTIFY_EMAIL?.trim() || DEFAULT_NOTIFY;
}

function fromAddress(): string {
  return process.env.SMTP_FROM?.trim() || process.env.SMTP_USER!.trim() || notifyAddress();
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("Email skipped: SMTP_HOST, SMTP_USER, or SMTP_PASS not configured");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${fromAddress()}>`,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html ?? opts.text.replace(/\n/g, "<br>"),
      replyTo: opts.replyTo,
    });
    return true;
  } catch (err) {
    console.error("sendEmail failed:", err instanceof Error ? err.message : err);
    return false;
  }
}

function formatLeadSource(source?: string): string {
  switch (source) {
    case "contact":
      return "Contact form";
    case "newsletter":
      return "Newsletter / exit offer";
    case "chat":
      return "Chat widget";
    case "checkout":
      return "Checkout";
    case "product":
      return "Product page";
    default:
      return source ?? "Website";
  }
}

/** Notify admin when a contact or enquiry lead is captured. */
export async function notifyAdminLead(lead: LeadCaptureInput): Promise<void> {
  if (!smtpConfigured()) return;

  const message = lead.metadata?.message?.trim();
  const isContact = lead.source === "contact";
  const isEnquiry = isContact || Boolean(message) || lead.source === "newsletter";

  if (!isEnquiry) return;

  const lines = [
    `Source: ${formatLeadSource(lead.source)}`,
    lead.name ? `Name: ${lead.name}` : null,
    lead.email ? `Email: ${lead.email}` : null,
    lead.phone ? `Phone: ${lead.phone}` : null,
    lead.page ? `Page: ${lead.page}` : null,
    lead.productSlug ? `Product: ${lead.productSlug}` : null,
    message ? `\nMessage:\n${message}` : null,
    lead.metadata && Object.keys(lead.metadata).length > 0
      ? `\nMetadata: ${JSON.stringify(lead.metadata, null, 2)}`
      : null,
    `\nSession: ${lead.sessionId}`,
  ]
    .filter(Boolean)
    .join("\n");

  await sendEmail({
    to: notifyAddress(),
    subject: `[${SITE_NAME}] New enquiry — ${formatLeadSource(lead.source)}`,
    text: lines,
    replyTo: lead.email,
  });

  if (isContact && lead.email) {
    await sendEmail({
      to: lead.email,
      subject: `We received your message — ${SITE_NAME}`,
      text: `Hi${lead.name ? ` ${lead.name}` : ""},

Thank you for contacting ${SITE_NAME}. We received your message and will reply as soon as possible (usually within 24 hours).

For urgent order help, WhatsApp us or email order@usarakhi.com.

— ${SITE_NAME} Team
https://www.usarakhi.com`,
    });
  }
}

function formatOrderItems(order: Order): string {
  return order.items
    .map((i) => `- ${i.name} × ${i.quantity} — ${order.currency} ${(i.price * i.quantity).toFixed(2)}`)
    .join("\n");
}

function formatAddress(order: Order): string {
  const a = order.shippingAddress;
  if (!a) return "—";
  return [
    a.name,
    a.line1,
    a.line2,
    `${a.city}, ${a.state} ${a.postalCode}`,
    a.country,
    a.phone ? `Phone: ${a.phone}` : null,
    a.email ? `Email: ${a.email}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildOrderAdminBody(order: Order, headline: string): string {
  return [
    headline,
    "",
    `Order ID: ${order.orderId}`,
    `Total: ${order.currency} ${order.total.toFixed(2)}`,
    `Payment method: ${order.paymentProvider ?? "—"}`,
    `Status: ${order.status}`,
    "",
    "Items:",
    formatOrderItems(order),
    "",
    "Ship to:",
    formatAddress(order),
    "",
    `Placed: ${order.createdAt}`,
  ].join("\n");
}

/** Notify admin when customer completes checkout (order created, payment may still be pending). */
export async function notifyAdminOrderPlaced(order: Order): Promise<void> {
  if (!smtpConfigured()) return;

  await sendEmail({
    to: notifyAddress(),
    subject: `[${SITE_NAME}] New order placed — ${order.orderId.slice(0, 8)} (${order.currency} ${order.total.toFixed(2)})`,
    text: buildOrderAdminBody(
      order,
      `A customer placed a new order on ${SITE_NAME}. Payment may still be processing.`
    ),
    replyTo: order.shippingAddress?.email,
  });
}

/** Notify admin when payment is confirmed for a new order. */
export async function notifyAdminOrderPaid(order: Order): Promise<void> {
  if (!smtpConfigured()) return;

  const text = buildOrderAdminBody(order, `Payment confirmed — new order on ${SITE_NAME}`);

  await sendEmail({
    to: notifyAddress(),
    subject: `[${SITE_NAME}] ✅ Payment received — Order ${order.orderId.slice(0, 8)} (${order.currency} ${order.total.toFixed(2)})`,
    text,
    replyTo: order.shippingAddress?.email,
  });

  const customerEmail = order.shippingAddress?.email?.trim();
  if (customerEmail && customerEmail.includes("@")) {
    await sendEmail({
      to: customerEmail,
      subject: `Order confirmed — ${SITE_NAME}`,
      text: `Hi${order.shippingAddress?.name ? ` ${order.shippingAddress.name}` : ""},

Thank you for your order! Payment has been received.

Order ID: ${order.orderId}
Total: ${order.currency} ${order.total.toFixed(2)}

We deliver to all 50 US states in 5–7 business days after dispatch.

Questions? Reply to this email or WhatsApp us.

— ${SITE_NAME} Team`,
    });
  }
}

/** Fire-and-forget wrapper — never throws to callers. */
export function queueLeadEmail(lead: LeadCaptureInput): void {
  void notifyAdminLead(lead).catch((err) => console.error("notifyAdminLead:", err));
}

export function queueOrderPlacedEmail(order: Order): void {
  void notifyAdminOrderPlaced(order).catch((err) => console.error("notifyAdminOrderPlaced:", err));
}

export function queueOrderPaidEmail(order: Order): void {
  void notifyAdminOrderPaid(order).catch((err) => console.error("notifyAdminOrderPaid:", err));
}

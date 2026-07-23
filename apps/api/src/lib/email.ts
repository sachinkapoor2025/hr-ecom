import nodemailer from "nodemailer";
import crypto from "crypto";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { Order, Product, CartItem } from "@hr-ecom/shared";
import type { LeadCaptureInput } from "@hr-ecom/shared";
import {
  ORDER_STATUS,
  WELCOME_DISCOUNT_PERCENT,
  LOW_STOCK_ALERT_EMAIL,
  ABANDONED_CART_DISCOUNT_PERCENT,
} from "@hr-ecom/shared";
import {
  abandonedCartWhatsAppMessage,
  contactAckWhatsAppMessage,
  notifyCustomerWhatsApp,
  orderPaidWhatsAppMessage,
  orderStatusWhatsAppMessage,
  pendingPaymentWhatsAppMessage,
  reviewRequestWhatsAppMessage,
  welcomeCouponWhatsAppMessage,
} from "./whatsapp";

const DEFAULT_NOTIFY = "order@usarakhi.com";
/** Admin inbox for new orders + contact form (comma-separated). */
const DEFAULT_ADMIN_NOTIFY =
  "order@usarakhi.com,priya.yadav@mydgv.com";
const SITE_NAME = "UsaRakhi";

export type EmailSendResult = {
  ok: boolean;
  error?: string;
  skipped?: boolean;
};

function smtpPassword(): string | undefined {
  return (
    process.env.SMTP_PASS?.trim() ||
    process.env.SMTP_PASSWORD?.trim() ||
    undefined
  );
}

function smtpConfigured(): boolean {
  const user = process.env.SMTP_USER?.trim() || DEFAULT_NOTIFY;
  return Boolean(user && smtpPassword());
}

function smtpUser(): string {
  return process.env.SMTP_USER?.trim() || DEFAULT_NOTIFY;
}

function smtpHosts(): string[] {
  const primary = process.env.SMTP_HOST?.trim();
  const extras = (process.env.SMTP_HOSTS ?? "mail.usarakhi.com,smtp.usarakhi.com")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  const all = primary ? [primary, ...extras] : extras;
  return [...new Set(all)];
}

function transportConfigs(host: string): SMTPTransport.Options[] {
  const user = smtpUser();
  const pass = smtpPassword()!;
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

async function createWorkingTransporter() {
  const hosts = smtpHosts();
  let lastError: unknown;

  for (const host of hosts) {
    for (const config of transportConfigs(host)) {
      const transporter = nodemailer.createTransport({
        ...config,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
      });

      try {
        await transporter.verify();
        return transporter;
      } catch (err) {
        lastError = err;
        console.error("SMTP verify failed", { host, port: config.port, err });
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("SMTP connection failed");
}

/** Public support address shown to customers (single inbox). */
function notifyAddress(): string {
  const raw = process.env.NOTIFY_EMAIL?.trim() || DEFAULT_ADMIN_NOTIFY;
  return raw.split(",")[0]?.trim() || DEFAULT_NOTIFY;
}

/** All admin recipients for order/contact alerts (comma-separated OK for nodemailer). */
function adminNotifyAddresses(): string {
  return process.env.NOTIFY_EMAIL?.trim() || DEFAULT_ADMIN_NOTIFY;
}

function fromAddress(): string {
  return process.env.SMTP_FROM?.trim() || smtpUser() || notifyAddress();
}

export async function sendNewsletterEmails(input: {
  email: string;
  page?: string;
  metadata?: Record<string, string>;
  coupon?: { code: string; expiresAt: string; discountPercent: number };
}): Promise<EmailSendResult> {
  if (!smtpConfigured()) {
    return { ok: false, skipped: true, error: "SMTP not configured on server" };
  }

  const coupon = input.coupon ?? {
    code: input.metadata?.couponCode ?? "",
    expiresAt: input.metadata?.couponExpiresAt ?? "",
    discountPercent: Number(input.metadata?.discountPercent ?? WELCOME_DISCOUNT_PERCENT),
  };

  const expiryLabel = coupon.expiresAt
    ? new Date(coupon.expiresAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/New_York",
      })
    : "1 hour";

  const pct = coupon.discountPercent || WELCOME_DISCOUNT_PERCENT;
  const skipCustomer = input.metadata?.alreadyClaimedToday === "true";

  if (skipCustomer) {
    return { ok: true };
  }

  const adminText = [
    "Source: Discount of the Day spin",
    `Email: ${input.email}`,
    input.metadata?.phone ? `Phone: ${input.metadata.phone}` : null,
    coupon.code ? `Coupon: ${coupon.code} (${pct}% off)` : null,
    coupon.expiresAt ? `Expires: ${coupon.expiresAt}` : null,
    input.page ? `Page: ${input.page}` : null,
    input.metadata ? `Details: ${JSON.stringify(input.metadata)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const admin = await sendEmail({
    to: adminNotifyAddresses(),
    subject: `[${SITE_NAME}] Discount of the Day — ${input.email} (${pct}% off)`,
    text: adminText,
    replyTo: input.email,
  });
  if (!admin.ok) return admin;

  if (!coupon.code) {
    return { ok: true };
  }

  const customer = await sendEmail({
    to: input.email,
    subject: `Your Discount of the Day: ${pct}% off — ${SITE_NAME}`,
    text: `You spun the Discount of the Day wheel at UsaRakhi!

Your exclusive code:

  Coupon code: ${coupon.code}
  Discount: ${pct}% off
  Valid until: ${expiryLabel} (1 hour from spin)

Enter this code at checkout on https://www.usarakhi.com/checkout

One spin per mobile number per day. Shop premium Rakhis with delivery to all 50 US states:
https://www.usarakhi.com/products

Raksha Bandhan 2026 is August 28 — order early for on-time delivery.

— ${SITE_NAME} Team
order@usarakhi.com`,
  });

  const waPhone = input.metadata?.phone?.trim();
  if (waPhone && coupon.code && coupon.expiresAt) {
    await notifyCustomerWhatsApp({
      phone: waPhone,
      context: "welcome-coupon",
      message: welcomeCouponWhatsAppMessage({
        code: coupon.code,
        discountPercent: pct,
        expiresAt: coupon.expiresAt,
      }),
    });
  }

  if (!customer.ok) {
    console.error("Discount of the Day email failed:", customer.error);
    return customer;
  }

  return { ok: true };
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<EmailSendResult> {
  const { isLoadTestMode } = await import("./load-test");
  if (isLoadTestMode()) {
    return { ok: true, skipped: true };
  }

  if (!smtpConfigured()) {
    console.warn("Email skipped: SMTP not configured");
    return { ok: false, skipped: true, error: "SMTP not configured on server" };
  }

  try {
    const transporter = await createWorkingTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${fromAddress()}>`,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html ?? opts.text.replace(/\n/g, "<br>"),
      replyTo: opts.replyTo,
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
        "Auto-Submitted": "auto-generated",
      },
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("sendEmail failed:", message);
    return { ok: false, error: message };
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
    case "review":
      return "Customer review";
    case "checkout":
      return "Checkout";
    case "product":
      return "Product page";
    default:
      return source ?? "Website";
  }
}

export type ContactEmailInput = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  page?: string;
};

export async function sendContactEmails(input: ContactEmailInput): Promise<EmailSendResult> {
  if (!smtpConfigured()) {
    return { ok: false, skipped: true, error: "SMTP not configured on server" };
  }

  const adminText = [
    `Source: Contact form`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : null,
    input.page ? `Page: ${input.page}` : null,
    "",
    "Message:",
    input.message,
  ]
    .filter(Boolean)
    .join("\n");

  const admin = await sendEmail({
    to: adminNotifyAddresses(),
    subject: `[${SITE_NAME}] New contact enquiry from ${input.name}`,
    text: adminText,
    replyTo: input.email,
  });

  if (!admin.ok) return admin;

  const customer = await sendEmail({
    to: input.email,
    subject: `We received your message — ${SITE_NAME}`,
    text: `Hi ${input.name},

Thank you for contacting ${SITE_NAME}. We received your message and will reply as soon as possible (usually within 24 hours).

For urgent order help, WhatsApp us or email ${notifyAddress()}.

— ${SITE_NAME} Team
https://www.usarakhi.com`,
  });

  if (input.phone) {
    await notifyCustomerWhatsApp({
      phone: input.phone,
      context: "contact-ack",
      message: contactAckWhatsAppMessage({ name: input.name }),
    });
  }

  if (!customer.ok) {
    console.error("Customer auto-reply failed:", customer.error);
  }

  return { ok: true };
}

export async function notifyAdminLead(lead: LeadCaptureInput): Promise<EmailSendResult> {
  const message = lead.metadata?.message?.trim();
  const isContact = lead.source === "contact";
  const isReview = lead.source === "review";

  if (isContact && lead.name && lead.email && message) {
    return sendContactEmails({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      message,
      page: lead.page,
    });
  }

  if (lead.source === "newsletter") {
    const coupon =
      lead.metadata?.couponCode && lead.metadata?.couponExpiresAt
        ? {
            code: lead.metadata.couponCode,
            expiresAt: lead.metadata.couponExpiresAt,
            discountPercent: Number(lead.metadata.discountPercent ?? WELCOME_DISCOUNT_PERCENT),
          }
        : undefined;
    if (lead.email) {
      return sendNewsletterEmails({
        email: lead.email,
        page: lead.page,
        metadata: {
          ...lead.metadata,
          ...(lead.phone ? { phone: lead.phone } : {}),
        },
        coupon,
      });
    }
    // Phone-only spin — WhatsApp customer + admin email (no customer email).
    const pct = coupon?.discountPercent ?? WELCOME_DISCOUNT_PERCENT;
    const alreadyClaimed = lead.metadata?.alreadyClaimedToday === "true";
    if (!alreadyClaimed && lead.phone && coupon?.code && coupon.expiresAt) {
      await notifyCustomerWhatsApp({
        phone: lead.phone,
        context: "welcome-coupon-phone",
        message: welcomeCouponWhatsAppMessage({
          code: coupon.code,
          discountPercent: pct,
          expiresAt: coupon.expiresAt,
        }),
      });
    }
    if (!smtpConfigured()) return { ok: true, skipped: true };
    return sendEmail({
      to: adminNotifyAddresses(),
      subject: `[${SITE_NAME}] Discount of the Day — phone ${lead.phone ?? "unknown"} (${pct}% off)`,
      text: [
        "Source: Discount of the Day spin (phone only)",
        lead.phone ? `Phone: ${lead.phone}` : null,
        coupon?.code ? `Coupon: ${coupon.code} (${pct}% off)` : null,
        coupon?.expiresAt ? `Expires: ${coupon.expiresAt}` : null,
        lead.page ? `Page: ${lead.page}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  if (!smtpConfigured()) {
    return { ok: false, skipped: true, error: "SMTP not configured" };
  }

  const isEnquiry = isContact || isReview || Boolean(message);
  if (!isEnquiry) return { ok: true, skipped: true };

  const lines = [
    `Source: ${formatLeadSource(lead.source)}`,
    lead.name ? `Name: ${lead.name}` : null,
    lead.email ? `Email: ${lead.email}` : null,
    lead.phone ? `Phone: ${lead.phone}` : null,
    lead.page ? `Page: ${lead.page}` : null,
    lead.productSlug ? `Product: ${lead.productSlug}` : null,
    isReview ? "\nReview moderation: Do not publish this review until the owner approves it and the customer gives permission." : null,
    message ? `\nMessage:\n${message}` : null,
    lead.metadata && Object.keys(lead.metadata).length > 0
      ? `\nMetadata: ${JSON.stringify(lead.metadata, null, 2)}`
      : null,
    `\nSession: ${lead.sessionId}`,
  ]
    .filter(Boolean)
    .join("\n");

  return sendEmail({
    to: adminNotifyAddresses(),
    subject: isReview
      ? `[${SITE_NAME}] Review submitted for approval`
      : `[${SITE_NAME}] New enquiry — ${formatLeadSource(lead.source)}`,
    text: lines,
    replyTo: lead.email,
  });
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

function adminOrderSubject(label: string, order: Order): string {
  return `[${SITE_NAME}] ${label} — ${order.orderId.slice(0, 8)} (${order.currency} ${order.total.toFixed(2)})`;
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

export async function notifyAdminOrderPlaced(order: Order): Promise<EmailSendResult> {
  return sendEmail({
    to: adminNotifyAddresses(),
    subject: adminOrderSubject("Order added in cart - payment pending", order),
    text: buildOrderAdminBody(
      order,
      `A customer started checkout on ${SITE_NAME}. Payment is still pending — not a confirmed order yet.`
    ),
    replyTo: order.shippingAddress?.email,
  });
}

export async function notifyAdminOrderPaid(order: Order): Promise<EmailSendResult> {
  const admin = await sendEmail({
    to: adminNotifyAddresses(),
    subject: adminOrderSubject("New order - paid", order),
    text: buildOrderAdminBody(order, `Payment confirmed — new paid order on ${SITE_NAME}.`),
    replyTo: order.shippingAddress?.email,
  });

  if (!admin.ok) return admin;

  const customerEmail = order.shippingAddress?.email?.trim();
  const totalLabel = `${order.currency} ${order.total.toFixed(2)}`;
  if (customerEmail && customerEmail.includes("@")) {
    await sendEmail({
      to: customerEmail,
      subject: `Order confirmed — ${SITE_NAME}`,
      text: `Hi${order.shippingAddress?.name ? ` ${order.shippingAddress.name}` : ""},

Thank you for your order! Payment has been received.

Order ID: ${order.orderId}
Total: ${totalLabel}

We deliver to all 50 US states in 5–7 business days after dispatch.

Questions? Reply to this email or WhatsApp us.

— ${SITE_NAME} Team`,
    });
  }

  await notifyCustomerWhatsApp({
    phone: order.shippingAddress?.phone,
    context: "order-paid",
    message: orderPaidWhatsAppMessage({
      name: order.shippingAddress?.name?.split(" ")[0],
      orderId: order.orderId,
      totalLabel,
    }),
  });

  return { ok: true };
}

export async function notifyAdminOrderPaymentFailed(order: Order): Promise<EmailSendResult> {
  return sendEmail({
    to: adminNotifyAddresses(),
    subject: adminOrderSubject("New order - payment failed", order),
    text: buildOrderAdminBody(
      order,
      `Checkout on ${SITE_NAME} was cancelled or payment failed. No payment was received.`
    ),
    replyTo: order.shippingAddress?.email,
  });
}

export async function notifyLowStock(product: Product, inventory: number): Promise<EmailSendResult> {
  const soldOut = inventory <= 0;
  const subject = soldOut
    ? `[${SITE_NAME}] SOLD OUT — restock ${product.name}`
    : `[${SITE_NAME}] Low stock (${inventory} left) — ${product.name}`;

  const text = soldOut
    ? `Product sold out on ${SITE_NAME}

Product: ${product.name}
SKU: ${product.sku ?? "—"}
Slug: ${product.slug}
Category: ${product.categorySlug}
Current inventory: 0

Please restock this item in the admin portal (Products → edit stock).

Admin: https://www.usarakhi.com/admin/products`
    : `Low stock alert on ${SITE_NAME}

Product: ${product.name}
SKU: ${product.sku ?? "—"}
Slug: ${product.slug}
Category: ${product.categorySlug}
Current inventory: ${inventory} (threshold: 10 or below)

Please restock this item in the admin portal.

Admin: https://www.usarakhi.com/admin/products`;

  return sendEmail({
    to: LOW_STOCK_ALERT_EMAIL,
    subject,
    text,
  });
}

function siteUrl(): string {
  return (process.env.SITE_URL ?? "https://www.usarakhi.com").replace(/\/$/, "");
}

/** Customer-facing copy for each fulfillment / terminal status step. */
function customerStatusEmailContent(order: Order): { subject: string; body: string } | null {
  const name = order.shippingAddress?.name?.split(" ")[0] ?? "there";
  const shortId = order.orderId.slice(0, 8).toUpperCase();
  const total = `${order.currency} ${order.total.toFixed(2)}`;
  const trackingLines = [
    order.carrier ? `Carrier: ${order.carrier}` : null,
    order.trackingNumber ? `Tracking number: ${order.trackingNumber}` : null,
    order.estimatedDeliveryAt
      ? `Estimated delivery: ${new Date(order.estimatedDeliveryAt).toLocaleDateString("en-US", {
          dateStyle: "medium",
          timeZone: "America/New_York",
        })}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const footer = `

View your order: ${siteUrl()}/orders/${order.orderId}

Questions? Reply to this email or WhatsApp us.

— ${SITE_NAME} Team
${siteUrl()}`;

  switch (order.status) {
    case ORDER_STATUS.PAID:
      return {
        subject: `Order confirmed — ${SITE_NAME}`,
        body: `Hi ${name},

Thank you for your order! Payment has been received.

Order ID: ${shortId}
Total: ${total}

We deliver to all 50 US states in 5–7 business days after dispatch.${footer}`,
      };
    case ORDER_STATUS.ACCEPTED:
      return {
        subject: `Order accepted — #${shortId} | ${SITE_NAME}`,
        body: `Hi ${name},

Good news — we've accepted your Rakhi order #${shortId} and our team is preparing it for fulfillment.

Order total: ${total}

We'll email you again when packing starts and when your package ships.${footer}`,
      };
    case ORDER_STATUS.PROCESSING:
      return {
        subject: `Order packing — #${shortId} | ${SITE_NAME}`,
        body: `Hi ${name},

Your order #${shortId} is now being packed at our warehouse.

Order total: ${total}

You'll receive another update with tracking details once it ships.${footer}`,
      };
    case ORDER_STATUS.SHIPPED:
      return {
        subject: `Order shipped — #${shortId} | ${SITE_NAME}`,
        body: `Hi ${name},

Your Rakhi order #${shortId} is on its way!

${trackingLines || "Tracking details will appear on your order page shortly."}

Order total: ${total}

Typical USA delivery is 5–7 business days after dispatch (faster to many metros).${footer}`,
      };
    case ORDER_STATUS.DELIVERED:
      return {
        subject: `Order delivered — #${shortId} | ${SITE_NAME}`,
        body: `Hi ${name},

Your order #${shortId} has been marked as delivered.

We hope your brother loves his Rakhi! If anything looks wrong with the package, reply to this email and we'll help right away.${footer}`,
      };
    case ORDER_STATUS.COMPLETE:
      return {
        subject: `Order complete — #${shortId} | ${SITE_NAME}`,
        body: `Hi ${name},

Your order #${shortId} is complete. Thank you for celebrating Raksha Bandhan with ${SITE_NAME}.

We'd love a quick review when you have a moment: ${siteUrl()}/reviews${footer}`,
      };
    case ORDER_STATUS.CANCELLED:
      return {
        subject: `Order cancelled — #${shortId} | ${SITE_NAME}`,
        body: `Hi ${name},

Your order #${shortId} has been cancelled.

Order total: ${total}

If you did not request this or have questions about a refund, reply to this email and our team will help.${footer}`,
      };
    case ORDER_STATUS.REFUNDED:
      return {
        subject: `Refund processed — #${shortId} | ${SITE_NAME}`,
        body: `Hi ${name},

A refund has been processed for order #${shortId}.

Order total: ${total}

Depending on your bank or payment method, the credit may take a few business days to appear. Questions? Just reply to this email.${footer}`,
      };
    default:
      return null;
  }
}

/**
 * Daily SMTP reminder while an order is still pending_payment (through 28 Aug 2026).
 * Do NOT use SES — transactional path only.
 */
export async function sendPendingPaymentReminderEmail(order: Order): Promise<EmailSendResult> {
  if (!smtpConfigured()) {
    return { ok: false, skipped: true, error: "SMTP not configured" };
  }

  const customerEmail = order.shippingAddress?.email?.trim();
  if (!customerEmail?.includes("@")) {
    return { ok: false, skipped: true, error: "No customer email" };
  }

  const name = order.shippingAddress?.name?.split(" ")[0] ?? "there";
  const shortId = order.orderId.slice(0, 8).toUpperCase();
  const total = `${order.currency} ${order.total.toFixed(2)}`;
  const count = (order.pendingPaymentReminderCount ?? 0) + 1;
  const orderUrl = `${siteUrl()}/orders/${order.orderId}`;
  const checkoutUrl = `${siteUrl()}/checkout`;
  const unsubUrl = `${siteUrl()}/unsubscribe/payment-reminders?email=${encodeURIComponent(customerEmail)}`;

  const text = `Hi ${name},

This is a friendly reminder — your Rakhi order #${shortId} is still waiting for payment.

Order total: ${total}
Status: Payment pending

Complete payment so we can pack and ship your Rakhi for Raksha Bandhan 2026 (August 28):
→ ${orderUrl}
→ ${checkoutUrl}

We'll keep reminding you once a day until payment is completed (last reminder day: August 28, 2026).

Questions? Reply to this email or WhatsApp us.

— ${SITE_NAME} Team
${siteUrl()}
(Reminder #${count})

---
Don't want payment reminders? Unsubscribe here (you will still get order updates if you pay):
${unsubUrl}`;

  const emailResult = await sendEmail({
    to: customerEmail,
    subject: `Payment reminder — order #${shortId} | ${SITE_NAME}`,
    text,
    replyTo: notifyAddress(),
  });

  await notifyCustomerWhatsApp({
    phone: order.shippingAddress?.phone,
    context: "pending-payment",
    message: pendingPaymentWhatsAppMessage({
      name,
      orderId: order.orderId,
      totalLabel: total,
    }),
  });

  return emailResult;
}

/**
 * Transactional customer email on admin order-status change.
 * Uses SMTP via sendEmail() (same path as paid confirmation / review request).
 * Do NOT use SES here — SES is reserved for marketing campaigns (/ses-email/*).
 * Skips pending_payment and unknown statuses. Status update still succeeds if SMTP is down.
 */
export async function notifyCustomerOrderStatusChange(order: Order): Promise<EmailSendResult> {
  if (!smtpConfigured()) {
    return { ok: false, skipped: true, error: "SMTP not configured" };
  }

  const customerEmail = order.shippingAddress?.email?.trim();
  if (!customerEmail?.includes("@")) {
    return { ok: false, skipped: true, error: "No customer email" };
  }

  const content = customerStatusEmailContent(order);
  if (!content) {
    return { ok: true, skipped: true };
  }

  const emailResult = await sendEmail({
    to: customerEmail,
    subject: content.subject,
    text: content.body,
    replyTo: notifyAddress(),
  });

  await notifyCustomerWhatsApp({
    phone: order.shippingAddress?.phone,
    context: `order-status-${order.status}`,
    message: orderStatusWhatsAppMessage({
      name: order.shippingAddress?.name?.split(" ")[0],
      orderId: order.orderId,
      status: order.status,
      totalLabel: `${order.currency} ${order.total.toFixed(2)}`,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
    }),
  });

  return emailResult;
}

export async function sendReviewRequestEmail(order: Order): Promise<EmailSendResult> {
  if (!smtpConfigured()) {
    return { ok: false, skipped: true, error: "SMTP not configured" };
  }

  const customerEmail = order.shippingAddress?.email?.trim();
  if (!customerEmail?.includes("@")) {
    return { ok: false, skipped: true, error: "No customer email" };
  }

  const name = order.shippingAddress?.name?.split(" ")[0] ?? "there";
  const shortId = order.orderId.slice(0, 8).toUpperCase();
  const reviewUrl = `${siteUrl()}/reviews`;

  const text = `Hi ${name},

We hope your Rakhi order #${shortId} arrived safely and made Raksha Bandhan special!

We're UsaRakhi — dedicated to Rakhi and Raksha Bandhan traditions — and your feedback helps other sisters trust us for USA Rakhi delivery.

Would you take 30 seconds to share your experience?
${reviewUrl}

You can mention delivery speed, packaging, or how your brother liked the Rakhi. We read every review.

Thank you for choosing ${SITE_NAME}.

— Team ${SITE_NAME}
${siteUrl()}
WhatsApp / support: ${notifyAddress()}`;

  const emailResult = await sendEmail({
    to: customerEmail,
    subject: `How was your Rakhi delivery? — ${SITE_NAME}`,
    text,
    replyTo: notifyAddress(),
  });

  await notifyCustomerWhatsApp({
    phone: order.shippingAddress?.phone,
    context: "review-request",
    message: reviewRequestWhatsAppMessage({
      name,
      orderId: order.orderId,
    }),
  });

  return emailResult;
}

function formatCartLines(items: CartItem[], currency: string): string {
  if (!items.length) return "  (items in your cart)";
  return items
    .map((i) => `  • ${i.quantity}× ${i.name} — ${i.currency ?? currency} ${(i.price * i.quantity).toFixed(2)}`)
    .join("\n");
}

export async function sendAbandonedCartEmail(input: {
  email: string;
  name: string;
  phone?: string;
  items: CartItem[];
  value: number;
  currency: string;
  couponCode: string;
  expiresAt: string;
  reminder: 1 | 2;
}): Promise<EmailSendResult> {
  if (!smtpConfigured()) {
    return { ok: false, skipped: true, error: "SMTP not configured on server" };
  }

  const expiryLabel = input.expiresAt
    ? new Date(input.expiresAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/New_York",
      })
    : "4 hours";

  const cartLines = formatCartLines(input.items, input.currency);
  const totalLabel = `${input.currency} ${input.value.toFixed(2)}`;
  const reminderLine =
    input.reminder === 1
      ? "You left some beautiful Rakhis in your cart."
      : "Still thinking it over? Your cart is waiting — plus an extra nudge from us.";

  const text = `Hi ${input.name},

${reminderLine}

Your cart (${totalLabel}):
${cartLines}

Complete checkout with ${ABANDONED_CART_DISCOUNT_PERCENT}% off — use code ${input.couponCode} at checkout.
Valid until: ${expiryLabel}

→ https://www.usarakhi.com/cart
→ https://www.usarakhi.com/checkout

Raksha Bandhan 2026 is August 28 — order early for on-time USA delivery.

— ${SITE_NAME} Team
order@usarakhi.com`;

  const emailResult = await sendEmail({
    to: input.email,
    subject:
      input.reminder === 1
        ? `You left items in your cart — ${ABANDONED_CART_DISCOUNT_PERCENT}% off inside`
        : `Last chance: ${ABANDONED_CART_DISCOUNT_PERCENT}% off your cart (${input.couponCode})`,
    text,
  });

  await notifyCustomerWhatsApp({
    phone: input.phone,
    context: `abandoned-cart-${input.reminder}`,
    message: abandonedCartWhatsAppMessage({
      name: input.name,
      couponCode: input.couponCode,
      discountPercent: ABANDONED_CART_DISCOUNT_PERCENT,
      expiresAt: input.expiresAt || undefined,
      reminder: input.reminder,
    }),
  });

  return emailResult;
}

/** Customer + staff alerts when an admin issues an abandoned-cart or confirmed-sale coupon. */
export async function sendAdminAbandonedCouponEmails(input: {
  customerEmail?: string;
  phone?: string;
  code: string;
  discountPercent: number;
  expiresAt: string;
  hours?: number;
  confirmedSale?: boolean;
  createdByAdminEmail: string;
  whatsappDeepLink?: string;
}): Promise<{ customer: EmailSendResult; notify: EmailSendResult }> {
  const expiryLabel = new Date(input.expiresAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York",
  });
  const hours = input.hours ?? 1;
  const hoursLabel = hours === 1 ? "1 hour" : `${hours} hours`;
  const saleTag = input.confirmedSale ? "Confirmed sale · " : "";
  const checkoutUrl = `${siteUrl()}/checkout`;
  const bindLines = [
    input.customerEmail ? `Email at checkout: ${input.customerEmail}` : null,
    input.phone ? `Phone at checkout: ${input.phone}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const customerText = `Hi,

${
  input.confirmedSale
    ? "Thank you for confirming your UsaRakhi order. Here is your reserved discount:"
    : "Thank you for considering UsaRakhi. We've reserved a personal discount for you:"
}

Coupon code: ${input.code}
Discount: ${input.discountPercent}% off${input.confirmedSale ? " (Confirmed sale)" : ""}
Valid for: ${hoursLabel} (until ${expiryLabel} ET)
${bindLines}

Use this code at checkout with the matching email or phone above:
${checkoutUrl}

Questions? Reply to this email or WhatsApp us.

— ${SITE_NAME} Team
${siteUrl()}`;

  const notifyTo = [
    "order@mydgv.com",
    "priya.yadav@mydgv.com",
    input.createdByAdminEmail.trim().toLowerCase(),
  ]
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(",");

  const waLine = input.whatsappDeepLink
    ? `\nOpen WhatsApp to customer:\n${input.whatsappDeepLink}\n`
    : "";

  const notifyText = `Admin ${input.confirmedSale ? "CONFIRMED SALE" : "abandoned-cart"} coupon generated

Customer email: ${input.customerEmail ?? "(none)"}
Phone: ${input.phone ?? "(none)"}
Coupon: ${input.code}
Discount: ${input.discountPercent}%${input.confirmedSale ? " (Confirmed sale)" : ""}
Expires: ${expiryLabel} ET (${hoursLabel})
Generated by: ${input.createdByAdminEmail}
${waLine}
${input.customerEmail ? "Customer was emailed this coupon." : "No customer email — coupon not emailed to shopper."}

— ${SITE_NAME} Admin`;

  const customer = input.customerEmail
    ? await sendEmail({
        to: input.customerEmail,
        subject: `${saleTag}Your ${input.discountPercent}% UsaRakhi coupon (${input.code}) — valid ${hoursLabel}`,
        text: customerText,
        replyTo: notifyAddress(),
      })
    : { ok: false, error: "No customer email provided" };

  const notifySubjectTarget = input.customerEmail ?? input.phone ?? "customer";
  const notify = await sendEmail({
    to: notifyTo,
    subject: `[Coupon]${input.confirmedSale ? " Confirmed sale" : ""} ${input.discountPercent}% ${input.code} → ${notifySubjectTarget}`,
    text: notifyText,
  });

  return { customer, notify };
}

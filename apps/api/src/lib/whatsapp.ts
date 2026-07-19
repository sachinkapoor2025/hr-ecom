/**
 * Optional WhatsApp customer notifications (Meta Cloud API and/or Twilio).
 * Always additive — never blocks email or order flows. Skips quietly when
 * credentials / phone are missing.
 */

export type WhatsAppSendResult = {
  ok: boolean;
  skipped?: boolean;
  provider?: "meta" | "twilio" | "deeplink";
  error?: string;
  /** Always useful for admin one-click send if API is unavailable. */
  deepLink: string;
};

const SITE = "UsaRakhi";
const SITE_URL = () => (process.env.SITE_URL ?? "https://www.usarakhi.com").replace(/\/$/, "");

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** True when Meta or Twilio WhatsApp credentials are present. */
export function whatsappApiConfigured(): boolean {
  const metaToken = process.env.WHATSAPP_TOKEN?.trim() || process.env.META_WHATSAPP_TOKEN?.trim();
  const metaPhone =
    process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || process.env.META_WHATSAPP_PHONE_NUMBER_ID?.trim();
  const twilio =
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
    process.env.TWILIO_AUTH_TOKEN?.trim() &&
    process.env.TWILIO_WHATSAPP_FROM?.trim();
  return Boolean((metaToken && metaPhone) || twilio);
}

/** Build wa.me URL with pre-filled message. */
export function buildWhatsAppDeepLink(phone: string, message: string): string {
  const digits = digitsOnly(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function formatExpiryEt(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York",
  });
}

export function abandonedCouponWhatsAppMessage(input: {
  code: string;
  discountPercent: number;
  expiresAt: string;
  checkoutUrl?: string;
}): string {
  const expiry = formatExpiryEt(input.expiresAt);
  const url = input.checkoutUrl ?? `${SITE_URL()}/checkout`;
  return `Hi! This is ${SITE}. Complete your Rakhi order with ${input.discountPercent}% off using code ${input.code}. Valid until ${expiry} (ET). Checkout: ${url}`;
}

export function welcomeCouponWhatsAppMessage(input: {
  code: string;
  discountPercent: number;
  expiresAt: string;
}): string {
  const expiry = formatExpiryEt(input.expiresAt);
  return `Hi! You spun Discount of the Day at ${SITE}.

Your code: ${input.code}
Discount: ${input.discountPercent}% off
Valid until: ${expiry} (ET)

Checkout: ${SITE_URL()}/checkout
Shop: ${SITE_URL()}/products`;
}

export function abandonedCartWhatsAppMessage(input: {
  name?: string;
  couponCode: string;
  discountPercent: number;
  expiresAt?: string;
  reminder: 1 | 2;
}): string {
  const hi = input.name ? `Hi ${input.name}` : "Hi";
  const expiry = input.expiresAt ? ` Valid until ${formatExpiryEt(input.expiresAt)} (ET).` : "";
  const nudge =
    input.reminder === 1
      ? "You left Rakhis in your cart."
      : "Still thinking it over? Your cart is waiting.";
  return `${hi}! ${nudge}

Use code ${input.couponCode} for ${input.discountPercent}% off.${expiry}

Cart: ${SITE_URL()}/cart
Checkout: ${SITE_URL()}/checkout

— ${SITE}`;
}

export function orderPaidWhatsAppMessage(input: {
  name?: string;
  orderId: string;
  totalLabel: string;
}): string {
  const hi = input.name ? `Hi ${input.name}` : "Hi";
  const shortId = input.orderId.slice(0, 8).toUpperCase();
  return `${hi}! Payment received for your ${SITE} order #${shortId}.

Total: ${input.totalLabel}
Track: ${SITE_URL()}/orders/${input.orderId}

We deliver to all 50 US states in 5–7 business days after dispatch.`;
}

export function orderStatusWhatsAppMessage(input: {
  name?: string;
  orderId: string;
  status: string;
  totalLabel?: string;
  carrier?: string;
  trackingNumber?: string;
}): string | null {
  const hi = input.name ? `Hi ${input.name}` : "Hi";
  const shortId = input.orderId.slice(0, 8).toUpperCase();
  const orderUrl = `${SITE_URL()}/orders/${input.orderId}`;
  const total = input.totalLabel ? `\nTotal: ${input.totalLabel}` : "";

  switch (input.status) {
    case "paid":
      return orderPaidWhatsAppMessage({
        name: input.name,
        orderId: input.orderId,
        totalLabel: input.totalLabel ?? "",
      });
    case "accepted":
      return `${hi}! We've accepted your Rakhi order #${shortId}.${total}\n\nTrack: ${orderUrl}`;
    case "processing":
      return `${hi}! Order #${shortId} is being packed at our warehouse.${total}\n\nTrack: ${orderUrl}`;
    case "shipped": {
      const track = [
        input.carrier ? `Carrier: ${input.carrier}` : null,
        input.trackingNumber ? `Tracking: ${input.trackingNumber}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      return `${hi}! Your Rakhi order #${shortId} has shipped!\n${track || "Tracking will appear on your order page shortly."}${total}\n\nTrack: ${orderUrl}`;
    }
    case "delivered":
      return `${hi}! Order #${shortId} is marked delivered. We hope your brother loves his Rakhi!\n\n${orderUrl}`;
    case "complete":
      return `${hi}! Order #${shortId} is complete. Thank you for celebrating with ${SITE}.\n\nLeave a review: ${SITE_URL()}/reviews`;
    case "cancelled":
      return `${hi}! Order #${shortId} has been cancelled.${total}\n\nQuestions? Reply here or visit ${orderUrl}`;
    case "refunded":
      return `${hi}! A refund for order #${shortId} has been processed.${total}\n\nIt may take a few business days to appear. ${orderUrl}`;
    default:
      return null;
  }
}

export function pendingPaymentWhatsAppMessage(input: {
  name?: string;
  orderId: string;
  totalLabel: string;
}): string {
  const hi = input.name ? `Hi ${input.name}` : "Hi";
  const shortId = input.orderId.slice(0, 8).toUpperCase();
  return `${hi}! Friendly reminder — your ${SITE} order #${shortId} is still waiting for payment.

Total: ${input.totalLabel}
Pay here: ${SITE_URL()}/orders/${input.orderId}

Complete payment so we can pack and ship for Raksha Bandhan.`;
}

export function reviewRequestWhatsAppMessage(input: {
  name?: string;
  orderId: string;
}): string {
  const hi = input.name ? `Hi ${input.name}` : "Hi";
  const shortId = input.orderId.slice(0, 8).toUpperCase();
  return `${hi}! We hope order #${shortId} arrived safely. Would you share a quick review?

${SITE_URL()}/reviews

Thank you for choosing ${SITE}!`;
}

export function contactAckWhatsAppMessage(input: { name?: string }): string {
  const hi = input.name ? `Hi ${input.name}` : "Hi";
  return `${hi}! Thanks for contacting ${SITE}. We received your message and will reply soon (usually within 24 hours).

For urgent help, keep chatting here or email order@usarakhi.com.`;
}

async function sendViaMeta(toDigits: string, body: string): Promise<Omit<WhatsAppSendResult, "deepLink">> {
  const token = process.env.WHATSAPP_TOKEN?.trim() || process.env.META_WHATSAPP_TOKEN?.trim();
  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || process.env.META_WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (!token || !phoneNumberId) {
    return { ok: false, skipped: true, error: "Meta WhatsApp not configured" };
  }

  const template = process.env.WHATSAPP_TEMPLATE_NAME?.trim();
  const payload = template
    ? {
        messaging_product: "whatsapp",
        to: toDigits,
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG?.trim() || "en" },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: body.slice(0, 1024) }],
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to: toDigits,
        type: "text",
        text: { preview_url: true, body: body.slice(0, 4096) },
      };

  const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, provider: "meta", error: `Meta WhatsApp ${res.status}: ${text.slice(0, 300)}` };
  }
  return { ok: true, provider: "meta" };
}

async function sendViaTwilio(toDigits: string, body: string): Promise<Omit<WhatsAppSendResult, "deepLink">> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim(); // e.g. whatsapp:+14155238886
  if (!sid || !token || !from) {
    return { ok: false, skipped: true, error: "Twilio WhatsApp not configured" };
  }

  const params = new URLSearchParams({
    From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
    To: `whatsapp:+${toDigits}`,
    Body: body.slice(0, 1600),
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, provider: "twilio", error: `Twilio ${res.status}: ${text.slice(0, 300)}` };
  }
  return { ok: true, provider: "twilio" };
}

/** Send WhatsApp when a provider is configured; always returns a deep link fallback. */
export async function sendWhatsAppMessage(input: {
  phone: string;
  message: string;
}): Promise<WhatsAppSendResult> {
  const deepLink = buildWhatsAppDeepLink(input.phone, input.message);
  const toDigits = digitsOnly(input.phone);
  if (toDigits.length < 7) {
    return { ok: false, deepLink, error: "Invalid phone number" };
  }

  try {
    const meta = await sendViaMeta(toDigits, input.message);
    if (meta.ok) return { ...meta, deepLink };
    if (!meta.skipped) return { ...meta, deepLink };

    const twilio = await sendViaTwilio(toDigits, input.message);
    if (twilio.ok) return { ...twilio, deepLink };
    if (!twilio.skipped) return { ...twilio, deepLink };

    return {
      ok: false,
      skipped: true,
      provider: "deeplink",
      deepLink,
      error: "No WhatsApp API credentials — use deep link",
    };
  } catch (err) {
    return {
      ok: false,
      deepLink,
      error: err instanceof Error ? err.message : "WhatsApp send failed",
    };
  }
}

/**
 * Fire-and-forget customer WhatsApp. Never throws.
 * Skips when phone missing or APIs not configured (email remains primary).
 */
export async function notifyCustomerWhatsApp(input: {
  phone?: string | null;
  message: string | null | undefined;
  context?: string;
}): Promise<WhatsAppSendResult | null> {
  const phone = input.phone?.trim();
  const message = input.message?.trim();
  if (!phone || !message) return null;
  if (!whatsappApiConfigured()) return null;

  try {
    const result = await sendWhatsAppMessage({ phone, message });
    if (!result.ok && !result.skipped) {
      console.error("WhatsApp notify failed", {
        context: input.context,
        error: result.error,
        provider: result.provider,
      });
    } else if (result.ok) {
      console.log("WhatsApp notify sent", {
        context: input.context,
        provider: result.provider,
      });
    }
    return result;
  } catch (err) {
    console.error("WhatsApp notify exception", {
      context: input.context,
      error: err instanceof Error ? err.message : err,
    });
    return null;
  }
}

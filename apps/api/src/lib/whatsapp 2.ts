/** Optional WhatsApp send for admin-generated abandoned-cart coupons. */

export type WhatsAppSendResult = {
  ok: boolean;
  skipped?: boolean;
  provider?: "meta" | "twilio" | "deeplink";
  error?: string;
  /** Always useful for admin one-click send if API is unavailable. */
  deepLink: string;
};

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Build wa.me URL with pre-filled coupon message. */
export function buildWhatsAppDeepLink(phone: string, message: string): string {
  const digits = digitsOnly(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function abandonedCouponWhatsAppMessage(input: {
  code: string;
  discountPercent: number;
  expiresAt: string;
  checkoutUrl?: string;
}): string {
  const expiry = new Date(input.expiresAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York",
  });
  const url = input.checkoutUrl ?? "https://www.usarakhi.com/checkout";
  return `Hi! This is UsaRakhi. Complete your Rakhi order with ${input.discountPercent}% off using code ${input.code}. Valid until ${expiry} (ET). Checkout: ${url}`;
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

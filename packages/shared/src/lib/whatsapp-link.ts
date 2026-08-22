/**
 * Build wa.me links from the phone saved on the order (checkout shipping phone).
 * WhatsApp requires country-code digits with no + or spaces.
 */

const DEFAULT_SITE_COUNTRY = "US";

export function digitsOnlyPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Normalize the order phone to WhatsApp digits (country code included).
 * 10-digit numbers use the shipping-address country, defaulting to +1 (USA).
 */
export function whatsappDigitsForOrderPhone(
  phone?: string | null,
  countryIso?: string | null
): string | null {
  const raw = phone?.trim();
  if (!raw) return null;
  const digits = digitsOnlyPhone(raw);
  if (digits.length < 10 || digits.length > 15) return null;

  if (raw.startsWith("+") && digits.length >= 10) return digits;
  if (digits.length >= 11 && digits.length <= 15) return digits;

  const iso = (countryIso ?? DEFAULT_SITE_COUNTRY).toUpperCase();
  if (digits.length === 10) {
    if (iso === "IN") return `91${digits}`;
    return `1${digits}`;
  }
  return digits;
}

export function formatWhatsAppDisplayNumber(digits: string): string {
  if (digits.startsWith("1") && digits.length === 11) {
    return `+1 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.startsWith("91") && digits.length === 12) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}

/** Open the customer's WhatsApp chat with a pre-filled message (no Twilio). */
export function buildWhatsAppDeepLink(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

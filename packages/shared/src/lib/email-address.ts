import { z } from "zod";

export const EMAIL_ADDRESS_MESSAGE = "Please enter a valid email address.";

/**
 * Requires one @, a dotted domain, and a letter TLD of at least two characters.
 * HTML email inputs accept test@gmail and test@gmailcom; those are rejected here.
 */
export function isValidEmailAddress(value: string): boolean {
  const email = value.trim();
  if (email.length < 3 || email.length > 254) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  const domain = email.slice(email.lastIndexOf("@") + 1);
  const labels = domain.split(".");
  if (labels.some((label) => label.length === 0)) return false;
  const tld = labels[labels.length - 1] ?? "";
  return /^[A-Za-z]{2,63}$/.test(tld);
}

/** Required address. Trims input and rejects missing domain extensions. */
export const emailAddressSchema = z
  .string()
  .trim()
  .max(254, EMAIL_ADDRESS_MESSAGE)
  .refine(isValidEmailAddress, EMAIL_ADDRESS_MESSAGE);

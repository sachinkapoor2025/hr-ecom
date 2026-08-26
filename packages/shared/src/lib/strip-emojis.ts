/**
 * Remove emoji (and ZWJ / variation selectors) from customer notification copy.
 * Leaves punctuation, arrows (→), dashes, and newlines intact.
 */
const EMOJI_CHARS = /\p{Extended_Pictographic}/gu;
const EMOJI_JOINERS = /[\uFE0F\u200D]/g;

export function stripEmojis(text: string): string {
  if (!text) return text;
  return text
    .replace(EMOJI_CHARS, "")
    .replace(EMOJI_JOINERS, "")
    .replace(/[^\S\n]{2,}/g, " ")
    .replace(/[^\S\n]+$/gm, "")
    .replace(/^[^\S\n]+/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

export function containsEmoji(text: string): boolean {
  EMOJI_CHARS.lastIndex = 0;
  return EMOJI_CHARS.test(text) || /[\uFE0F\u200D]/.test(text);
}

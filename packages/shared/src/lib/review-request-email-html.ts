function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Stacked table buttons — email-safe on Gmail/Outlook desktop and mobile. */
function reviewCtaButton(label: string, href: string, bg: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px 0;">
  <tr>
    <td bgcolor="${bg}" style="border-radius:8px;">
      <a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`;
}

function isWebsiteReviewCtaLine(line: string, websiteReviewUrl: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (/^(👉\s*)?(share your review|leave a review):?/i.test(t)) return true;
  return Boolean(websiteReviewUrl) && t === websiteReviewUrl;
}

function isGoogleReviewCtaLine(line: string, googleReviewUrl: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (/^review us on google:?/i.test(t)) return true;
  return Boolean(googleReviewUrl) && t === googleReviewUrl;
}

const REVIEW_CTA_MARKER = "@@REVIEW_CTAS@@";

/**
 * Same HTML format as other transactional mail (`text.replace(/\n/g, "<br>")`),
 * with Leave a Review / Google lines turned into stacked buttons.
 * No separate card/layout — matches order-status / paid confirmation emails.
 */
export function buildReviewRequestEmailHtml(input: {
  bodyText: string;
  websiteReviewUrl: string;
  googleReviewUrl?: string;
}): string {
  const website = input.websiteReviewUrl.trim();
  const google = input.googleReviewUrl?.trim() ?? "";
  const lines = input.bodyText.split(/\r?\n/);
  const kept: string[] = [];
  let inserted = false;

  for (const line of lines) {
    if (isWebsiteReviewCtaLine(line, website) || isGoogleReviewCtaLine(line, google)) {
      if (!inserted) {
        kept.push(REVIEW_CTA_MARKER);
        inserted = true;
      }
      continue;
    }
    kept.push(line);
  }

  if (!inserted) {
    const sigIdx = kept.findIndex((l) => /^— /.test(l.trim()) || /^Questions\?/i.test(l.trim()));
    if (sigIdx >= 0) {
      kept.splice(sigIdx, 0, REVIEW_CTA_MARKER, "");
    } else {
      kept.push("", REVIEW_CTA_MARKER);
    }
  }

  const text = kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  const buttons = [
    reviewCtaButton("Share Your Review", website, "#0f4c81"),
    google ? reviewCtaButton("Review us on Google", google, "#1a73e8") : "",
  ]
    .filter(Boolean)
    .join("");

  const body = text
    .split(REVIEW_CTA_MARKER)
    .map((part) => escapeHtml(part).replace(/\n/g, "<br>"))
    .join(buttons);

  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#1e293b;">${body}</div>`;
}

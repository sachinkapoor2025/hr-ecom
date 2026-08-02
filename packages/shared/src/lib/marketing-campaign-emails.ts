/**
 * Conversion-focused marketing email templates for UsaRakhi.
 *
 * Edit the CONFIG objects below to update images, copy, CTAs, and links —
 * then rebuild / open Admin → Email → Templates to sync starters.
 *
 * Both builders emit table + inline-CSS HTML for Gmail / Outlook / Apple Mail.
 */

import { cdnUploadUrl } from "./image-url";

const SITE = "https://www.usarakhi.com";
const SHOP = `${SITE}/products`;
const LOGO = `${SITE}/logo.png`;
const HERO = `${SITE}/banners/banner-1-usa-rakhi-delivery.png`;
const FB = `${SITE}/email-templates/icons/facebook.png`;
const IG = `${SITE}/email-templates/icons/instagram.png`;

// ─── Palette ───────────────────────────────────────────────────────────────
const NAVY = "#183a68";
const GOLD = "#c9a227";
const RED = "#c41e3a";
const CREAM = "#fff8ef";
const PAGE_BG = "#f3eee6";

export type CampaignCard = {
  name: string;
  description: string;
  imageUrl: string;
  href: string;
  buttonText: string;
  badge?: string;
  priceLabel?: string;
};

export type CampaignBenefit = {
  icon: string;
  title: string;
  description: string;
};

/** ═══════════════ TEMPLATE 1 — Free Shipping Above $7 ═══════════════ */
export const FREE_SHIPPING_EMAIL_CONFIG = {
  templateId: "free-shipping-above-7",
  name: "Free Shipping Above $7",
  subject: "FREE SHIPPING on Orders Above $7 (₹667.73) — UsaRakhi",
  preheader: "Free shipping on orders above $7 (₹667.73). Premium Rakhis ships from the USA.",
  logoUrl: LOGO,
  logoHref: SITE,
  heroImageUrl: HERO,
  heroImageHref: SHOP,
  heroImageAlt: "UsaRakhi — Free shipping on Rakhi orders above $7",
  offerEyebrow: "RAKSHA BANDHAN OFFER",
  offerHeadline: "FREE SHIPPING",
  offerSubhead: "On Orders Above $7 (₹667.73)",
  offerBody:
    "Send love across America with premium designer Rakhis — and enjoy free domestic shipping when your order is $7 or more. Ships from California. No customs delays.",
  ctaText: "Shop Now",
  ctaHref: SHOP,
  benefitsHeading: "Why Shop UsaRakhi",
  benefits: [
    { icon: "🚚", title: "Fast USA Delivery", description: "5–7 business days to all 50 states." },
    { icon: "✨", title: "Premium Quality Rakhis", description: "Designer threads, roli & chawal." },
    { icon: "🔒", title: "Secure Checkout", description: "Pay safely with Stripe or Razorpay." },
    { icon: "🇺🇸", title: "Ships From USA", description: "California fulfillment — no customs." },
  ] satisfies CampaignBenefit[],
  categoriesHeading: "Featured Rakhi Categories",
  categoriesSubheading: "Pick the perfect gift for every bond this Raksha Bandhan.",
  categories: [
    {
      name: "Single Rakhi",
      description: "Classic & designer threads for brother.",
      imageUrl: cdnUploadUrl("2026/05/pink-multi-stone-rakhi-to-usa.jpeg"),
      href: `${SITE}/single-rakhi-to-usa`,
      buttonText: "Shop Now",
    },
    {
      name: "Rakhi Combo",
      description: "Rakhi with chocolates & festive treats.",
      imageUrl: cdnUploadUrl("2026/05/fercho.png"),
      href: `${SITE}/rakhi-combo-to-usa`,
      buttonText: "Shop Now",
    },
    {
      name: "Kids Rakhi",
      description: "Fun designs little brothers love.",
      imageUrl: cdnUploadUrl("2026/04/BRO-Kids-Rakhi-e1775564401163.jpg"),
      href: `${SITE}/kids-rakhi-to-usa`,
      buttonText: "Shop Now",
    },
    {
      name: "Bhaiya Bhabhi",
      description: "Matching sets for brother & bhabhi.",
      imageUrl: cdnUploadUrl("2026/05/bhaiya-bhabhi-rakhi-to-usa-e1779468666580.jpeg"),
      href: `${SITE}/bhaiya-bhabhi-rakhi-to-usa`,
      buttonText: "Shop Now",
    },
  ] satisfies CampaignCard[],
  midCtaHeading: "Ready to Send Your Rakhi?",
  midCtaBody: "Orders $7+ ship free across the USA. Shop the festive collection today.",
  midCtaText: "Shop Free Shipping Deals",
  midCtaHref: SHOP,
  footerTagline: "Connecting Hearts Across Borders",
  websiteUrl: SITE,
  websiteLabel: "www.usarakhi.com",
  orderEmail: "order@usarakhi.com",
  facebookUrl: "https://www.facebook.com/usarakhi/",
  facebookIconUrl: FB,
  instagramUrl: "https://www.instagram.com/usarakhi/",
  instagramIconUrl: IG,
  copyrightText: "© 2026 UsaRakhi. All Rights Reserved.",
  unsubscribeLabel: "Unsubscribe",
} as const;

/** ═══════════════ TEMPLATE 2 — Starting at ₹265 / $2.75 ═══════════════ */
export const STARTING_PRICE_EMAIL_CONFIG = {
  templateId: "rakhi-starting-265",
  name: "Rakhi Starting at ₹265",
  subject: "Beautiful Rakhi Starting at Only ₹265 ($2.75) — Limited Time",
  preheader: "Limited time: beautiful Rakhis from ₹265 ($2.75). Grab this Raksha Bandhan offer.",
  logoUrl: LOGO,
  logoHref: SITE,
  heroImageUrl: HERO,
  heroImageHref: SHOP,
  heroImageAlt: "Beautiful Rakhi starting at ₹265 ($2.75) — UsaRakhi",
  urgencyText: "⚡ Limited Time Offer",
  offerEyebrow: "FESTIVE DEAL",
  offerHeadline: "Beautiful Rakhi",
  offerSubhead: "Starting at Only ₹265 ($2.75)",
  offerBody:
    "Celebrate Raksha Bandhan without stretching your budget. Explore premium designs — singles, sets, kids styles, and Bhaiya-Bhabhi pairs — with festive packaging and USA delivery.",
  ctaText: "Grab This Offer",
  ctaHref: SHOP,
  sections: [
    {
      heading: "Best Sellers",
      subheading: "Most-loved designs sisters order again and again.",
      cards: [
        {
          name: "Pink Multi-Stone Rakhi",
          description: "Elegant festive favorite for brother.",
          imageUrl: cdnUploadUrl("2026/05/pink-multi-stone-rakhi-to-usa.jpeg"),
          href: `${SITE}/single-rakhi-to-usa`,
          buttonText: "Shop Now",
          badge: "BEST SELLER",
          priceLabel: "From $2.75",
        },
        {
          name: "Om Designer Rakhi",
          description: "Spiritual motif with premium finish.",
          imageUrl: cdnUploadUrl("2026/03/Om-Single-Rakhi-1-e1779466859856.png"),
          href: `${SITE}/single-rakhi-to-usa`,
          buttonText: "Shop Now",
          badge: "HOT",
          priceLabel: "From $2.75",
        },
      ] satisfies CampaignCard[],
    },
    {
      heading: "Rakhi Sets",
      subheading: "Multi-piece packs for more than one brother.",
      cards: [
        {
          name: "Set of 2 Rakhis",
          description: "Coordinated twin packs — one delivery.",
          imageUrl: cdnUploadUrl("2026/05/pink-multi-stone-rakhi-to-usa.jpeg"),
          href: `${SITE}/2-set-rakhi-to-usa`,
          buttonText: "Shop Sets",
          badge: "SET",
          priceLabel: "Value pack",
        },
        {
          name: "Set of 3 Rakhis",
          description: "Perfect for multi-brother households.",
          imageUrl: cdnUploadUrl("2026/05/fercho.png"),
          href: `${SITE}/3-set-rakhi-to-usa`,
          buttonText: "Shop Sets",
          badge: "SET",
          priceLabel: "Value pack",
        },
      ] satisfies CampaignCard[],
    },
    {
      heading: "Kids Rakhis",
      subheading: "Cartoon-bright styles for little brothers.",
      cards: [
        {
          name: "BRO Kids Rakhi",
          description: "Soft, playful, child-friendly threads.",
          imageUrl: cdnUploadUrl("2026/04/BRO-Kids-Rakhi-e1775564401163.jpg"),
          href: `${SITE}/kids-rakhi-to-usa`,
          buttonText: "Shop Kids",
          badge: "KIDS",
          priceLabel: "From $2.75",
        },
        {
          name: "Chhota Bheem Kids",
          description: "Fun character designs kids adore.",
          imageUrl: cdnUploadUrl("2026/04/Chhota-Bheem-Kids-Rakhi-with-Assorted-Chocolates-e1775565435556.jpg"),
          href: `${SITE}/kids-rakhi-to-usa`,
          buttonText: "Shop Kids",
          badge: "KIDS",
          priceLabel: "Combo deals",
        },
      ] satisfies CampaignCard[],
    },
    {
      heading: "Bhaiya-Bhabhi Rakhis",
      subheading: "Matching rakhi + lumba sets for the couple.",
      cards: [
        {
          name: "Bhaiya Bhabhi Set",
          description: "Coordinated designs for brother & bhabhi.",
          imageUrl: cdnUploadUrl("2026/05/bhaiya-bhabhi-rakhi-to-usa-e1779468666580.jpeg"),
          href: `${SITE}/bhaiya-bhabhi-rakhi-to-usa`,
          buttonText: "Shop Sets",
          badge: "SET",
          priceLabel: "Gift ready",
        },
        {
          name: "Lumba Rakhi",
          description: "Bracelet-style elegance for bhabhi.",
          imageUrl: cdnUploadUrl("2026/04/Unique-pink-Lumba-Rakhi-e1779468035922.jpg"),
          href: `${SITE}/lumba-rakhi-to-usa`,
          buttonText: "Shop Lumba",
          badge: "NEW",
          priceLabel: "Premium",
        },
      ] satisfies CampaignCard[],
    },
  ],
  midCtaHeading: "Don't Miss This Festive Deal",
  midCtaBody: "Beautiful Rakhis from ₹265 ($2.75). Limited-time pricing — order for USA delivery today.",
  midCtaText: "Grab This Offer",
  midCtaHref: SHOP,
  footerTagline: "Connecting Hearts Across Borders",
  websiteUrl: SITE,
  websiteLabel: "www.usarakhi.com",
  orderEmail: "order@usarakhi.com",
  facebookUrl: "https://www.facebook.com/usarakhi/",
  facebookIconUrl: FB,
  instagramUrl: "https://www.instagram.com/usarakhi/",
  instagramIconUrl: IG,
  copyrightText: "© 2026 UsaRakhi. All Rights Reserved.",
  unsubscribeLabel: "Unsubscribe",
} as const;

// ─── Shared HTML helpers ───────────────────────────────────────────────────

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escAttr(value: string): string {
  return escapeHtml(value);
}

function ctaButton(
  href: string,
  label: string,
  opts?: { fill?: string; textColor?: string; width?: number; pad?: string; fontSize?: string }
) {
  const fill = opts?.fill ?? RED;
  const textColor = opts?.textColor ?? "#ffffff";
  const width = opts?.width ?? 200;
  const pad = opts?.pad ?? "15px 32px";
  const fontSize = opts?.fontSize ?? "16px";
  const safeHref = escAttr(href);
  const safeLabel = escapeHtml(label);
  return `
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeHref}" style="height:50px;v-text-anchor:middle;width:${width}px;" arcsize="16%" stroke="f" fillcolor="${fill}">
                      <w:anchorlock/>
                      <center style="color:${textColor};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize};font-weight:bold;">${safeLabel}</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-- -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 auto;">
                      <tr>
                        <td align="center" bgcolor="${fill}" style="background-color:${fill};border-radius:10px;">
                          <a href="${safeHref}" target="_blank" style="display:inline-block;padding:${pad};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize};line-height:20px;font-weight:bold;color:${textColor};text-decoration:none;border-radius:10px;">
                            ${safeLabel}
                          </a>
                        </td>
                      </tr>
                    </table>
                    <!--<![endif]-->`;
}

function productCard(card: CampaignCard, opts?: { showBadge?: boolean }): string {
  const href = escAttr(card.href);
  const img = escAttr(card.imageUrl);
  const name = escapeHtml(card.name);
  const desc = escapeHtml(card.description);
  const btn = escapeHtml(card.buttonText);
  const badge = card.badge ? escapeHtml(card.badge) : "";
  const price = card.priceLabel ? escapeHtml(card.priceLabel) : "";
  return `
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:#ffffff;border:1px solid #efe6d6;border-radius:12px;overflow:hidden;">
                      <tr>
                        <td align="center" style="padding:0;line-height:0;font-size:0;background-color:${CREAM};position:relative;">
                          <a href="${href}" target="_blank" style="text-decoration:none;">
                            <img class="card-img fluid" src="${img}" width="260" alt="${name}" style="display:block;width:100%;max-width:260px;height:auto;border:0;margin:0 auto;" />
                          </a>
                        </td>
                      </tr>
                      ${
                        opts?.showBadge !== false && badge
                          ? `<tr>
                        <td align="center" style="padding:10px 12px 0 12px;">
                          <span style="display:inline-block;padding:4px 10px;background-color:${RED};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:0.5px;border-radius:999px;">${badge}</span>
                        </td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td align="center" style="padding:12px 14px 18px 14px;">
                          <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:22px;font-weight:bold;color:${NAVY};padding-bottom:6px;">${name}</div>
                          ${price ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;font-weight:bold;color:${RED};padding-bottom:6px;">${price}</div>` : ""}
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6b5e4e;padding-bottom:12px;">${desc}</div>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                            <tr>
                              <td align="center" bgcolor="${GOLD}" style="background-color:${GOLD};border-radius:8px;">
                                <a href="${href}" target="_blank" style="display:inline-block;padding:10px 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;font-weight:bold;color:${NAVY};text-decoration:none;border-radius:8px;">${btn}</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>`;
}

function twoColCards(cards: CampaignCard[]): string {
  const a = cards[0];
  const b = cards[1];
  if (!a) return "";
  return `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td class="stack-col" width="50%" valign="top" style="width:50%;padding:0 6px 14px 0;">
                    ${productCard(a)}
                  </td>
                  <td class="stack-col" width="50%" valign="top" style="width:50%;padding:0 0 14px 6px;">
                    ${b ? productCard(b) : "&nbsp;"}
                  </td>
                </tr>
              </table>`;
}

function benefitsRow(benefits: readonly CampaignBenefit[]): string {
  const cells = benefits
    .slice(0, 4)
    .map(
      (b, i) => `
                  <td class="stack-col-25" width="25%" valign="top" style="width:25%;padding:${i === 0 ? "0 4px 10px 0" : i === 3 ? "0 0 10px 4px" : "0 4px 10px 4px"};">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:#ffffff;border:1px solid #efe6d6;border-radius:12px;">
                      <tr>
                        <td align="center" style="padding:16px 10px;">
                          <div style="font-size:22px;line-height:28px;padding-bottom:8px;">${escapeHtml(b.icon)}</div>
                          <div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:17px;font-weight:bold;color:${NAVY};padding-bottom:4px;">${escapeHtml(b.title)}</div>
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:15px;color:#6b5e4e;">${escapeHtml(b.description)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>`
    )
    .join("");
  return `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                <tr>${cells}</tr>
              </table>`;
}

function emailShell(opts: {
  title: string;
  preheader: string;
  logoUrl: string;
  logoHref: string;
  bodyRows: string;
  footer: {
    tagline: string;
    websiteUrl: string;
    websiteLabel: string;
    orderEmail: string;
    facebookUrl: string;
    facebookIconUrl: string;
    instagramUrl: string;
    instagramIconUrl: string;
    copyrightText: string;
    unsubscribeLabel: string;
  };
}): string {
  const f = opts.footer;
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>${escapeHtml(opts.title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style type="text/css">
    table { border-collapse: collapse; }
    td, th, div, p, a, h1, h2, h3, span { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .fluid { width: 100% !important; max-width: 100% !important; height: auto !important; }
      .stack-col { display: block !important; width: 100% !important; max-width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
      .stack-col-25 { display: inline-block !important; width: 50% !important; max-width: 50% !important; box-sizing: border-box !important; }
      .mobile-pad { padding-left: 18px !important; padding-right: 18px !important; }
      .hero-title { font-size: 30px !important; line-height: 36px !important; }
      .section-title { font-size: 22px !important; line-height: 28px !important; }
      .card-img { width: 100% !important; max-width: 100% !important; height: auto !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${PAGE_BG};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(opts.preheader)}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:${PAGE_BG};">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="border-collapse:collapse;width:600px;max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;">
          <!-- Logo -->
          <tr>
            <td align="center" bgcolor="#fffdf8" style="padding:20px 24px 14px 24px;background-color:#fffdf8;">
              <a href="${escAttr(opts.logoHref)}" target="_blank" style="text-decoration:none;">
                <img src="${escAttr(opts.logoUrl)}" width="168" alt="UsaRakhi" style="display:block;width:168px;max-width:70%;height:auto;border:0;margin:0 auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td height="5" style="height:5px;line-height:5px;font-size:0;background-color:${NAVY};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td width="70%" height="5" bgcolor="${NAVY}" style="background-color:${NAVY};font-size:0;line-height:5px;">&nbsp;</td>
                  <td width="30%" height="5" bgcolor="${GOLD}" style="background-color:${GOLD};font-size:0;line-height:5px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          ${opts.bodyRows}
          <!-- Footer -->
          <tr>
            <td class="mobile-pad" style="padding:32px 28px 36px 28px;background-color:${NAVY};text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td align="center" style="padding:0 0 14px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:20px;color:#f0d78c;">
                    ${escapeHtml(f.tagline)}
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#d7dde8;">
                    Website:
                    <a href="${escAttr(f.websiteUrl)}" target="_blank" style="color:#f0d78c;text-decoration:underline;">${escapeHtml(f.websiteLabel)}</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#d7dde8;">
                    Orders:
                    <a href="mailto:${escAttr(f.orderEmail)}" style="color:#f0d78c;text-decoration:underline;">${escapeHtml(f.orderEmail)}</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9aa8c0;">
                    Follow us
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 16px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 auto;">
                      <tr>
                        <td style="padding:0 8px;">
                          <a href="${escAttr(f.facebookUrl)}" target="_blank" style="text-decoration:none;">
                            <img src="${escAttr(f.facebookIconUrl)}" width="36" height="36" alt="Facebook" style="display:block;border:0;width:36px;height:36px;" />
                          </a>
                        </td>
                        <td style="padding:0 8px;">
                          <a href="${escAttr(f.instagramUrl)}" target="_blank" style="text-decoration:none;">
                            <img src="${escAttr(f.instagramIconUrl)}" width="36" height="36" alt="Instagram" style="display:block;border:0;width:36px;height:36px;" />
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9aa8c0;">
                    ${escapeHtml(f.copyrightText)}
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9aa8c0;">
                    <a href="{{unsubscribe}}" target="_blank" style="color:#f0d78c;text-decoration:underline;">${escapeHtml(f.unsubscribeLabel)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function footerFrom(cfg: {
  footerTagline: string;
  websiteUrl: string;
  websiteLabel: string;
  orderEmail: string;
  facebookUrl: string;
  facebookIconUrl: string;
  instagramUrl: string;
  instagramIconUrl: string;
  copyrightText: string;
  unsubscribeLabel: string;
}) {
  return {
    tagline: cfg.footerTagline,
    websiteUrl: cfg.websiteUrl,
    websiteLabel: cfg.websiteLabel,
    orderEmail: cfg.orderEmail,
    facebookUrl: cfg.facebookUrl,
    facebookIconUrl: cfg.facebookIconUrl,
    instagramUrl: cfg.instagramUrl,
    instagramIconUrl: cfg.instagramIconUrl,
    copyrightText: cfg.copyrightText,
    unsubscribeLabel: cfg.unsubscribeLabel,
  };
}

/** Template 1 HTML — Free shipping above $7. */
export function buildFreeShippingEmailHtml(
  cfg: typeof FREE_SHIPPING_EMAIL_CONFIG = FREE_SHIPPING_EMAIL_CONFIG
): string {
  const bodyRows = `
          <!-- Hero image -->
          <tr>
            <td align="center" style="padding:0;line-height:0;font-size:0;">
              <a href="${escAttr(cfg.heroImageHref)}" target="_blank" style="text-decoration:none;">
                <img class="fluid" src="${escAttr(cfg.heroImageUrl)}" width="600" alt="${escAttr(cfg.heroImageAlt)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
              </a>
            </td>
          </tr>
          <!-- Offer hero -->
          <tr>
            <td class="mobile-pad" align="center" bgcolor="${CREAM}" style="padding:36px 28px 32px 28px;background-color:${CREAM};border-bottom:1px solid #efe6d6;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;letter-spacing:2px;text-transform:uppercase;color:${GOLD};font-weight:bold;padding-bottom:10px;">
                ${escapeHtml(cfg.offerEyebrow)}
              </div>
              <div class="hero-title" style="font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:44px;font-weight:bold;color:${RED};padding-bottom:8px;">
                ${escapeHtml(cfg.offerHeadline)}
              </div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:30px;font-weight:bold;color:${NAVY};padding-bottom:14px;">
                ${escapeHtml(cfg.offerSubhead)}
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#5c5348;padding:0 8px 22px 8px;max-width:480px;margin:0 auto;">
                ${escapeHtml(cfg.offerBody)}
              </div>
              ${ctaButton(cfg.ctaHref, cfg.ctaText, { fill: RED, width: 180 })}
            </td>
          </tr>
          <!-- Benefits -->
          <tr>
            <td class="mobile-pad" style="padding:32px 20px 12px 20px;background-color:#ffffff;">
              <div class="section-title" style="font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:30px;font-weight:bold;color:${NAVY};text-align:center;padding-bottom:18px;">
                ${escapeHtml(cfg.benefitsHeading)}
              </div>
              ${benefitsRow(cfg.benefits)}
            </td>
          </tr>
          <!-- Categories -->
          <tr>
            <td class="mobile-pad" style="padding:20px 20px 8px 20px;background-color:#ffffff;">
              <div class="section-title" style="font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:30px;font-weight:bold;color:${NAVY};text-align:center;padding-bottom:6px;">
                ${escapeHtml(cfg.categoriesHeading)}
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#6b5e4e;text-align:center;padding-bottom:18px;">
                ${escapeHtml(cfg.categoriesSubheading)}
              </div>
              ${twoColCards([cfg.categories[0], cfg.categories[1]])}
              ${twoColCards([cfg.categories[2], cfg.categories[3]])}
            </td>
          </tr>
          <!-- Mid CTA -->
          <tr>
            <td class="mobile-pad" style="padding:16px 24px 36px 24px;background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${NAVY};border-radius:14px;">
                <tr>
                  <td align="center" style="padding:32px 22px;">
                    <div class="section-title" style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:28px;font-weight:bold;color:#ffffff;padding-bottom:8px;">
                      ${escapeHtml(cfg.midCtaHeading)}
                    </div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#e8e0d0;padding-bottom:18px;">
                      ${escapeHtml(cfg.midCtaBody)}
                    </div>
                    ${ctaButton(cfg.midCtaHref, cfg.midCtaText, { fill: GOLD, textColor: NAVY, width: 240 })}
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;

  return emailShell({
    title: `${cfg.offerHeadline} | UsaRakhi`,
    preheader: cfg.preheader,
    logoUrl: cfg.logoUrl,
    logoHref: cfg.logoHref,
    bodyRows,
    footer: footerFrom(cfg),
  });
}

/** Template 2 HTML — Starting at ₹265 / $2.75. */
export function buildStartingPriceEmailHtml(
  cfg: typeof STARTING_PRICE_EMAIL_CONFIG = STARTING_PRICE_EMAIL_CONFIG
): string {
  const sectionBlocks = cfg.sections
    .map((section) => {
      return `
          <tr>
            <td class="mobile-pad" style="padding:24px 20px 4px 20px;background-color:#ffffff;">
              <div class="section-title" style="font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:30px;font-weight:bold;color:${NAVY};text-align:center;padding-bottom:6px;">
                ${escapeHtml(section.heading)}
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#6b5e4e;text-align:center;padding-bottom:16px;">
                ${escapeHtml(section.subheading)}
              </div>
              ${twoColCards([...section.cards])}
            </td>
          </tr>`;
    })
    .join("");

  const bodyRows = `
          <!-- Urgency strip -->
          <tr>
            <td align="center" bgcolor="${RED}" style="padding:10px 16px;background-color:${RED};">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;font-weight:bold;letter-spacing:0.5px;color:#ffffff;">
                ${escapeHtml(cfg.urgencyText)}
              </div>
            </td>
          </tr>
          <!-- Hero image -->
          <tr>
            <td align="center" style="padding:0;line-height:0;font-size:0;">
              <a href="${escAttr(cfg.heroImageHref)}" target="_blank" style="text-decoration:none;">
                <img class="fluid" src="${escAttr(cfg.heroImageUrl)}" width="600" alt="${escAttr(cfg.heroImageAlt)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
              </a>
            </td>
          </tr>
          <!-- Offer hero -->
          <tr>
            <td class="mobile-pad" align="center" bgcolor="${CREAM}" style="padding:34px 28px 30px 28px;background-color:${CREAM};border-bottom:1px solid #efe6d6;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;letter-spacing:2px;text-transform:uppercase;color:${GOLD};font-weight:bold;padding-bottom:10px;">
                ${escapeHtml(cfg.offerEyebrow)}
              </div>
              <div class="hero-title" style="font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:40px;font-weight:bold;color:${NAVY};padding-bottom:8px;">
                ${escapeHtml(cfg.offerHeadline)}
              </div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:32px;font-weight:bold;color:${RED};padding-bottom:14px;">
                ${escapeHtml(cfg.offerSubhead)}
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#5c5348;padding:0 8px 22px 8px;">
                ${escapeHtml(cfg.offerBody)}
              </div>
              ${ctaButton(cfg.ctaHref, cfg.ctaText, { fill: RED, width: 200 })}
            </td>
          </tr>
          ${sectionBlocks}
          <!-- Mid CTA -->
          <tr>
            <td class="mobile-pad" style="padding:12px 24px 36px 24px;background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${RED};border-radius:14px;">
                <tr>
                  <td align="center" style="padding:32px 22px;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#ffd7de;font-weight:bold;padding-bottom:8px;">
                      ${escapeHtml(cfg.urgencyText)}
                    </div>
                    <div class="section-title" style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:28px;font-weight:bold;color:#ffffff;padding-bottom:8px;">
                      ${escapeHtml(cfg.midCtaHeading)}
                    </div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#ffe8ec;padding-bottom:18px;">
                      ${escapeHtml(cfg.midCtaBody)}
                    </div>
                    ${ctaButton(cfg.midCtaHref, cfg.midCtaText, { fill: GOLD, textColor: NAVY, width: 200 })}
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;

  return emailShell({
    title: `${cfg.offerSubhead} | UsaRakhi`,
    preheader: cfg.preheader,
    logoUrl: cfg.logoUrl,
    logoHref: cfg.logoHref,
    bodyRows,
    footer: footerFrom(cfg),
  });
}

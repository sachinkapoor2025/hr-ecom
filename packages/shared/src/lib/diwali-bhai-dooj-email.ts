/**
 * Diwali & Bhai Dooj Gift Collection 2026 — compact marketing email.
 * Table layout and inline CSS for Gmail, Outlook, and Apple Mail.
 * Product names, prices, and images match the festival catalog.
 */

const SITE = "https://www.usarakhi.com";
const LOGO = `${SITE}/logo.png`;
const FB = `${SITE}/email-templates/icons/facebook.png`;
const IG = `${SITE}/email-templates/icons/instagram.png`;

const GOLD = "#c9a227";
const ORANGE = "#e07a2f";
const RED = "#9b1b30";
const CREAM = "#fff6ea";
const PAGE_BG = "#f8efe4";
const INK = "#3d2a22";
const NAVY = "#183a68";
const WHITE = "#ffffff";

export type FestivalEmailProduct = {
  name: string;
  description: string;
  priceLabel: string;
  compareAtLabel: string;
  imageUrl: string;
  href: string;
  buttonText: string;
};

export const DIWALI_BHAI_DOOJ_EMAIL_CONFIG = {
  templateId: "diwali-bhai-dooj-gift-collection-2026",
  name: "Diwali & Bhai Dooj Gift Collection 2026",
  subject: "Celebrate Diwali & Bhai Dooj – Shop Thoughtful Gifts for Your Loved Ones",
  preheader:
    "Make this festive season special with beautiful gifts for your family. Explore the collection today!",
  logoUrl: LOGO,
  logoHref: SITE,
  logoAlt: "UsaRakhi",
  heroImageUrl: `${SITE}/banners/banner-diwali-bhai-dooj.jpg`,
  heroImageHref: SITE,
  heroImageAlt: "Diwali and Bhai Dooj gifts from UsaRakhi",
  eyebrow: "DIWALI & BHAI DOOJ 2026",
  headline: "A little light, a little love, sent across the miles",
  intro:
    "Celebrate with sweets, dry fruits, and festive hampers your family can open together. Browse UsaRakhi and choose a gift that feels personal.",
  ctaText: "Shop Now",
  ctaHref: SITE,
  productsHeading: "Gifts for the celebrations",
  products: [
    {
      name: "Bhai Dooj Kaju Katli & Kumkum Gift Box",
      description: "Kaju katli, kumkum, and a Bhai Dooj card.",
      priceLabel: "₹99",
      compareAtLabel: "",
      imageUrl: "https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2601/TFUSBD2601_1.jpg",
      href: `${SITE}/products/bhai-dooj-kaju-katli-and-kumkum-gift-box`,
      buttonText: "View Product",
    },
    {
      name: "Bhai Dooj Kaju Katli & Ferrero Rocher Box",
      description: "Kaju katli paired with Ferrero Rocher.",
      priceLabel: "$56.31",
      compareAtLabel: "$66.25",
      imageUrl: "https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSBD2603/TFUSBD2603_1.jpg",
      href: `${SITE}/products/bhai-dooj-kaju-katli-and-ferrero-rocher-box`,
      buttonText: "View Product",
    },
    {
      name: "Diwali Toran, Rangoli & Besan Laddoo Hamper",
      description: "Toran, rangoli, and besan laddoo.",
      priceLabel: "$90.31",
      compareAtLabel: "$106.25",
      imageUrl: "https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSDW2620/TFUSDW2620_1.jpg",
      href: `${SITE}/products/diwali-toran-rangoli-and-besan-laddoo-hamper`,
      buttonText: "View Product",
    },
    {
      name: "Diwali Pooja Set with Ferrero & Almonds",
      description: "A pooja set with Ferrero and almonds.",
      priceLabel: "$90.31",
      compareAtLabel: "$106.25",
      imageUrl: "https://d301af4ndyn9qx.cloudfront.net/uploads/orange-county/TFUSDW2624/TFUSDW2624_1.jpg",
      href: `${SITE}/products/diwali-pooja-set-with-ferrero-and-almonds`,
      buttonText: "View Product",
    },
  ] satisfies FestivalEmailProduct[],
  message:
    "Share love, happiness, and a thoughtful gift with your brother, sister, and the family who make these festivals feel like home.",
  exploreText: "Explore All Gifts",
  exploreHref: `${SITE}/products`,
  footerTagline: "Connecting Hearts Across Borders",
  websiteUrl: SITE,
  websiteLabel: "www.usarakhi.com",
  orderEmail: "order@usarakhi.com",
  phoneDisplay: "+91 9266467887",
  phoneHref: "tel:+919266467887",
  facebookUrl: "https://www.facebook.com/usarakhi/",
  facebookIconUrl: FB,
  instagramUrl: "https://www.instagram.com/usarakhi/",
  instagramIconUrl: IG,
  copyrightText: "© 2026 UsaRakhi. All Rights Reserved.",
  unsubscribeLabel: "Unsubscribe",
} as const;

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

function ctaButton(href: string, label: string, fill: string, textColor: string): string {
  const safeHref = escAttr(href);
  const safeLabel = escapeHtml(label);
  return `
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeHref}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="18%" stroke="f" fillcolor="${fill}">
                      <w:anchorlock/>
                      <center style="color:${textColor};font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;">${safeLabel}</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-- -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 auto;">
                      <tr>
                        <td align="center" bgcolor="${fill}" style="background-color:${fill};border-radius:999px;">
                          <a href="${safeHref}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:bold;color:${textColor};text-decoration:none;border-radius:999px;">
                            ${safeLabel}
                          </a>
                        </td>
                      </tr>
                    </table>
                    <!--<![endif]-->`;
}

function productCard(product: FestivalEmailProduct): string {
  const href = escAttr(product.href);
  return `
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:${WHITE};border:1px solid #f0e2cc;border-radius:12px;">
                      <tr>
                        <td align="center" bgcolor="${CREAM}" style="padding:0;line-height:0;font-size:0;background-color:${CREAM};">
                          <a href="${href}" target="_blank" style="text-decoration:none;">
                            <img class="card-img fluid" src="${escAttr(product.imageUrl)}" width="250" alt="${escapeHtml(product.name)}" style="display:block;width:100%;max-width:250px;height:auto;border:0;margin:0 auto;" />
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding:12px 12px 14px 12px;">
                          <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:20px;font-weight:bold;color:${INK};padding-bottom:4px;">
                            <a href="${href}" target="_blank" style="color:${INK};text-decoration:none;">${escapeHtml(product.name)}</a>
                          </div>
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:17px;color:#6b5e4e;padding-bottom:8px;">${escapeHtml(product.description)}</div>
                          <div style="padding-bottom:10px;">
                            <span style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:bold;color:${RED};">${escapeHtml(product.priceLabel)}</span>${
                              product.compareAtLabel
                                ? `<span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9a8b78;text-decoration:line-through;padding-left:6px;">${escapeHtml(product.compareAtLabel)}</span>`
                                : ""
                            }
                          </div>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 auto;">
                            <tr>
                              <td align="center" bgcolor="${ORANGE}" style="background-color:${ORANGE};border-radius:999px;">
                                <a href="${href}" target="_blank" style="display:inline-block;padding:8px 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;font-weight:bold;color:${WHITE};text-decoration:none;border-radius:999px;">${escapeHtml(product.buttonText)}</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>`;
}

function productRow(left: FestivalEmailProduct, right: FestivalEmailProduct): string {
  return `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td class="stack-col" width="50%" valign="top" style="width:50%;padding:0 6px 12px 0;">
                    ${productCard(left)}
                  </td>
                  <td class="stack-col" width="50%" valign="top" style="width:50%;padding:0 0 12px 6px;">
                    ${productCard(right)}
                  </td>
                </tr>
              </table>`;
}

/** Compact Diwali and Bhai Dooj marketing email. */
export function buildDiwaliBhaiDoojEmailHtml(
  cfg: typeof DIWALI_BHAI_DOOJ_EMAIL_CONFIG = DIWALI_BHAI_DOOJ_EMAIL_CONFIG
): string {
  const products = productRow(cfg.products[0], cfg.products[1]) + productRow(cfg.products[2], cfg.products[3]);

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>${escapeHtml(cfg.name)}</title>
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
      .mobile-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .headline { font-size: 24px !important; line-height: 30px !important; }
      .card-img { width: 100% !important; max-width: 100% !important; height: auto !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${PAGE_BG};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(cfg.preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:${PAGE_BG};">
    <tr>
      <td align="center" style="padding:16px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="border-collapse:collapse;width:600px;max-width:600px;background-color:${WHITE};border-radius:16px;overflow:hidden;">
          <tr>
            <td align="center" bgcolor="${CREAM}" style="padding:18px 20px 12px 20px;background-color:${CREAM};">
              <a href="${escAttr(cfg.logoHref)}" target="_blank" style="text-decoration:none;">
                <img src="${escAttr(cfg.logoUrl)}" width="150" alt="${escAttr(cfg.logoAlt)}" style="display:block;width:150px;max-width:60%;height:auto;border:0;margin:0 auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td height="4" style="height:4px;line-height:4px;font-size:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td width="34%" height="4" bgcolor="${RED}" style="background-color:${RED};font-size:0;line-height:4px;">&nbsp;</td>
                  <td width="33%" height="4" bgcolor="${ORANGE}" style="background-color:${ORANGE};font-size:0;line-height:4px;">&nbsp;</td>
                  <td width="33%" height="4" bgcolor="${GOLD}" style="background-color:${GOLD};font-size:0;line-height:4px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0;line-height:0;font-size:0;">
              <a href="${escAttr(cfg.heroImageHref)}" target="_blank" style="text-decoration:none;">
                <img class="fluid" src="${escAttr(cfg.heroImageUrl)}" width="600" alt="${escAttr(cfg.heroImageAlt)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
              </a>
            </td>
          </tr>
          <tr>
            <td class="mobile-pad" align="center" style="padding:22px 28px 8px 28px;background-color:${WHITE};">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${ORANGE};font-weight:bold;padding-bottom:8px;">
                ${escapeHtml(cfg.eyebrow)}
              </div>
              <div class="headline" style="font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:34px;font-weight:bold;color:${RED};padding-bottom:10px;">
                ${escapeHtml(cfg.headline)}
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:${INK};padding-bottom:16px;">
                ${escapeHtml(cfg.intro)}
              </div>
              ${ctaButton(cfg.ctaHref, cfg.ctaText, RED, WHITE)}
            </td>
          </tr>
          <tr>
            <td class="mobile-pad" style="padding:22px 18px 8px 18px;background-color:${WHITE};">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:26px;font-weight:bold;color:${INK};text-align:center;padding-bottom:14px;">
                ${escapeHtml(cfg.productsHeading)}
              </div>
              ${products}
            </td>
          </tr>
          <tr>
            <td class="mobile-pad" align="center" style="padding:8px 28px 28px 28px;background-color:${WHITE};">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:24px;color:${INK};padding-bottom:16px;">
                ${escapeHtml(cfg.message)}
              </div>
              ${ctaButton(cfg.exploreHref, cfg.exploreText, GOLD, NAVY)}
            </td>
          </tr>
          <tr>
            <td class="mobile-pad" style="padding:26px 22px 28px 22px;background-color:${NAVY};text-align:center;">
              <a href="${escAttr(cfg.websiteUrl)}" target="_blank" style="text-decoration:none;">
                <img src="${escAttr(cfg.logoUrl)}" width="120" alt="${escAttr(cfg.logoAlt)}" style="display:block;width:120px;max-width:50%;height:auto;border:0;margin:0 auto 12px auto;background-color:${WHITE};border-radius:8px;padding:8px;" />
              </a>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:20px;color:#f0d78c;padding-bottom:12px;">
                ${escapeHtml(cfg.footerTagline)}
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#d7dde8;padding-bottom:4px;">
                <a href="${escAttr(cfg.websiteUrl)}" target="_blank" style="color:#f0d78c;text-decoration:underline;">${escapeHtml(cfg.websiteLabel)}</a>
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#d7dde8;padding-bottom:4px;">
                <a href="mailto:${escAttr(cfg.orderEmail)}" style="color:#f0d78c;text-decoration:underline;">${escapeHtml(cfg.orderEmail)}</a>
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#d7dde8;padding-bottom:14px;">
                <a href="${escAttr(cfg.phoneHref)}" style="color:#f0d78c;text-decoration:underline;">${escapeHtml(cfg.phoneDisplay)}</a>
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 auto 14px auto;">
                <tr>
                  <td style="padding:0 8px;">
                    <a href="${escAttr(cfg.facebookUrl)}" target="_blank" style="text-decoration:none;">
                      <img src="${escAttr(cfg.facebookIconUrl)}" width="32" height="32" alt="Facebook" style="display:block;border:0;width:32px;height:32px;" />
                    </a>
                  </td>
                  <td style="padding:0 8px;">
                    <a href="${escAttr(cfg.instagramUrl)}" target="_blank" style="text-decoration:none;">
                      <img src="${escAttr(cfg.instagramIconUrl)}" width="32" height="32" alt="Instagram" style="display:block;border:0;width:32px;height:32px;" />
                    </a>
                  </td>
                </tr>
              </table>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9aa8c0;padding-bottom:8px;">
                ${escapeHtml(cfg.copyrightText)}
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;">
                <a href="{{unsubscribe}}" target="_blank" style="color:#f0d78c;text-decoration:underline;">${escapeHtml(cfg.unsubscribeLabel)}</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

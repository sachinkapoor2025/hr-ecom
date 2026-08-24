/**
 * Last Minute Rakhi Orders — table + inline CSS marketing email.
 * Recreates the UsaRakhi last-minute delivery banner as editable HTML
 * (Gmail / Outlook / Apple Mail / mobile).
 */

const SITE = "https://www.usarakhi.com";
const LOGO = `${SITE}/logo.png`;
const FB = `${SITE}/email-templates/icons/facebook.png`;
const IG = `${SITE}/email-templates/icons/instagram.png`;

const NAVY = "#183a68";
const NAVY_DARK = "#0f1f3a";
const RED = "#d32f2f";
const GREEN = "#1e8a3c";
const CREAM = "#f7edd8";
const CREAM_PAGE = "#efe4cc";
const GOLD = "#c9a227";
const WHITE = "#ffffff";

export const LAST_MINUTE_RAKHI_ORDERS_EMAIL_CONFIG = {
  templateId: "last-minute-rakhi-orders",
  name: "Last-Minute Delivery",
  subject: "Last Minute Orders? We Deliver Love, On Time! — UsaRakhi",
  preheader:
    "Last minute Rakhi orders to the USA — 2-day delivery $39, 3-day delivery $19. We deliver love, on time.",
  logoUrl: LOGO,
  logoAlt: "UsaRakhi — India and USA hearts joined by a Rakhi thread",
  logoTagline: "Connecting Hearts Across Borders",
  greeting: "Hi {{CUSTOMER_NAME}},",
  headlineLastMinute: "LAST MINUTE",
  headlineOrders: "ORDERS?",
  subheadline: "WE DELIVER LOVE, ON TIME!",
  bodyMessage:
    "Send Rakhis to your loved ones in the USA with our fast & reliable delivery.",
  deliveryOption1: "{{DELIVERY_OPTION_1}}",
  deliveryBadge1: "2 DAYS",
  deliveryPrice1: "{{DELIVERY_PRICE_1}}",
  deliveryOption2: "{{DELIVERY_OPTION_2}}",
  deliveryBadge2: "3 DAYS",
  deliveryPrice2: "{{DELIVERY_PRICE_2}}",
  trustItems: [
    { icon: "🛡️", label: "SAFE & SECURE DELIVERY" },
    { icon: "⏰", label: "ON TIME EVERY TIME" },
    { icon: "🎁", label: "PACKED WITH LOVE" },
    { icon: "✅", label: "TRUSTED BY 1000+ HAPPY CUSTOMERS" },
  ],
  ctaText: "ORDER NOW",
  ctaHref: "{{SHOP_URL}}",
  websiteLabel: "www.usarakhi.com",
  closingLine: "Because some bonds can't wait!",
  footerTagline: "Connecting Hearts Across Borders",
  websiteUrl: "{{SHOP_URL}}",
  orderEmail: "order@usarakhi.com",
  facebookUrl: "https://www.facebook.com/usarakhi/",
  facebookIconUrl: FB,
  instagramUrl: "https://www.instagram.com/usarakhi/",
  instagramIconUrl: IG,
  copyrightText: "© 2026 UsaRakhi. All Rights Reserved.",
  unsubscribeLabel: "Unsubscribe",
  unsubscribeHref: "{{UNSUBSCRIBE_URL}}",
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

function deliveryCard(opts: {
  headerBg: string;
  badgeBg: string;
  titleColor: string;
  option: string;
  badge: string;
  price: string;
  href: string;
}): string {
  const href = escAttr(opts.href);
  return `
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;background-color:${WHITE};border:1px solid ${opts.headerBg};border-radius:16px;overflow:hidden;">
                      <tr>
                        <td align="center" bgcolor="${opts.headerBg}" style="background-color:${opts.headerBg};padding:16px 10px 12px 10px;">
                          <div style="font-size:26px;line-height:28px;padding-bottom:8px;">🚚</div>
                          <div style="display:inline-block;background-color:${opts.badgeBg};border:2px solid ${WHITE};border-radius:999px;padding:6px 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;font-weight:bold;letter-spacing:0.5px;color:${WHITE};">
                            ${escapeHtml(opts.badge)}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" bgcolor="${WHITE}" style="background-color:${WHITE};padding:16px 10px 12px 10px;">
                          <a href="${href}" target="_blank" style="text-decoration:none;">
                            <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;font-weight:bold;letter-spacing:0.4px;color:${opts.titleColor};">
                              ${escapeHtml(opts.option)}
                            </div>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td height="1" style="height:1px;line-height:1px;font-size:0;border-top:2px dotted #d8c9a8;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td align="center" bgcolor="${opts.headerBg}" style="background-color:${opts.headerBg};padding:12px 10px 14px 10px;">
                          <a href="${href}" target="_blank" style="text-decoration:none;">
                            <div style="font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:32px;font-weight:bold;color:${WHITE};">
                              ${escapeHtml(opts.price)}
                            </div>
                          </a>
                        </td>
                      </tr>
                    </table>`;
}

function trustCell(icon: string, label: string): string {
  return `
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                      <tr>
                        <td align="center" style="padding:8px 6px;">
                          <div style="width:36px;height:36px;line-height:36px;border-radius:18px;background-color:${NAVY};color:${WHITE};font-size:16px;margin:0 auto 8px auto;">${escapeHtml(icon)}</div>
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:13px;font-weight:bold;letter-spacing:0.3px;color:${NAVY};text-transform:uppercase;">
                            ${escapeHtml(label)}
                          </div>
                        </td>
                      </tr>
                    </table>`;
}

/** Last Minute Rakhi Orders HTML — editable placeholders, email-safe tables. */
export function buildLastMinuteRakhiOrdersEmailHtml(
  cfg: typeof LAST_MINUTE_RAKHI_ORDERS_EMAIL_CONFIG = LAST_MINUTE_RAKHI_ORDERS_EMAIL_CONFIG
): string {
  const shopHref = escAttr(cfg.ctaHref);
  const unsubHref = escAttr(cfg.unsubscribeHref);
  const trust = cfg.trustItems
    .map(
      (item, i) => `
                  <td class="stack-col-25" width="25%" valign="top" style="width:25%;padding:${
                    i === 0 ? "0 4px 0 0" : i === 3 ? "0 0 0 4px" : "0 4px"
                  };border-right:${i < 3 ? `1px solid ${NAVY}22` : "0"};">
                    ${trustCell(item.icon, item.label)}
                  </td>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>${escapeHtml(cfg.name)} | UsaRakhi</title>
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
      .stack-col-25 { display: inline-block !important; width: 50% !important; max-width: 50% !important; box-sizing: border-box !important; border-right: 0 !important; }
      .mobile-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .hero-title { font-size: 26px !important; line-height: 32px !important; }
      .cta-side { border-radius: 12px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${CREAM_PAGE};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(cfg.preheader)}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:${CREAM_PAGE};">
    <tr>
      <td align="center" style="padding:16px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="border-collapse:collapse;width:600px;max-width:600px;background-color:${CREAM};border-radius:8px;overflow:hidden;border:1px solid #e8d9b0;">

          <!-- Logo + India-USA branding -->
          <tr>
            <td class="mobile-pad" align="center" bgcolor="${CREAM}" style="padding:22px 24px 8px 24px;background-color:${CREAM};">
              <a href="${shopHref}" target="_blank" style="text-decoration:none;">
                <img src="${escAttr(cfg.logoUrl)}" width="168" alt="${escAttr(cfg.logoAlt)}" style="display:block;width:168px;max-width:70%;height:auto;border:0;margin:0 auto;" />
              </a>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:20px;font-style:italic;color:#1b5e20;padding-top:8px;">
                ${escapeHtml(cfg.logoTagline)}
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:${NAVY};padding-top:6px;">
                🇮🇳 ❤ 🇺🇸 &nbsp; India → USA Rakhi delivery
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td class="mobile-pad" align="left" style="padding:8px 28px 4px 28px;background-color:${CREAM};font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:${NAVY};">
              ${escapeHtml(cfg.greeting)}
            </td>
          </tr>

          <!-- Headlines -->
          <tr>
            <td class="mobile-pad" align="center" style="padding:12px 24px 6px 24px;background-color:${CREAM};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 auto;">
                <tr>
                  <td align="center" bgcolor="${RED}" style="background-color:${RED};padding:8px 16px;border-radius:4px;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:22px;font-weight:bold;letter-spacing:1px;color:${WHITE};">
                      ${escapeHtml(cfg.headlineLastMinute)}
                    </div>
                  </td>
                  <td align="left" style="padding:0 0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:26px;font-weight:bold;color:${NAVY};">
                    ${escapeHtml(cfg.headlineOrders)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="mobile-pad" align="center" style="padding:8px 24px 10px 24px;background-color:${CREAM};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;max-width:480px;margin:0 auto;">
                <tr>
                  <td align="center" bgcolor="${RED}" style="background-color:${RED};padding:12px 18px;border-radius:6px;">
                    <div class="hero-title" style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:24px;font-weight:bold;letter-spacing:0.6px;color:${WHITE};">
                      ${escapeHtml(cfg.subheadline)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="mobile-pad" align="center" style="padding:4px 32px 18px 32px;background-color:${CREAM};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#3d3328;">
              ${escapeHtml(cfg.bodyMessage)}
            </td>
          </tr>

          <!-- Delivery cards -->
          <tr>
            <td class="mobile-pad" style="padding:0 18px 22px 18px;background-color:${CREAM};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td class="stack-col" width="50%" valign="top" style="width:50%;padding:0 8px 12px 0;">
                    ${deliveryCard({
                      headerBg: NAVY,
                      badgeBg: "#2a4a7a",
                      titleColor: NAVY,
                      option: cfg.deliveryOption1,
                      badge: cfg.deliveryBadge1,
                      price: cfg.deliveryPrice1,
                      href: cfg.ctaHref,
                    })}
                  </td>
                  <td class="stack-col" width="50%" valign="top" style="width:50%;padding:0 0 12px 8px;">
                    ${deliveryCard({
                      headerBg: GREEN,
                      badgeBg: "#166b30",
                      titleColor: GREEN,
                      option: cfg.deliveryOption2,
                      badge: cfg.deliveryBadge2,
                      price: cfg.deliveryPrice2,
                      href: cfg.ctaHref,
                    })}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Trust features -->
          <tr>
            <td class="mobile-pad" style="padding:6px 12px 22px 12px;background-color:${CREAM};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  ${trust}
                </tr>
              </table>
            </td>
          </tr>

          <!-- ORDER NOW CTA + website -->
          <tr>
            <td class="mobile-pad" align="center" style="padding:4px 22px 20px 22px;background-color:${CREAM};">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${shopHref}" style="height:52px;v-text-anchor:middle;width:520px;" arcsize="50%" stroke="f" fillcolor="${RED}">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;">${escapeHtml(cfg.ctaText)} &nbsp;|&nbsp; ${escapeHtml(cfg.websiteLabel)}</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-- -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-radius:28px;overflow:hidden;">
                <tr>
                  <td class="stack-col cta-side" width="50%" align="center" bgcolor="${RED}" style="width:50%;background-color:${RED};border-radius:28px 0 0 28px;">
                    <a href="${shopHref}" target="_blank" style="display:block;padding:16px 12px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:bold;letter-spacing:0.8px;color:${WHITE};text-decoration:none;">
                      ${escapeHtml(cfg.ctaText)}
                    </a>
                  </td>
                  <td class="stack-col cta-side" width="50%" align="center" bgcolor="${NAVY}" style="width:50%;background-color:${NAVY};border-radius:0 28px 28px 0;">
                    <a href="${shopHref}" target="_blank" style="display:block;padding:16px 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;font-weight:bold;color:${WHITE};text-decoration:none;">
                      ${escapeHtml(cfg.websiteLabel)}
                    </a>
                  </td>
                </tr>
              </table>
              <!--<![endif]-->
            </td>
          </tr>

          <!-- Closing line -->
          <tr>
            <td align="center" bgcolor="${NAVY_DARK}" style="background-color:${NAVY_DARK};padding:16px 20px;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:24px;font-style:italic;color:${WHITE};">
                ${escapeHtml(cfg.closingLine)}
                <span style="color:${RED};font-style:normal;padding-left:6px;">❤</span>
              </div>
            </td>
          </tr>

          <!-- Gold accent -->
          <tr>
            <td height="4" style="height:4px;line-height:4px;font-size:0;background-color:${GOLD};">&nbsp;</td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="mobile-pad" align="center" bgcolor="${NAVY}" style="padding:24px 22px 28px 22px;background-color:${NAVY};">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:18px;color:#f0d78c;padding-bottom:10px;">
                ${escapeHtml(cfg.footerTagline)}
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#d7dde8;padding-bottom:6px;">
                Website:
                <a href="${shopHref}" target="_blank" style="color:#f0d78c;text-decoration:underline;">${escapeHtml(cfg.websiteLabel)}</a>
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#d7dde8;padding-bottom:14px;">
                Orders:
                <a href="mailto:${escAttr(cfg.orderEmail)}" style="color:#f0d78c;text-decoration:underline;">${escapeHtml(cfg.orderEmail)}</a>
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 auto 14px auto;">
                <tr>
                  <td style="padding:0 8px;">
                    <a href="${escAttr(cfg.facebookUrl)}" target="_blank" style="text-decoration:none;">
                      <img src="${escAttr(cfg.facebookIconUrl)}" width="36" height="36" alt="UsaRakhi on Facebook" style="display:block;border:0;width:36px;height:36px;" />
                    </a>
                  </td>
                  <td style="padding:0 8px;">
                    <a href="${escAttr(cfg.instagramUrl)}" target="_blank" style="text-decoration:none;">
                      <img src="${escAttr(cfg.instagramIconUrl)}" width="36" height="36" alt="UsaRakhi on Instagram" style="display:block;border:0;width:36px;height:36px;" />
                    </a>
                  </td>
                </tr>
              </table>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9aa8c0;padding-bottom:10px;">
                ${escapeHtml(cfg.copyrightText)}
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9aa8c0;">
                <a href="${unsubHref}" target="_blank" style="color:#f0d78c;text-decoration:underline;">${escapeHtml(cfg.unsubscribeLabel)}</a>
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

/** Shared hamper description builders for import + catalog generate. */

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Normalize vendor Excel inclusion lines into readable storefront copy. */
export function normalizeInclusionLine(raw: string): string {
  let line = raw
    .replace(/^\s*\d+\s*[-.)]?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!line) return "";

  line = line
    .replace(/\b(\d+)\s*gms?\b/gi, "$1 g")
    .replace(/\b(\d+)\s*g\s+/gi, "$1 g ")
    .replace(/\bpc\b/gi, "pc")
    .replace(/\bSoap Papdi\b/gi, "Soan Papdi")
    .replace(/\bSoan papdi\b/gi, "Soan Papdi")
    .replace(/\bBesan Laddo\b/gi, "Besan Laddoo")
    .replace(/\bferrero\b/gi, "Ferrero")
    .replace(/\bChocolates\b/g, "chocolates")
    .replace(/\bcashew\b/gi, "cashews")
    .replace(/\bPistachios\b/g, "pistachios")
    .replace(/\bAlmonds\b/g, "almonds")
    .replace(/\bsingle Rakhi\b/gi, "1 designer Single Rakhi")
    .replace(/\bset of 2 Rakhi\b/gi, "Set of 2 designer Rakhis")
    // Avoid "&" — it becomes &amp; in HTML and shows literally in plain-text previews.
    .replace(/\bRoli\s*[-–]?\s*Chawal\s+Designer\s+Tikka(?:\s+Set)?\b/gi, "Roli Chawal Designer Tikka Set")
    .replace(/\bRoli\s*[-–]?\s*Chawal\s+Dibbi\b/gi, "Roli Chawal Dibbi")
    .replace(/\bRoli\s*[-–]?\s*Chawal\s+Tikka(?:\s+Set)?\b/gi, "Roli Chawal Designer Tikka Set")
    .replace(/\bRoli\s*&\s*chawal\s+designer\s+tikka\s+set\b/gi, "Roli Chawal Designer Tikka Set")
    .replace(/\bRoli\s*&\s*chawal\s+dibbi\b/gi, "Roli Chawal Dibbi")
    .replace(/\bRoli\s*&\s*chawal\b/gi, "Roli Chawal");

  // Sentence-style capital (first letter); proper nouns already normalized above.
  return line.charAt(0).toUpperCase() + line.slice(1);
}

export function parseInclusionLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map(normalizeInclusionLine)
    .filter(Boolean);
}

export function buildHamperHtmlDescription(name: string, rawInclusions: string, sku: string): string {
  const items = parseInclusionLines(rawInclusions);
  const list =
    items.length > 0
      ? `<ul>${items.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>`
      : `<p>${escapeHtml(rawInclusions.trim() || "Premium festive contents — see product photos for details.")}</p>`;

  const qtyNote =
    items.length > 0
      ? `<p>Every item above ships together in one gift hamper — quantities are as listed (grams / pieces).</p>`
      : "";

  return [
    `<p><strong>${escapeHtml(name)}</strong> is a premium Rakhi gift hamper for USA delivery. It is curated with festive sweets, dry fruits, and designer rakhis, and ships domestically within America for Raksha Bandhan and year-round brother–sister celebrations.</p>`,
    `<p><strong>What's included in this hamper:</strong></p>`,
    list,
    qtyNote,
    `<p>Looking for more options? Browse our <a href="/rakhi-combo-to-usa">Rakhi Combos</a>, <a href="/single-rakhi-to-usa">Single Rakhi</a> collection, or shop all <a href="/rakhi-hampers-to-usa">Rakhi Hampers</a>. Perfect for sending love across the USA.</p>`,
    `<p>SKU: ${escapeHtml(sku)}</p>`,
  ].join("\n");
}

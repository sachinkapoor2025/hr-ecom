import Link from "next/link";
import type { ReactNode } from "react";
import { findPhrase, MAX_CONTEXTUAL_LINKS, normalizeHref } from "@/lib/contextual-links";

export const standardInlineLinkClass = "text-nav hover:underline";

export type InlineLinkBudget = {
  max: number;
  used: number;
  anchors: Set<string>;
  hrefs: Set<string>;
};

export function createInlineLinkBudget(max = MAX_CONTEXTUAL_LINKS): InlineLinkBudget {
  return { max, used: 0, anchors: new Set(), hrefs: new Set() };
}

function anchorKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Link the first unused occurrence of each phrase.
 * A shared budget keeps a page between 3 and 5 unique anchors and destinations.
 */
export function applyInlineLinks(
  text: string,
  links: readonly { phrase: string; href: string }[],
  budget: InlineLinkBudget = createInlineLinkBudget()
): ReactNode {
  if (!text || budget.used >= budget.max || links.length === 0) return text;

  const matches: { start: number; end: number; href: string; anchor: string }[] = [];
  const sorted = [...links].sort((a, b) => b.phrase.length - a.phrase.length);

  for (const link of sorted) {
    if (budget.used + matches.length >= budget.max) break;
    const path = normalizeHref(link.href);
    if (budget.hrefs.has(path) || matches.some((match) => normalizeHref(match.href) === path)) continue;
    const found = findPhrase(text, link.phrase);
    if (!found) continue;
    const key = anchorKey(found.anchor);
    if (budget.anchors.has(key) || matches.some((match) => anchorKey(match.anchor) === key)) continue;
    if (matches.some((match) => found.start < match.end && found.end > match.start)) continue;
    matches.push({ start: found.start, end: found.end, href: link.href, anchor: found.anchor });
  }

  if (!matches.length) return text;
  matches.sort((a, b) => a.start - b.start);

  for (const match of matches) {
    budget.used += 1;
    budget.hrefs.add(normalizeHref(match.href));
    budget.anchors.add(anchorKey(match.anchor));
  }

  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start > cursor) parts.push(text.slice(cursor, match.start));
    parts.push(
      <Link key={`${match.href}-${match.start}`} href={match.href} className={standardInlineLinkClass}>
        {match.anchor}
      </Link>
    );
    cursor = match.end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

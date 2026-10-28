/**
 * DynamoDB Scan applies FilterExpression after each 1MB page.
 * A page can come back with zero matches and a continuation key.
 * Callers must follow that key or they report an empty result.
 */
export async function collectScanPages<T>(
  readPage: (startKey?: Record<string, unknown>) => Promise<{
    items: T[];
    lastKey?: Record<string, unknown>;
  }>
): Promise<T[]> {
  const items: T[] = [];
  let startKey: Record<string, unknown> | undefined;

  for (let page = 0; page < 500; page++) {
    const result = await readPage(startKey);
    if (result.items.length) items.push(...result.items);
    if (!result.lastKey) return items;
    startKey = result.lastKey;
  }

  throw new Error("DynamoDB scan exceeded 500 pages");
}

/**
 * Follow Query LastEvaluatedKey. A single page is at most 1MB, and Limit is
 * applied before any later rows — stopping there hides every record past that page.
 * Returns what was read if maxPages is hit so an admin screen still loads.
 */
export async function collectQueryPages<T>(
  readPage: (startKey?: Record<string, unknown>) => Promise<{
    items: T[];
    lastKey?: Record<string, unknown>;
  }>,
  maxPages = 200
): Promise<T[]> {
  const items: T[] = [];
  let startKey: Record<string, unknown> | undefined;

  for (let page = 0; page < maxPages; page++) {
    const result = await readPage(startKey);
    if (result.items.length) items.push(...result.items);
    if (!result.lastKey) return items;
    startKey = result.lastKey;
  }

  return items;
}

/** Round-robin by key so one large group cannot crowd newer groups out of a short sample. */
export function interleaveByKey<T>(items: T[], keyOf: (item: T) => string, limit: number): T[] {
  if (limit <= 0) return [];
  const groups: T[][] = [];
  const index = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    let at = index.get(key);
    if (at === undefined) {
      at = groups.length;
      index.set(key, at);
      groups.push([]);
    }
    groups[at]!.push(item);
  }

  const out: T[] = [];
  let progressed = true;
  while (out.length < limit && progressed) {
    progressed = false;
    for (const group of groups) {
      if (out.length >= limit) break;
      const next = group.shift();
      if (!next) continue;
      out.push(next);
      progressed = true;
    }
  }
  return out;
}

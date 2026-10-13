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

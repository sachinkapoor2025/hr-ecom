import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  DEFAULT_PRODUCT_INVENTORY,
  getMiniRakhiCombo,
  buildMiniRakhiComboProduct,
  productKeys,
} from "@hr-ecom/shared";
import { docClient, PRODUCTS_TABLE, now } from "./db";

export async function ensureMiniRakhiComboInDb(
  slug: string
): Promise<Record<string, unknown> | null> {
  const def = getMiniRakhiCombo(slug);
  if (!def) return null;

  const key = { PK: productKeys.pk(slug), SK: productKeys.sk() };
  const existing = await docClient.send(new GetCommand({ TableName: PRODUCTS_TABLE, Key: key }));
  if (existing.Item) return existing.Item as Record<string, unknown>;

  const bundled = buildMiniRakhiComboProduct(def);
  const ts = now();
  const item = {
    ...bundled,
    inventory: bundled.inventory ?? DEFAULT_PRODUCT_INVENTORY,
    PK: key.PK,
    SK: key.SK,
    GSI1PK: productKeys.gsi1pk(bundled.categorySlug),
    GSI1SK: productKeys.gsi1sk(slug),
    createdAt: ts,
    updatedAt: ts,
  };

  await docClient.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: item }));
  return item;
}

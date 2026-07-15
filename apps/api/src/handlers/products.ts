import { PutCommand, GetCommand, QueryCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  createProductSchema,
  updateProductSchema,
  bulkProductRowSchema,
  productKeys,
  DEFAULT_PRODUCT_INVENTORY,
  withCompetitiveStorefrontPricing,
  type Product,
} from "@hr-ecom/shared";
import { docClient, PRODUCTS_TABLE, now, slugify } from "../lib/db";
import { ok, created, badRequest, notFound, forbidden } from "../lib/response";
import { getAuth } from "../lib/auth";
import { withResolvedProductImages, resolveProductImageUrl } from "../lib/images";
import { syncInventoryAlertState } from "../lib/inventory";

function forStorefront(product: Product): Product {
  return withCompetitiveStorefrontPricing(withResolvedProductImages(product));
}

function isKidsComboProduct(product: Product): boolean {
  if (product.categorySlug !== "kids-rakhi") return false;

  const text = [product.name, product.description, ...(product.tags ?? [])]
    .join(" ")
    .toLowerCase();

  return [
    "combo",
    "chocolate",
    "chocolates",
    "hershey",
    "lindor",
    "lindt",
    "kitkat",
    "dairy milk",
    "snicker",
    "milky way",
  ].some((term) => text.includes(term));
}

async function queryProductsByCategory(categorySlug: string): Promise<Product[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: PRODUCTS_TABLE,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: { ":pk": productKeys.gsi1pk(categorySlug) },
    })
  );
  return (result.Items ?? []) as Product[];
}

/** Warm-instance cache — avoids full table Scan on every uncategorized /products request. */
const PRODUCT_LIST_CACHE_TTL_MS = 60_000;
let productListCache: { at: number; items: Product[] } | null = null;

async function scanAllProducts(): Promise<Product[]> {
  const nowMs = Date.now();
  if (productListCache && nowMs - productListCache.at < PRODUCT_LIST_CACHE_TTL_MS) {
    return productListCache.items;
  }

  const items: Product[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const result = await docClient.send(
      new ScanCommand({
        TableName: PRODUCTS_TABLE,
        FilterExpression: "begins_with(PK, :prefix) AND SK = :sk",
        ExpressionAttributeValues: { ":prefix": "PRODUCT#", ":sk": "META" },
        ExclusiveStartKey,
      })
    );
    if (result.Items?.length) items.push(...(result.Items as Product[]));
    ExclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (ExclusiveStartKey);

  productListCache = { at: nowMs, items };
  return items;
}

/** Call after product create/update/delete so storefront list stays fresh. */
export function invalidateProductListCache() {
  productListCache = null;
}

export async function listProducts(event: APIGatewayProxyEventV2) {
  const category = event.queryStringParameters?.category;
  const search = event.queryStringParameters?.search?.toLowerCase();

  let items: Product[] = [];

  if (category) {
    items = await queryProductsByCategory(category);

    if (category === "rakhi-combo") {
      const kidsComboProducts = (await queryProductsByCategory("kids-rakhi")).filter(isKidsComboProduct);
      const bySlug = new Map(items.map((p) => [p.slug, p]));
      for (const product of kidsComboProducts) bySlug.set(product.slug, product);
      items = [...bySlug.values()];
    }
  } else {
    items = await scanAllProducts();
  }

  items = items.filter((p) => p.published !== false && (p.inventory ?? 0) > 0);
  if (search) {
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.tags?.some((t) => t.toLowerCase().includes(search))
    );
  }

  return ok({ products: items.map(forStorefront) });
}

export async function getProduct(event: APIGatewayProxyEventV2) {
  const slug = event.pathParameters?.slug;
  if (!slug) return badRequest("Slug required");

  const result = await docClient.send(
    new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { PK: productKeys.pk(slug), SK: productKeys.sk() },
    })
  );

  if (!result.Item) return notFound("Product not found");
  const product = result.Item as { published?: boolean };
  if (product.published === false) return notFound("Product not found");
  return ok({ product: forStorefront(result.Item as Product) });
}

export async function createProduct(event: APIGatewayProxyEventV2) {
  const auth = getAuth(event);
  if (!auth?.isAdmin) return forbidden();

  const body = JSON.parse(event.body ?? "{}");
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const slug = slugify(parsed.data.name);
  const timestamp = now();
  const inventory = parsed.data.inventory ?? DEFAULT_PRODUCT_INVENTORY;
  const item: Product & { PK: string; SK: string; GSI1PK: string; GSI1SK: string } = {
    ...parsed.data,
    inventory,
    slug,
    PK: productKeys.pk(slug),
    SK: productKeys.sk(),
    GSI1PK: productKeys.gsi1pk(parsed.data.categorySlug),
    GSI1SK: productKeys.gsi1sk(slug),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await docClient.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: item }));
  invalidateProductListCache();
  return created({ product: item });
}

export async function updateProduct(event: APIGatewayProxyEventV2) {
  const auth = getAuth(event);
  if (!auth?.isAdmin) return forbidden();

  const slug = event.pathParameters?.slug;
  if (!slug) return badRequest("Slug required");

  const existing = await docClient.send(
    new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { PK: productKeys.pk(slug), SK: productKeys.sk() },
    })
  );
  if (!existing.Item) return notFound("Product not found");

  const previous = existing.Item as Product;
  const body = JSON.parse(event.body ?? "{}");
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const updated = {
    ...previous,
    ...parsed.data,
    updatedAt: now(),
  } as Product & { PK: string; SK: string; GSI1PK: string; GSI1SK: string };

  if (parsed.data.categorySlug) {
    updated.GSI1PK = productKeys.gsi1pk(parsed.data.categorySlug);
    updated.GSI1SK = productKeys.gsi1sk(slug);
  }

  await docClient.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: updated }));
  invalidateProductListCache();

  if (parsed.data.inventory !== undefined) {
    await syncInventoryAlertState(slug, previous, parsed.data.inventory);
  }

  return ok({ product: updated });
}

/** Admin: list all products including unpublished. */
export async function listAdminProducts(event: APIGatewayProxyEventV2) {
  const auth = getAuth(event);
  if (!auth?.isAdmin) return forbidden();

  const result = await docClient.send(
    new ScanCommand({
      TableName: PRODUCTS_TABLE,
      FilterExpression: "begins_with(PK, :prefix) AND SK = :sk",
      ExpressionAttributeValues: { ":prefix": "PRODUCT#", ":sk": "META" },
    })
  );

  const items = ((result.Items ?? []) as Product[]).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return ok({ products: items.map(withResolvedProductImages) });
}

export async function deleteProduct(event: APIGatewayProxyEventV2) {
  const auth = getAuth(event);
  if (!auth?.isAdmin) return forbidden();

  const slug = event.pathParameters?.slug;
  if (!slug) return badRequest("Slug required");

  await docClient.send(
    new DeleteCommand({
      TableName: PRODUCTS_TABLE,
      Key: { PK: productKeys.pk(slug), SK: productKeys.sk() },
    })
  );
  invalidateProductListCache();
  return ok({ deleted: true });
}

export async function bulkUploadProducts(event: APIGatewayProxyEventV2) {
  const auth = getAuth(event);
  if (!auth?.isAdmin) return forbidden();

  const body = JSON.parse(event.body ?? "{}");
  const rows: unknown[] = body.rows ?? body;
  if (!Array.isArray(rows)) return badRequest("Expected array of products");

  const createdProducts: Product[] = [];
  const errors: { row: number; error: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const parsed = bulkProductRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push({ row: i + 1, error: parsed.error.message });
      continue;
    }

    const slug = slugify(parsed.data.name);
    const timestamp = now();
    const tags = parsed.data.tags
      ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const item = {
      ...parsed.data,
      slug,
      tags,
      images: [],
      PK: productKeys.pk(slug),
      SK: productKeys.sk(),
      GSI1PK: productKeys.gsi1pk(parsed.data.categorySlug),
      GSI1SK: productKeys.gsi1sk(slug),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await docClient.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: item }));
    createdProducts.push(item as Product);
  }

  invalidateProductListCache();
  return ok({ created: createdProducts.length, errors, products: createdProducts });
}

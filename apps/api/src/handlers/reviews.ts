/**
 * Product + site reviews — DynamoDB items under PRODUCT#slug / REVIEW#id.
 * Customer submissions are published immediately. Admin can delete catalog reviews.
 * Historical reviews submitted via POST /leads (source=review) are listed in admin.
 * Admin can toggle Published (storefront) vs Historical (admin-only) without copying
 * or deleting the original lead/catalog row.
 * Aggregate lives on product META as ratingAggregate for Product JSON-LD.
 */
import { QueryCommand, PutCommand, GetCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import type { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  createProductReviewSchema,
  submitCustomerReviewSchema,
  updateAdminReviewStatusSchema,
  productKeys,
  reviewKeys,
  customerKeys,
  SITE_REVIEW_SLUG,
  toPublicReview,
  mergeAdminReviews,
  mergePublishedStorefrontReviews,
  catalogReviewToAdmin,
  legacyLeadToAdminReview,
  reviewStatusFromPublished,
  type AdminReview,
  type AdminReviewOrderItem,
  type LegacyReviewLead,
  type ProductReview,
  type ProductRatingAggregate,
} from "@hr-ecom/shared";
import { randomUUID } from "crypto";
import { docClient, PRODUCTS_TABLE, CUSTOMERS_TABLE, now } from "../lib/db";
import { ok, created, badRequest, forbidden, notFound } from "../lib/response";
import { getAuth, requireAdmin } from "../lib/auth";
import { resolveOrderByIdOrNumber } from "../lib/order-numbers";

type StoredReview = ProductReview & {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
};

function withoutDbKeys(item: StoredReview): ProductReview {
  const { PK, SK, GSI1PK, GSI1SK, ...rest } = item;
  void PK;
  void SK;
  void GSI1PK;
  void GSI1SK;
  return rest;
}

async function queryAllItems(
  input: Omit<QueryCommandInput, "ExclusiveStartKey">,
  maxPages = 50
): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  let pages = 0;
  do {
    const result = await docClient.send(
      new QueryCommand({ ...input, ExclusiveStartKey })
    );
    if (result.Items?.length) items.push(...(result.Items as Record<string, unknown>[]));
    ExclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
    pages += 1;
  } while (ExclusiveStartKey && pages < maxPages);
  return items;
}

async function queryReviewsByGsi(): Promise<StoredReview[]> {
  return queryAllItems({
    TableName: PRODUCTS_TABLE,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :pk",
    ExpressionAttributeValues: { ":pk": reviewKeys.gsi1pk() },
    ScanIndexForward: false,
  }) as Promise<StoredReview[]>;
}

/** Site-wide reviews (PRODUCT#_site) even if a row is missing GSI1 keys. */
async function querySitePartitionReviews(): Promise<StoredReview[]> {
  return queryAllItems({
    TableName: PRODUCTS_TABLE,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": reviewKeys.pk(SITE_REVIEW_SLUG),
      ":sk": reviewKeys.skPrefix(),
    },
  }) as Promise<StoredReview[]>;
}

function mergeCatalogReviews(gsi: StoredReview[], site: StoredReview[]): ProductReview[] {
  const byId = new Map<string, ProductReview>();
  for (const item of [...gsi, ...site]) {
    const review = withoutDbKeys(item);
    if (!review.reviewId || byId.has(review.reviewId)) continue;
    byId.set(review.reviewId, review);
  }
  return [...byId.values()];
}

async function queryLegacyReviewLeads(): Promise<LegacyReviewLead[]> {
  const items = await queryAllItems(
    {
      TableName: CUSTOMERS_TABLE,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      FilterExpression: "#source = :source",
      ExpressionAttributeNames: { "#source": "source" },
      ExpressionAttributeValues: {
        ":pk": customerKeys.gsi1pk(),
        ":source": "review",
      },
      ScanIndexForward: false,
    },
    100
  );
  return items as LegacyReviewLead[];
}

function chunkIds(ids: string[], size: number): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += size) chunks.push(ids.slice(i, i + size));
  return chunks;
}

async function enrichAdminReviewsWithOrders(reviews: AdminReview[]): Promise<AdminReview[]> {
  const orderIds = [
    ...new Set(reviews.map((r) => r.orderId?.trim()).filter((id): id is string => Boolean(id))),
  ];
  if (!orderIds.length) return reviews;

  const byRef = new Map<
    string,
    {
      orderId: string;
      orderNumber?: string;
      status?: string;
      items: AdminReviewOrderItem[];
    }
  >();

  for (const group of chunkIds(orderIds, 8)) {
    const resolved = await Promise.all(
      group.map(async (ref) => {
        try {
          const order = await resolveOrderByIdOrNumber(ref);
          return { ref, order };
        } catch {
          return { ref, order: undefined };
        }
      })
    );
    for (const { ref, order } of resolved) {
      if (!order) continue;
      byRef.set(ref, {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        status: order.status,
        items: (order.items ?? []).map((item) => ({
          name: item.name,
          productSlug: item.productSlug,
          quantity: item.quantity,
        })),
      });
    }
  }

  return reviews.map((review) => {
    const ref = review.orderId?.trim();
    if (!ref) return review;
    const order = byRef.get(ref);
    if (!order) return review;
    return {
      ...review,
      resolvedOrderId: order.orderId,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      orderItems: order.items,
    };
  });
}

async function recomputeAggregate(productSlug: string): Promise<ProductRatingAggregate | null> {
  if (productSlug === SITE_REVIEW_SLUG) return null;

  const result = await docClient.send(
    new QueryCommand({
      TableName: PRODUCTS_TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": reviewKeys.pk(productSlug),
        ":sk": reviewKeys.skPrefix(),
      },
    })
  );
  const published = (result.Items ?? []).filter((r) => r.published !== false) as ProductReview[];
  if (!published.length) {
    await docClient.send(
      new UpdateCommand({
        TableName: PRODUCTS_TABLE,
        Key: { PK: productKeys.pk(productSlug), SK: productKeys.sk() },
        UpdateExpression: "REMOVE ratingAggregate SET updatedAt = :u",
        ExpressionAttributeValues: { ":u": now() },
      })
    );
    return null;
  }
  const sum = published.reduce((s, r) => s + Number(r.rating || 0), 0);
  const aggregate: ProductRatingAggregate = {
    ratingValue: Math.round((sum / published.length) * 10) / 10,
    reviewCount: published.length,
    bestRating: 5,
    worstRating: 1,
  };
  await docClient.send(
    new UpdateCommand({
      TableName: PRODUCTS_TABLE,
      Key: { PK: productKeys.pk(productSlug), SK: productKeys.sk() },
      UpdateExpression: "SET ratingAggregate = :a, updatedAt = :u",
      ExpressionAttributeValues: { ":a": aggregate, ":u": now() },
    })
  );
  return aggregate;
}

export async function listProductReviews(event: APIGatewayProxyEventV2) {
  const slug = event.pathParameters?.slug;
  if (!slug) return badRequest("Product slug required");

  const result = await docClient.send(
    new QueryCommand({
      TableName: PRODUCTS_TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": reviewKeys.pk(slug),
        ":sk": reviewKeys.skPrefix(),
      },
    })
  );

  const reviews = ((result.Items ?? []) as StoredReview[])
    .map(withoutDbKeys)
    .filter((r) => r.published !== false)
    .map(toPublicReview)
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  return ok({ reviews });
}

/** Public feed of published reviews (site-wide + product + published historical leads). */
export async function listPublishedReviews(_event: APIGatewayProxyEventV2) {
  const [gsiReviews, siteReviews, leads] = await Promise.all([
    queryReviewsByGsi(),
    querySitePartitionReviews(),
    queryLegacyReviewLeads(),
  ]);
  const catalog = mergeCatalogReviews(gsiReviews, siteReviews);
  const reviews = mergePublishedStorefrontReviews(catalog, leads);

  return ok({ reviews }, { "Cache-Control": "no-store" });
}

/** Admin: catalog reviews plus historical lead submissions (read-only merge). */
export async function listAdminReviews(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden("Admin required");

  const [gsiReviews, siteReviews, leads] = await Promise.all([
    queryReviewsByGsi(),
    querySitePartitionReviews(),
    queryLegacyReviewLeads(),
  ]);

  const catalog = mergeCatalogReviews(gsiReviews, siteReviews);
  const merged = mergeAdminReviews(catalog, leads);
  const reviews = await enrichAdminReviewsWithOrders(merged);

  return ok({
    reviews,
    counts: {
      total: reviews.length,
      catalog: reviews.filter((r) => r.origin === "catalog").length,
      historical: reviews.filter((r) => r.status === "historical").length,
      published: reviews.filter((r) => r.status === "published").length,
    },
  });
}

function buildReviewItem(
  data: Omit<ProductReview, "reviewId" | "createdAt" | "updatedAt"> & { reviewId?: string }
): StoredReview {
  const reviewId = data.reviewId ?? randomUUID();
  const ts = now();
  return {
    ...data,
    reviewId,
    createdAt: ts,
    updatedAt: ts,
    PK: reviewKeys.pk(data.productSlug),
    SK: reviewKeys.sk(reviewId),
    GSI1PK: reviewKeys.gsi1pk(),
    GSI1SK: reviewKeys.gsi1sk(ts, reviewId),
  };
}

/** Public submit — published immediately, no approval email. */
export async function submitCustomerReview(event: APIGatewayProxyEventV2) {
  const body = JSON.parse(event.body ?? "{}");
  const parsed = submitCustomerReviewSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const productSlug = parsed.data.productSlug || SITE_REVIEW_SLUG;
  if (productSlug !== SITE_REVIEW_SLUG) {
    const product = await docClient.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { PK: productKeys.pk(productSlug), SK: productKeys.sk() },
      })
    );
    if (!product.Item) return badRequest("Product not found");
  }

  const item = buildReviewItem({
    productSlug,
    authorName: parsed.data.authorName,
    rating: parsed.data.rating,
    body: parsed.data.body,
    source: "site",
    published: true,
    authorEmail: parsed.data.email,
    city: parsed.data.city,
    orderId: parsed.data.orderId,
  });

  await docClient.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: item }));
  if (item.published) await recomputeAggregate(productSlug);

  return created({ review: toPublicReview(withoutDbKeys(item)) });
}

/** Admin-only create (imports / manual entries). Defaults to published. */
export async function createProductReview(event: APIGatewayProxyEventV2) {
  const auth = getAuth(event);
  if (!auth?.isAdmin) return forbidden("Admin required");

  const slug = event.pathParameters?.slug;
  if (!slug) return badRequest("Product slug required");

  if (slug !== SITE_REVIEW_SLUG) {
    const product = await docClient.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { PK: productKeys.pk(slug), SK: productKeys.sk() },
      })
    );
    if (!product.Item) return notFound("Product not found");
  }

  const body = JSON.parse(event.body ?? "{}");
  const parsed = createProductReviewSchema.safeParse({ ...body, productSlug: slug });
  if (!parsed.success) return badRequest(parsed.error.message);

  const item = buildReviewItem({
    ...parsed.data,
    productSlug: slug,
    published: parsed.data.published ?? true,
  });

  await docClient.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: item }));
  if (item.published) await recomputeAggregate(slug);

  return created({ review: withoutDbKeys(item) });
}

function isLegacyReviewId(reviewId: string): boolean {
  return reviewId.startsWith("lead:");
}

async function setCatalogReviewPublished(
  productSlug: string,
  reviewId: string,
  published: boolean
): Promise<AdminReview | null> {
  const existing = await docClient.send(
    new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { PK: reviewKeys.pk(productSlug), SK: reviewKeys.sk(reviewId) },
    })
  );
  if (!existing.Item) return null;

  const ts = now();
  const createdAt = String(existing.Item.createdAt ?? ts);
  await docClient.send(
    new UpdateCommand({
      TableName: PRODUCTS_TABLE,
      Key: { PK: reviewKeys.pk(productSlug), SK: reviewKeys.sk(reviewId) },
      UpdateExpression:
        "SET published = :p, updatedAt = :u, GSI1PK = if_not_exists(GSI1PK, :gsi1pk), GSI1SK = if_not_exists(GSI1SK, :gsi1sk)",
      ExpressionAttributeValues: {
        ":p": published,
        ":u": ts,
        ":gsi1pk": reviewKeys.gsi1pk(),
        ":gsi1sk": reviewKeys.gsi1sk(createdAt, reviewId),
      },
    })
  );
  await recomputeAggregate(productSlug);

  const updated = await docClient.send(
    new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { PK: reviewKeys.pk(productSlug), SK: reviewKeys.sk(reviewId) },
    })
  );
  return catalogReviewToAdmin(withoutDbKeys(updated.Item as StoredReview));
}

async function setLegacyLeadReviewPublished(
  sessionId: string,
  createdAt: string,
  published: boolean
): Promise<AdminReview | null> {
  const existing = await docClient.send(
    new GetCommand({
      TableName: CUSTOMERS_TABLE,
      Key: {
        PK: customerKeys.pk(sessionId),
        SK: customerKeys.leadSk(createdAt),
      },
    })
  );
  if (!existing.Item || existing.Item.source !== "review") return null;

  const updatedItem = {
    ...existing.Item,
    published,
    updatedAt: now(),
  };
  await docClient.send(new PutCommand({ TableName: CUSTOMERS_TABLE, Item: updatedItem }));
  return legacyLeadToAdminReview(updatedItem as LegacyReviewLead);
}

/** Admin: Published (on the website) or Historical (admin-only). Does not copy or delete rows. */
export async function updateReviewStatus(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden("Admin required");

  const productSlug = event.pathParameters?.productSlug?.trim();
  const reviewId = event.pathParameters?.reviewId?.trim();
  if (!productSlug || !reviewId) return badRequest("productSlug and reviewId required");

  const parsed = updateAdminReviewStatusSchema.safeParse(JSON.parse(event.body ?? "{}"));
  if (!parsed.success) return badRequest(parsed.error.message);

  const published = parsed.data.status === "published";
  const treatAsLead =
    parsed.data.origin === "legacy_lead" || isLegacyReviewId(reviewId);

  if (treatAsLead) {
    const sessionId = parsed.data.sessionId?.trim();
    const createdAt = parsed.data.createdAt?.trim();
    if (!sessionId || !createdAt) {
      return badRequest("sessionId and createdAt are required to update a historical review");
    }
    const review = await setLegacyLeadReviewPublished(sessionId, createdAt, published);
    if (!review) return notFound("Review not found");
    return ok({ review, status: reviewStatusFromPublished(published) });
  }

  const review = await setCatalogReviewPublished(productSlug, reviewId, published);
  if (!review) return notFound("Review not found");
  return ok({ review, status: reviewStatusFromPublished(published) });
}

/** Admin: permanently remove a review from DynamoDB and the storefront. */
export async function deleteReview(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden("Admin required");

  const productSlug = event.pathParameters?.productSlug?.trim();
  const reviewId = event.pathParameters?.reviewId?.trim();
  if (!productSlug || !reviewId) return badRequest("productSlug and reviewId required");

  const existing = await docClient.send(
    new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { PK: reviewKeys.pk(productSlug), SK: reviewKeys.sk(reviewId) },
    })
  );
  if (!existing.Item) return notFound("Review not found");

  await docClient.send(
    new DeleteCommand({
      TableName: PRODUCTS_TABLE,
      Key: { PK: reviewKeys.pk(productSlug), SK: reviewKeys.sk(reviewId) },
    })
  );
  await recomputeAggregate(productSlug);

  return ok({ deleted: true, reviewId, productSlug });
}

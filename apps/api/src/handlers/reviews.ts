/**
 * Product + site reviews — DynamoDB items under PRODUCT#slug / REVIEW#id.
 * Customer submissions are published immediately. Admin can delete any review.
 * Aggregate lives on product META as ratingAggregate for Product JSON-LD.
 */
import { QueryCommand, PutCommand, GetCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  createProductReviewSchema,
  submitCustomerReviewSchema,
  productKeys,
  reviewKeys,
  SITE_REVIEW_SLUG,
  toPublicReview,
  type ProductReview,
  type ProductRatingAggregate,
} from "@hr-ecom/shared";
import { randomUUID } from "crypto";
import { docClient, PRODUCTS_TABLE, now } from "../lib/db";
import { ok, created, badRequest, forbidden, notFound } from "../lib/response";
import { getAuth, requireAdmin } from "../lib/auth";

type StoredReview = ProductReview & {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
};

function withoutDbKeys(item: StoredReview): ProductReview {
  const { PK: _pk, SK: _sk, GSI1PK: _g1pk, GSI1SK: _g1sk, ...rest } = item;
  return rest;
}

async function queryReviewsByGsi(): Promise<StoredReview[]> {
  const items: StoredReview[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  let pages = 0;
  do {
    const result = await docClient.send(
      new QueryCommand({
        TableName: PRODUCTS_TABLE,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :pk",
        ExpressionAttributeValues: { ":pk": reviewKeys.gsi1pk() },
        ScanIndexForward: false,
        ExclusiveStartKey,
      })
    );
    if (result.Items?.length) items.push(...(result.Items as StoredReview[]));
    ExclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
    pages += 1;
  } while (ExclusiveStartKey && pages < 50);
  return items;
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

/** Public feed of published reviews (site-wide + product). */
export async function listPublishedReviews() {
  const reviews = (await queryReviewsByGsi())
    .map(withoutDbKeys)
    .filter((r) => r.published !== false)
    .map(toPublicReview);

  return ok({ reviews }, { "Cache-Control": "no-store" });
}

/** Admin: all reviews including unpublished leftovers. */
export async function listAdminReviews(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden("Admin required");
  const reviews = (await queryReviewsByGsi()).map(withoutDbKeys);
  return ok({ reviews });
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

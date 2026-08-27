process.env.USE_MEMORY_DB = "true";
process.env.ENVIRONMENT = "local";
process.env.DEV_AUTH_ENABLED = "true";

import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import type { APIGatewayProxyResultV2 } from "aws-lambda";

type ReviewsMod = typeof import("./reviews");
let reviews: ReviewsMod;

before(async () => {
  reviews = await import("./reviews");
});

function event(opts: {
  body?: unknown;
  pathParameters?: Record<string, string>;
  admin?: boolean;
}): APIGatewayProxyEventV2 {
  return {
    version: "2.0",
    routeKey: "$default",
    rawPath: "/reviews",
    rawQueryString: "",
    headers: opts.admin ? { authorization: "Bearer dev:owner@usarakhi.com:admin" } : {},
    requestContext: {
      accountId: "local",
      apiId: "local",
      domainName: "localhost",
      domainPrefix: "local",
      http: { method: "POST", path: "/reviews", protocol: "HTTP/1.1", sourceIp: "127.0.0.1", userAgent: "test" },
      requestId: "test",
      routeKey: "$default",
      stage: "$default",
      time: "",
      timeEpoch: Date.now(),
    },
    body: opts.body ? JSON.stringify(opts.body) : "{}",
    pathParameters: opts.pathParameters,
    isBase64Encoded: false,
  };
}

function parse(res: APIGatewayProxyResultV2 | string) {
  const payload = typeof res === "string" ? res : (res.body ?? "{}");
  return { status: typeof res === "string" ? 200 : res.statusCode, body: JSON.parse(payload) };
}

describe("customer review publish + admin remove", () => {
  it("publishes a customer review immediately and admin delete removes it from the public feed", async () => {
    const created = parse(
      await reviews.submitCustomerReview(
        event({
          body: {
            authorName: "Neha",
            email: "neha@example.com",
            rating: 5,
            body: "Delivery was on time and the Rakhi packaging was beautiful for my brother.",
            city: "San Jose, CA",
          },
        })
      )
    );
    assert.equal(created.status, 201);
    assert.equal(created.body.review.published, true);
    assert.equal(created.body.review.authorName, "Neha");
    assert.equal(created.body.review.authorEmail, undefined);
    const reviewId = created.body.review.reviewId as string;
    const productSlug = created.body.review.productSlug as string;

    const publicList = parse(await reviews.listPublishedReviews(event({})));
    assert.equal(publicList.status, 200);
    assert.equal(
      publicList.body.reviews.some((r: { reviewId: string }) => r.reviewId === reviewId),
      true
    );
    assert.equal(
      publicList.body.reviews.some((r: { authorEmail?: string }) => r.authorEmail),
      false
    );

    const adminList = parse(await reviews.listAdminReviews(event({ admin: true })));
    assert.equal(adminList.status, 200);
    const adminRow = adminList.body.reviews.find((r: { reviewId: string }) => r.reviewId === reviewId);
    assert.equal(adminRow?.authorEmail, "neha@example.com");
    assert.equal(adminRow?.origin, "catalog");
    assert.equal(adminRow?.status, "published");
    assert.equal(adminRow?.canDelete, true);

    const forbidden = parse(await reviews.deleteReview(event({ pathParameters: { productSlug, reviewId } })));
    assert.equal(forbidden.status, 403);

    const deleted = parse(
      await reviews.deleteReview(event({ admin: true, pathParameters: { productSlug, reviewId } }))
    );
    assert.equal(deleted.status, 200);
    assert.equal(deleted.body.deleted, true);

    const after = parse(await reviews.listPublishedReviews(event({})));
    assert.equal(
      after.body.reviews.some((r: { reviewId: string }) => r.reviewId === reviewId),
      false
    );
  });

  it("does not create an unpublished review on customer submit", async () => {
    const created = parse(
      await reviews.submitCustomerReview(
        event({
          body: {
            authorName: "Anjali",
            email: "anjali@example.com",
            rating: 4,
            body: "Would recommend UsaRakhi to other sisters sending Rakhi to the USA.",
          },
        })
      )
    );
    assert.equal(created.status, 201);
    assert.equal(created.body.review.published, true);
  });

  it("lists historical lead reviews alongside catalog reviews without duplicating or mutating leads", async () => {
    const { PutCommand, GetCommand } = await import("@aws-sdk/lib-dynamodb");
    const { docClient, CUSTOMERS_TABLE } = await import("../lib/db");
    const { customerKeys } = await import("@hr-ecom/shared");

    const createdAt = "2026-08-02T15:00:00.000Z";
    const leadItem = {
      leadId: "hist-lead-1",
      sessionId: "sess-review-hist",
      name: "Priya",
      email: "priya-hist@example.com",
      page: "/reviews",
      source: "review",
      metadata: {
        message: "Historical review from before the admin Reviews section existed.",
        rating: "5",
        city: "Fremont, CA",
        orderId: "OC10005",
      },
      PK: customerKeys.pk("sess-review-hist"),
      SK: customerKeys.leadSk(createdAt),
      GSI1PK: customerKeys.gsi1pk(),
      GSI1SK: customerKeys.gsi1sk(createdAt),
      createdAt,
      updatedAt: createdAt,
    };

    await docClient.send(new PutCommand({ TableName: CUSTOMERS_TABLE, Item: leadItem }));

    const adminList = parse(await reviews.listAdminReviews(event({ admin: true })));
    assert.equal(adminList.status, 200);
    const historical = adminList.body.reviews.find(
      (r: { reviewId: string }) => r.reviewId === "lead:hist-lead-1"
    );
    assert.ok(historical);
    assert.equal(historical.origin, "legacy_lead");
    assert.equal(historical.status, "historical");
    assert.equal(historical.canDelete, false);
    assert.equal(historical.authorName, "Priya");
    assert.equal(historical.rating, 5);
    assert.equal(historical.orderId, "OC10005");
    assert.equal(historical.published, false);
    assert.ok((adminList.body.counts?.historical ?? 0) >= 1);

    const after = await docClient.send(
      new GetCommand({
        TableName: CUSTOMERS_TABLE,
        Key: { PK: leadItem.PK, SK: leadItem.SK },
      })
    );
    assert.equal(after.Item?.leadId, "hist-lead-1");
    assert.equal((after.Item?.metadata as { message?: string })?.message, leadItem.metadata.message);
  });

  it("lets admin hide a new review from the website and publish it again without duplicating", async () => {
    const created = parse(
      await reviews.submitCustomerReview(
        event({
          body: {
            authorName: "Kavita",
            email: "kavita-status@example.com",
            rating: 5,
            body: "UsaRakhi delivery to California was fast and the set looked exactly like the photos.",
          },
        })
      )
    );
    assert.equal(created.status, 201);
    const reviewId = created.body.review.reviewId as string;
    const productSlug = created.body.review.productSlug as string;

    const hidden = parse(
      await reviews.updateReviewStatus(
        event({
          admin: true,
          pathParameters: { productSlug, reviewId },
          body: { status: "historical" },
        })
      )
    );
    assert.equal(hidden.status, 200);
    assert.equal(hidden.body.review.status, "historical");
    assert.equal(hidden.body.review.published, false);

    const publicHidden = parse(await reviews.listPublishedReviews(event({})));
    assert.equal(
      publicHidden.body.reviews.some((r: { reviewId: string }) => r.reviewId === reviewId),
      false
    );

    const adminHidden = parse(await reviews.listAdminReviews(event({ admin: true })));
    const adminRow = adminHidden.body.reviews.find((r: { reviewId: string }) => r.reviewId === reviewId);
    assert.equal(adminRow?.status, "historical");

    const shown = parse(
      await reviews.updateReviewStatus(
        event({
          admin: true,
          pathParameters: { productSlug, reviewId },
          body: { status: "published" },
        })
      )
    );
    assert.equal(shown.status, 200);
    assert.equal(shown.body.review.status, "published");

    const publicShown = parse(await reviews.listPublishedReviews(event({})));
    assert.equal(
      publicShown.body.reviews.filter((r: { reviewId: string }) => r.reviewId === reviewId).length,
      1
    );
  });

  it("publishes a historical lead onto the website and can hide it again without copying or deleting", async () => {
    const { PutCommand, GetCommand } = await import("@aws-sdk/lib-dynamodb");
    const { docClient, CUSTOMERS_TABLE } = await import("../lib/db");
    const { customerKeys } = await import("@hr-ecom/shared");

    const createdAt = "2026-08-03T10:00:00.000Z";
    const leadItem = {
      leadId: "hist-lead-status-1",
      sessionId: "sess-review-status",
      name: "Meera",
      email: "meera-status@example.com",
      page: "/reviews",
      source: "review",
      metadata: {
        message: "The Rakhi arrived on time for my brother in New Jersey and the box was lovely.",
        rating: "5",
        city: "Edison, NJ",
        orderId: "US10022",
      },
      PK: customerKeys.pk("sess-review-status"),
      SK: customerKeys.leadSk(createdAt),
      GSI1PK: customerKeys.gsi1pk(),
      GSI1SK: customerKeys.gsi1sk(createdAt),
      createdAt,
      updatedAt: createdAt,
    };
    await docClient.send(new PutCommand({ TableName: CUSTOMERS_TABLE, Item: leadItem }));

    const beforePublic = parse(await reviews.listPublishedReviews(event({})));
    assert.equal(
      beforePublic.body.reviews.some((r: { reviewId: string }) => r.reviewId === "lead:hist-lead-status-1"),
      false
    );

    const published = parse(
      await reviews.updateReviewStatus(
        event({
          admin: true,
          pathParameters: { productSlug: "_site", reviewId: "lead:hist-lead-status-1" },
          body: {
            status: "published",
            origin: "legacy_lead",
            sessionId: leadItem.sessionId,
            createdAt,
          },
        })
      )
    );
    assert.equal(published.status, 200);
    assert.equal(published.body.review.status, "published");
    assert.equal(published.body.review.origin, "legacy_lead");

    const publicShown = parse(await reviews.listPublishedReviews(event({})));
    const publicMatches = publicShown.body.reviews.filter(
      (r: { reviewId: string }) => r.reviewId === "lead:hist-lead-status-1"
    );
    assert.equal(publicMatches.length, 1);
    assert.equal(publicMatches[0].authorName, "Meera");
    assert.equal(publicMatches[0].authorEmail, undefined);

    const historical = parse(
      await reviews.updateReviewStatus(
        event({
          admin: true,
          pathParameters: { productSlug: "_site", reviewId: "lead:hist-lead-status-1" },
          body: {
            status: "historical",
            origin: "legacy_lead",
            sessionId: leadItem.sessionId,
            createdAt,
          },
        })
      )
    );
    assert.equal(historical.status, 200);
    assert.equal(historical.body.review.status, "historical");

    const publicHidden = parse(await reviews.listPublishedReviews(event({})));
    assert.equal(
      publicHidden.body.reviews.some((r: { reviewId: string }) => r.reviewId === "lead:hist-lead-status-1"),
      false
    );

    const adminList = parse(await reviews.listAdminReviews(event({ admin: true })));
    const adminRow = adminList.body.reviews.find(
      (r: { reviewId: string }) => r.reviewId === "lead:hist-lead-status-1"
    );
    assert.ok(adminRow);
    assert.equal(adminRow.status, "historical");

    const stored = await docClient.send(
      new GetCommand({
        TableName: CUSTOMERS_TABLE,
        Key: { PK: leadItem.PK, SK: leadItem.SK },
      })
    );
    assert.equal(stored.Item?.leadId, "hist-lead-status-1");
    assert.equal((stored.Item?.metadata as { message?: string })?.message, leadItem.metadata.message);
    assert.equal(stored.Item?.published, false);
  });
});

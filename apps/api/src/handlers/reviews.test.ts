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

    const publicList = parse(await reviews.listPublishedReviews());
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

    const forbidden = parse(await reviews.deleteReview(event({ pathParameters: { productSlug, reviewId } })));
    assert.equal(forbidden.status, 403);

    const deleted = parse(
      await reviews.deleteReview(event({ admin: true, pathParameters: { productSlug, reviewId } }))
    );
    assert.equal(deleted.status, 200);
    assert.equal(deleted.body.deleted, true);

    const after = parse(await reviews.listPublishedReviews());
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
});

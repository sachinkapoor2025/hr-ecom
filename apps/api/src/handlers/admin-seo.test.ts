process.env.USE_MEMORY_DB = "true";
process.env.ENVIRONMENT = "local";
process.env.DEV_AUTH_ENABLED = "true";
delete process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
delete process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
delete process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS_JSON;

import assert from "node:assert/strict";
import { before, test } from "node:test";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

let getSeoPerformance: typeof import("./admin-seo").getSeoPerformance = async () => {
  throw new Error("SEO handler was not loaded");
};

before(async () => {
  ({ getSeoPerformance } = await import("./admin-seo"));
});

function event(admin: boolean, days?: string): APIGatewayProxyEventV2 {
  return {
    version: "2.0",
    routeKey: "$default",
    rawPath: "/admin/seo/performance",
    rawQueryString: days ? `days=${days}` : "",
    headers: admin ? { authorization: "Bearer dev:owner@usarakhi.com:admin" } : {},
    queryStringParameters: days ? { days } : undefined,
    requestContext: {
      accountId: "local",
      apiId: "local",
      domainName: "localhost",
      domainPrefix: "local",
      http: {
        method: "GET",
        path: "/admin/seo/performance",
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "test",
      },
      requestId: "test",
      routeKey: "$default",
      stage: "$default",
      time: "",
      timeEpoch: Date.now(),
    },
    isBase64Encoded: false,
  };
}

function bodyOf(result: APIGatewayProxyResultV2): { statusCode: number; body: Record<string, unknown> } {
  assert.equal(typeof result, "object");
  const typed = result as { statusCode?: number; body?: string };
  return {
    statusCode: typed.statusCode ?? 0,
    body: typed.body ? (JSON.parse(typed.body) as Record<string, unknown>) : {},
  };
}

test("SEO performance requires an admin", async () => {
  const result = bodyOf(await getSeoPerformance(event(false)));
  assert.equal(result.statusCode, 403);
});

test("SEO performance returns an empty Search Console payload when credentials are unset", async () => {
  const result = bodyOf(await getSeoPerformance(event(true, "28")));
  assert.equal(result.statusCode, 200);
  const searchConsole = result.body.searchConsole as { connected: boolean; queryRows: number };
  assert.equal(searchConsole.connected, false);
  assert.equal(searchConsole.queryRows, 0);
  assert.deepEqual(result.body.queries, []);
  assert.equal(result.body.days, 28);
});

test("SEO performance rejects an unknown day window", async () => {
  const result = bodyOf(await getSeoPerformance(event(true, "10")));
  assert.equal(result.statusCode, 400);
});

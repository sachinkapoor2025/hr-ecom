import { QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { eventKeys, customerKeys, EVENT_TYPES } from "@hr-ecom/shared";
import { docClient, EVENTS_TABLE, CUSTOMERS_TABLE, dayBucket, now } from "../lib/db";
import { ok, forbidden, badRequest } from "../lib/response";
import { requireAdmin } from "../lib/auth";

type RollupItem = Record<string, unknown> & { SK: string; kind?: string; label?: string };

function rangeDays(days: number): string[] {
  const out: string[] = [];
  const base = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() - i);
    out.push(dayBucket(d));
  }
  return out;
}

function parseDays(event: APIGatewayProxyEventV2, fallback = 30, max = 90): number {
  const raw = Number(event.queryStringParameters?.days ?? fallback);
  if (!Number.isFinite(raw) || raw < 1) return fallback;
  return Math.min(Math.floor(raw), max);
}

async function getRollup(day: string): Promise<RollupItem[]> {
  const res = await docClient.send(
    new QueryCommand({
      TableName: EVENTS_TABLE,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": eventKeys.rollupPk(day) },
    })
  );
  return (res.Items ?? []) as RollupItem[];
}

const FUNNEL_TYPES = [
  EVENT_TYPES.PAGE_VIEW,
  EVENT_TYPES.PRODUCT_VIEW,
  EVENT_TYPES.CART_ADD,
  EVENT_TYPES.CHECKOUT_START,
  EVENT_TYPES.PURCHASE,
] as const;

export async function getAnalyticsOverview(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();
  const days = parseDays(event);
  const dayList = rangeDays(days);

  const rollups = await Promise.all(dayList.map((d) => getRollup(d)));

  const totals: Record<string, number> = {};
  const trafficByDay: { day: string; pageViews: number; purchases: number }[] = [];

  dayList.forEach((day, idx) => {
    const items = rollups[idx];
    let pageViews = 0;
    let purchases = 0;
    for (const item of items) {
      if (item.kind === "type") {
        const count = Number(item.count ?? 0);
        totals[item.label as string] = (totals[item.label as string] ?? 0) + count;
        if (item.label === EVENT_TYPES.PAGE_VIEW) pageViews = count;
        if (item.label === EVENT_TYPES.PURCHASE) purchases = count;
      }
    }
    trafficByDay.push({ day, pageViews, purchases });
  });

  // chronological order (oldest first) for charts
  trafficByDay.reverse();

  const funnel = FUNNEL_TYPES.map((type) => ({ type, count: totals[type] ?? 0 }));
  const pageViews = totals[EVENT_TYPES.PAGE_VIEW] ?? 0;
  const purchases = totals[EVENT_TYPES.PURCHASE] ?? 0;
  const conversionRate = pageViews > 0 ? purchases / pageViews : 0;

  return ok({
    days,
    totals,
    funnel,
    trafficByDay,
    conversionRate,
  });
}

export async function getTopProducts(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();
  const days = parseDays(event);
  const rollups = await Promise.all(rangeDays(days).map((d) => getRollup(d)));

  const map = new Map<string, { slug: string; views: number; adds: number }>();
  for (const items of rollups) {
    for (const item of items) {
      if (item.kind !== "product") continue;
      const slug = item.label as string;
      const entry = map.get(slug) ?? { slug, views: 0, adds: 0 };
      entry.views += Number(item.views ?? 0);
      entry.adds += Number(item.adds ?? 0);
      map.set(slug, entry);
    }
  }

  const products = [...map.values()].sort((a, b) => b.views - a.views).slice(0, 25);
  return ok({ days, products });
}

export async function getTopSearches(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();
  const days = parseDays(event);
  const rollups = await Promise.all(rangeDays(days).map((d) => getRollup(d)));

  const map = new Map<string, { term: string; count: number; zero: number }>();
  for (const items of rollups) {
    for (const item of items) {
      if (item.kind !== "search") continue;
      const term = item.label as string;
      const entry = map.get(term) ?? { term, count: 0, zero: 0 };
      entry.count += Number(item.count ?? 0);
      entry.zero += Number(item.zero ?? 0);
      map.set(term, entry);
    }
  }

  const all = [...map.values()].sort((a, b) => b.count - a.count);
  const searches = all.slice(0, 25);
  const zeroResult = all.filter((s) => s.zero > 0).sort((a, b) => b.zero - a.zero).slice(0, 25);
  return ok({ days, searches, zeroResult });
}

interface SessionSummary {
  sessionId: string;
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
  lastPath?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  locale?: string;
  referrer?: string;
  pages: string[];
  products: string[];
}

const SESSION_EVENT_TYPES = [
  EVENT_TYPES.PAGE_VIEW,
  EVENT_TYPES.PRODUCT_VIEW,
  EVENT_TYPES.CART_ADD,
  EVENT_TYPES.CHECKOUT_START,
  EVENT_TYPES.PURCHASE,
  EVENT_TYPES.SEARCH,
] as const;

function mergeSessionEvent(
  sessions: Map<string, SessionSummary>,
  raw: Record<string, unknown>,
  sessionId: string
) {
  const at = (raw.createdAt as string) ?? (raw.at as string) ?? now();
  const path = raw.path as string | undefined;
  const productSlug = raw.productSlug as string | undefined;
  const metadata = (raw.metadata as Record<string, string> | undefined) ?? {};

  const existing = sessions.get(sessionId);
  if (!existing) {
    sessions.set(sessionId, {
      sessionId,
      firstSeen: at,
      lastSeen: at,
      eventCount: 1,
      lastPath: path,
      country: metadata.country,
      timezone: metadata.timezone,
      locale: metadata.locale,
      referrer: (raw.referrer as string | undefined) ?? undefined,
      pages: path ? [path] : [],
      products: productSlug ? [productSlug] : [],
    });
    return;
  }

  existing.eventCount += 1;
  if (at > existing.lastSeen) {
    existing.lastSeen = at;
    existing.lastPath = path ?? existing.lastPath;
    if (metadata.country) existing.country = metadata.country;
    if (metadata.timezone) existing.timezone = metadata.timezone;
    if (metadata.locale) existing.locale = metadata.locale;
  }
  if (at < existing.firstSeen) existing.firstSeen = at;
  if (!existing.referrer && raw.referrer) existing.referrer = raw.referrer as string;
  if (path && !existing.pages.includes(path)) existing.pages.push(path);
  if (productSlug && !existing.products.includes(productSlug)) existing.products.push(productSlug);
  if (!existing.country && metadata.country) existing.country = metadata.country;
  if (!existing.timezone && metadata.timezone) existing.timezone = metadata.timezone;
  if (!existing.locale && metadata.locale) existing.locale = metadata.locale;
}

export async function listSessions(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();
  const days = parseDays(event, 7, 14);

  const sessions = new Map<string, SessionSummary>();

  for (const day of rangeDays(days)) {
    for (const type of SESSION_EVENT_TYPES) {
      const res = await docClient.send(
        new QueryCommand({
          TableName: EVENTS_TABLE,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :pk",
          ExpressionAttributeValues: { ":pk": eventKeys.gsi1pk(type, day) },
          ScanIndexForward: false,
          Limit: 500,
        })
      );
      for (const raw of (res.Items ?? []) as Record<string, unknown>[]) {
        const sessionId = raw.sessionId as string;
        if (!sessionId) continue;
        mergeSessionEvent(sessions, raw, sessionId);
      }
    }
  }

  const list = [...sessions.values()].sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)).slice(0, 100);

  // join identity (best effort, capped by the 100 above)
  await Promise.all(
    list.map(async (s) => {
      const res = await docClient.send(
        new GetCommand({
          TableName: CUSTOMERS_TABLE,
          Key: { PK: customerKeys.pk(s.sessionId), SK: customerKeys.profileSk() },
        })
      );
      if (res.Item) {
        s.name = res.Item.name as string | undefined;
        s.email = res.Item.email as string | undefined;
        s.phone = res.Item.phone as string | undefined;
      }
    })
  );

  return ok({ days, sessions: list });
}

export async function getSessionTimeline(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();
  const sessionId = event.pathParameters?.sessionId;
  if (!sessionId) return badRequest("Session id required");

  const eventsRes = await docClient.send(
    new QueryCommand({
      TableName: EVENTS_TABLE,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": eventKeys.pk(sessionId) },
      ScanIndexForward: true,
    })
  );

  const identityRes = await docClient.send(
    new QueryCommand({
      TableName: CUSTOMERS_TABLE,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": customerKeys.pk(sessionId) },
    })
  );

  const identityItems = (identityRes.Items ?? []) as Record<string, unknown>[];
  const profile = identityItems.find((i) => i.SK === customerKeys.profileSk());
  const leads = identityItems.filter((i) => String(i.SK).startsWith("LEAD#"));

  return ok({
    sessionId,
    profile: profile ?? null,
    leads,
    events: eventsRes.Items ?? [],
  });
}

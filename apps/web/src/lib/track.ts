"use client";

import { getApiUrl } from "./env";
import { getOrCreateSessionId } from "./session";
import { EVENT_TYPES, type EventType } from "@hr-ecom/shared";

interface TrackPayload {
  type: EventType;
  path?: string;
  productSlug?: string;
  query?: string;
  resultCount?: number;
  value?: number;
  metadata?: Record<string, string>;
}

interface QueuedEvent extends TrackPayload {
  sessionId: string;
  referrer?: string;
  at: string;
}

const BATCH_SIZE = 10;
const FLUSH_DELAY_MS = 2500;

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function endpoint(): string {
  return `${getApiUrl()}/events`;
}

/** Send everything queued right now (used on unload + when batch fills). */
export function flushEvents(): void {
  if (typeof window === "undefined" || queue.length === 0) return;
  const events = queue;
  queue = [];
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }

  const body = JSON.stringify({ events });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(endpoint(), blob)) return;
    }
  } catch {
    /* fall through to fetch */
  }

  fetch(endpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* analytics must never break UX */
  });
}

function scheduleFlush(): void {
  if (queue.length >= BATCH_SIZE) {
    flushEvents();
    return;
  }
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    flushEvents();
  }, FLUSH_DELAY_MS);
}

export function track(payload: TrackPayload): void {
  if (typeof window === "undefined") return;
  const sessionId = getOrCreateSessionId();
  if (!sessionId) return;

  queue.push({
    ...payload,
    sessionId,
    path: payload.path ?? window.location.pathname + window.location.search,
    referrer: document.referrer || undefined,
    at: new Date().toISOString(),
  });

  scheduleFlush();
}

export const trackPageView = (path?: string) => track({ type: EVENT_TYPES.PAGE_VIEW, path });
export const trackProductView = (productSlug: string) =>
  track({ type: EVENT_TYPES.PRODUCT_VIEW, productSlug });
export const trackSearch = (query: string, resultCount: number) =>
  track({ type: EVENT_TYPES.SEARCH, query, resultCount });
export const trackCartAdd = (productSlug: string, value?: number) =>
  track({ type: EVENT_TYPES.CART_ADD, productSlug, value });
export const trackCartRemove = (productSlug: string) =>
  track({ type: EVENT_TYPES.CART_REMOVE, productSlug });
export const trackCheckoutStart = (value?: number) =>
  track({ type: EVENT_TYPES.CHECKOUT_START, value });
export const trackPurchase = (value?: number, metadata?: Record<string, string>) =>
  track({ type: EVENT_TYPES.PURCHASE, value, metadata });

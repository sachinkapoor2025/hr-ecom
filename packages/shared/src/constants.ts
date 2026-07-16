export const ORDER_STATUS = {
  PENDING_PAYMENT: "pending_payment",
  PAID: "paid",
  ACCEPTED: "accepted",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  COMPLETE: "complete",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

/** Allowed next statuses an admin can move an order to from its current status. */
export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  [ORDER_STATUS.PENDING_PAYMENT]: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAID]: [
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.COMPLETE,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.REFUNDED,
  ],
  [ORDER_STATUS.ACCEPTED]: [
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.COMPLETE,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.REFUNDED,
  ],
  [ORDER_STATUS.PROCESSING]: [
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.COMPLETE,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.REFUNDED,
  ],
  [ORDER_STATUS.SHIPPED]: [
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.COMPLETE,
    ORDER_STATUS.REFUNDED,
  ],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.COMPLETE, ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.COMPLETE]: [ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.REFUNDED]: [],
};

export const EVENT_TYPES = {
  PAGE_VIEW: "page_view",
  PRODUCT_VIEW: "product_view",
  SEARCH: "search",
  CART_ADD: "cart_add",
  CART_REMOVE: "cart_remove",
  CHECKOUT_START: "checkout_start",
  PURCHASE: "purchase",
  /** Time spent on a page before leave/navigation (metadata.durationMs). */
  SESSION_PING: "session_ping",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

/** Raw analytics events expire after this many days (TTL); rollups are kept. */
export const EVENT_TTL_DAYS = 90;

export const USER_ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
} as const;

export const PAYMENT_REGIONS = {
  US: "US",
  IN: "IN",
} as const;

export const PAYMENT_PROVIDERS = {
  STRIPE: "stripe",
  RAZORPAY: "razorpay",
} as const;

/** Default stock when creating products or seeding catalog. */
export const DEFAULT_PRODUCT_INVENTORY = 200;

/**
 * Backend-only vendor key for hamper fulfillment API / order tagging.
 * Never show this name on the storefront — customers only see "Rakhi Hamper".
 */
export const VENDOR_ORANGE_COUNTY = "orange-county" as const;

/** Public category slug (display name: "Rakhi Hamper"). */
export const ORANGE_COUNTY_CATEGORY_SLUG = "rakhi-hampers" as const;

/**
 * Hamper pricing from vendor cost (Excel). Uses retail margin on selling price:
 *   sale price = cost × 2.0  → 50% margin before coupons  ((P−C)/P)
 *   list/compare-at = cost × 2.5 → sale badge (~20% off list)
 *
 * After spin-the-wheel 6–10% off sale price, net margin stays ~44–47%
 * (≈40–44%+ band at the higher discount end).
 */
export const ORANGE_COUNTY_LIST_MARKUP = 2.5;
export const ORANGE_COUNTY_SALE_MARKUP = 2.0;

/** Email restock alert when inventory drops to this level or below. */
export const LOW_STOCK_THRESHOLD = 10;

export const LOW_STOCK_ALERT_EMAIL = "dgv@mydgv.com";

/** Minimum units sold to show in "Fast Selling" section and badge. */
export const FAST_SELLING_THRESHOLD = 10;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type PaymentRegion = (typeof PAYMENT_REGIONS)[keyof typeof PAYMENT_REGIONS];
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[keyof typeof PAYMENT_PROVIDERS];

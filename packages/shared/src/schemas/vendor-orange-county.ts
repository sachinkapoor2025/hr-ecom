import { z } from "zod";

/** Default lookback so vendors do not re-import the full history. */
export const VENDOR_ORDERS_DEFAULT_DAYS = 15;

/** Vendor posts AWB when they ship an order. */
export const vendorShipmentUpdateSchema = z.object({
  /** Same as path orderId; accepted for convenience / validation. */
  orderNumber: z.string().min(1).max(80).optional(),
  courierName: z.string().trim().min(1).max(80),
  awb: z.string().trim().min(3).max(80),
});

export type VendorShipmentUpdate = z.infer<typeof vendorShipmentUpdateSchema>;

/** Vendor posts tracking status changes. */
export const vendorTrackingUpdateSchema = z.object({
  orderNumber: z.string().min(1).max(80).optional(),
  currentStatus: z.string().trim().min(1).max(80),
  note: z.string().trim().max(500).optional(),
});

export type VendorTrackingUpdate = z.infer<typeof vendorTrackingUpdateSchema>;

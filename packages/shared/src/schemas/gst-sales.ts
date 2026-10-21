import { z } from "zod";

/** Supplier block printed on every GST tax invoice. Stored at CONFIG#GST. */
export const gstSupplierSettingsSchema = z
  .object({
    legalName: z.string().trim().min(1, "Legal name is required").max(120),
    tradeName: z.string().trim().max(120).default(""),
    gstin: z.string().trim().max(15).default(""),
    address: z.string().trim().max(400).default(""),
    stateName: z.string().trim().max(80).default(""),
    stateCode: z.string().trim().max(2).default(""),
    pincode: z.string().trim().max(10).default(""),
    email: z.string().trim().max(120).default(""),
    phone: z.string().trim().max(30).default(""),
    lutNumber: z.string().trim().max(40).default(""),
  })
  .superRefine((value, ctx) => {
    const gstin = value.gstin.toUpperCase();
    if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GSTIN must be 15 characters (for example 27AAAAA0000A1Z5)",
        path: ["gstin"],
      });
    }
    if (value.stateCode && !/^\d{2}$/.test(value.stateCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "State code must be 2 digits (for example 27)",
        path: ["stateCode"],
      });
    }
  })
  .transform((value) => ({
    ...value,
    gstin: value.gstin.toUpperCase(),
  }));

export type GstSupplierSettings = z.infer<typeof gstSupplierSettingsSchema>;

export const defaultGstSupplierSettings: GstSupplierSettings = {
  legalName: "UsaRakhi",
  tradeName: "UsaRakhi",
  gstin: "",
  address: "",
  stateName: "",
  stateCode: "",
  pincode: "",
  email: "order@usarakhi.com",
  phone: "+91 9266467887",
  lutNumber: "",
};

export const gstSalesQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  provider: z.enum(["all", "stripe", "razorpay"]).default("all"),
  usdInrRate: z.coerce.number().positive().max(200).optional(),
});

export type GstSalesQuery = z.infer<typeof gstSalesQuerySchema>;

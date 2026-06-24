import { z } from "zod";

export const leadCaptureSchema = z.object({
  sessionId: z.string().min(1),
  userId: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  page: z.string().optional(),
  productSlug: z.string().optional(),
  source: z.enum(["checkout", "newsletter", "product", "browse", "admin"]).default("browse"),
  metadata: z.record(z.string()).optional(),
});

export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;

export type Lead = LeadCaptureInput & {
  leadId: string;
  createdAt: string;
  updatedAt: string;
};

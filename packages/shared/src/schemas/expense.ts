import { z } from "zod";

export const LEDGER_CURRENCIES = ["USD", "INR"] as const;

export type LedgerCurrency = (typeof LEDGER_CURRENCIES)[number];

export const EXPENSE_MAX_BILL_IMAGES = 10;

export const EXPENSE_TYPES = [
  "shipping_charges",
  "bills",
  "marketing",
  "office_expense",
  "other",
] as const;

export type ExpenseType = (typeof EXPENSE_TYPES)[number];

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  shipping_charges: "Shipping Charges",
  bills: "Bills",
  marketing: "Marketing",
  office_expense: "Office Expense",
  other: "Other",
};

const billUrlSchema = z.string().url();

export const createExpenseSchema = z
  .object({
    amount: z.number().positive(),
    currency: z.enum(LEDGER_CURRENCIES).default("USD"),
    expenseType: z.enum(EXPENSE_TYPES),
    description: z.string().trim().max(2000).optional(),
    expenseDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "expenseDate must be YYYY-MM-DD"),
    /** True when this purchase has no bill/invoice. */
    noBill: z.boolean().default(false),
    /** Up to 10 bill/invoice image URLs (presigned upload). */
    billImageUrls: z.array(billUrlSchema).max(EXPENSE_MAX_BILL_IMAGES).optional(),
    /** @deprecated use billImageUrls */
    billImageUrl: z.string().url().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const urls = [
      ...(data.billImageUrls ?? []),
      ...(data.billImageUrl && data.billImageUrl.trim() ? [data.billImageUrl.trim()] : []),
    ];
    const unique = Array.from(new Set(urls));
    if (!data.noBill && unique.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Upload at least one bill, or check “This purchase doesn’t have a bill”",
        path: ["billImageUrls"],
      });
    }
    if (data.noBill && unique.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Clear bill uploads when marking purchase as having no bill",
        path: ["noBill"],
      });
    }
    if (unique.length > EXPENSE_MAX_BILL_IMAGES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Maximum ${EXPENSE_MAX_BILL_IMAGES} bill images allowed`,
        path: ["billImageUrls"],
      });
    }
  });

export const updateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.enum(LEDGER_CURRENCIES).optional(),
  expenseType: z.enum(EXPENSE_TYPES).optional(),
  description: z.string().trim().max(2000).optional(),
  expenseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "expenseDate must be YYYY-MM-DD")
    .optional(),
  noBill: z.boolean().optional(),
  billImageUrls: z.array(billUrlSchema).max(EXPENSE_MAX_BILL_IMAGES).optional(),
  billImageUrl: z.string().url().optional().or(z.literal("")),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export type Expense = {
  expenseId: string;
  amount: number;
  currency: LedgerCurrency;
  expenseType: ExpenseType;
  description?: string;
  expenseDate: string;
  noBill?: boolean;
  billImageUrls?: string[];
  /** First bill URL (legacy / convenience). */
  billImageUrl?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

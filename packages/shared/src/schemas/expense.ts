import { z } from "zod";

export const LEDGER_CURRENCIES = ["USD", "INR"] as const;

export type LedgerCurrency = (typeof LEDGER_CURRENCIES)[number];

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

export const createExpenseSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(LEDGER_CURRENCIES).default("USD"),
  expenseType: z.enum(EXPENSE_TYPES),
  description: z.string().trim().max(2000).optional(),
  expenseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "expenseDate must be YYYY-MM-DD"),
  /** Optional bill/invoice image URL (presigned upload). */
  billImageUrl: z.string().url().optional().or(z.literal("")),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export type Expense = {
  expenseId: string;
  amount: number;
  currency: LedgerCurrency;
  expenseType: ExpenseType;
  description?: string;
  expenseDate: string;
  billImageUrl?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

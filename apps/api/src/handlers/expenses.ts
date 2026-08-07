import { v4 as uuidv4 } from "uuid";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { ScanCommand, GetCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseKeys,
  EXPENSE_MAX_BILL_IMAGES,
  type Expense,
  type LedgerCurrency,
} from "@hr-ecom/shared";
import { requireSuperAdmin } from "../lib/auth";
import { docClient, CONFIG_TABLE, now } from "../lib/db";
import { ok, created, badRequest, forbidden, notFound } from "../lib/response";

type StoredExpense = Expense & { PK: string; SK: string };

function normalizeCurrency(value: unknown): LedgerCurrency {
  return value === "INR" ? "INR" : "USD";
}

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

function normalizeBillUrls(item: {
  billImageUrls?: string[];
  billImageUrl?: string;
  noBill?: boolean;
}): { noBill: boolean; billImageUrls: string[]; billImageUrl?: string } {
  const noBill = Boolean(item.noBill);
  if (noBill) return { noBill: true, billImageUrls: [] };
  const urls = Array.from(
    new Set(
      [
        ...(item.billImageUrls ?? []),
        ...(item.billImageUrl?.trim() ? [item.billImageUrl.trim()] : []),
      ].filter(Boolean)
    )
  ).slice(0, EXPENSE_MAX_BILL_IMAGES);
  return {
    noBill: false,
    billImageUrls: urls,
    ...(urls[0] ? { billImageUrl: urls[0] } : {}),
  };
}

function toPublic(item: StoredExpense): Expense {
  const bills = normalizeBillUrls(item);
  return {
    expenseId: item.expenseId,
    amount: item.amount,
    currency: normalizeCurrency(item.currency),
    expenseType: item.expenseType,
    description: item.description,
    expenseDate: item.expenseDate,
    noBill: bills.noBill,
    billImageUrls: bills.billImageUrls,
    billImageUrl: bills.billImageUrl,
    createdBy: item.createdBy,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function resolveBillFields(input: {
  noBill?: boolean;
  billImageUrls?: string[];
  billImageUrl?: string;
}): Pick<Expense, "noBill" | "billImageUrls" | "billImageUrl"> {
  const noBill = Boolean(input.noBill);
  if (noBill) {
    return { noBill: true, billImageUrls: [] };
  }
  const urls = Array.from(
    new Set(
      [
        ...(input.billImageUrls ?? []),
        ...(input.billImageUrl?.trim() ? [input.billImageUrl.trim()] : []),
      ].filter(Boolean)
    )
  ).slice(0, EXPENSE_MAX_BILL_IMAGES);
  return {
    noBill: false,
    billImageUrls: urls,
    ...(urls[0] ? { billImageUrl: urls[0] } : {}),
  };
}

async function listExpenseItems(): Promise<StoredExpense[]> {
  const items: StoredExpense[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const result = await docClient.send(
      new ScanCommand({
        TableName: CONFIG_TABLE,
        FilterExpression: "begins_with(PK, :p) AND SK = :sk",
        ExpressionAttributeValues: {
          ":p": expenseKeys.pkPrefix(),
          ":sk": expenseKeys.sk(),
        },
        ExclusiveStartKey,
      })
    );
    items.push(...((result.Items ?? []) as StoredExpense[]));
    ExclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (ExclusiveStartKey);

  return items.sort((a, b) => {
    const byDate = (b.expenseDate ?? "").localeCompare(a.expenseDate ?? "");
    if (byDate !== 0) return byDate;
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });
}

export async function listExpenses(event: APIGatewayProxyEventV2) {
  if (!requireSuperAdmin(event)) return forbidden("Super admin access required");
  const expenses = (await listExpenseItems()).map(toPublic);
  const totalByCurrency = {
    USD: roundMoney(
      expenses.filter((e) => e.currency === "USD").reduce((sum, e) => sum + e.amount, 0)
    ),
    INR: roundMoney(
      expenses.filter((e) => e.currency === "INR").reduce((sum, e) => sum + e.amount, 0)
    ),
  };
  return ok({
    expenses,
    count: expenses.length,
    totalByCurrency,
    totalAmount: totalByCurrency.USD,
    currency: "USD",
  });
}

export async function createExpense(event: APIGatewayProxyEventV2) {
  const auth = requireSuperAdmin(event);
  if (!auth) return forbidden("Super admin access required");

  const parsed = createExpenseSchema.safeParse(JSON.parse(event.body ?? "{}"));
  if (!parsed.success) return badRequest(parsed.error.message);

  const expenseId = uuidv4();
  const timestamp = now();
  const bills = resolveBillFields(parsed.data);
  const item: StoredExpense = {
    PK: expenseKeys.pk(expenseId),
    SK: expenseKeys.sk(),
    expenseId,
    amount: parsed.data.amount,
    currency: normalizeCurrency(parsed.data.currency),
    expenseType: parsed.data.expenseType,
    description: parsed.data.description?.trim() || undefined,
    expenseDate: parsed.data.expenseDate,
    ...bills,
    createdBy: auth.email || auth.userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await docClient.send(new PutCommand({ TableName: CONFIG_TABLE, Item: item }));
  return created({ expense: toPublic(item) });
}

export async function updateExpense(event: APIGatewayProxyEventV2) {
  const auth = requireSuperAdmin(event);
  if (!auth) return forbidden("Super admin access required");

  const expenseId = event.pathParameters?.expenseId?.trim();
  if (!expenseId) return badRequest("expenseId required");

  const parsed = updateExpenseSchema.safeParse(JSON.parse(event.body ?? "{}"));
  if (!parsed.success) return badRequest(parsed.error.message);

  const existing = await docClient.send(
    new GetCommand({
      TableName: CONFIG_TABLE,
      Key: { PK: expenseKeys.pk(expenseId), SK: expenseKeys.sk() },
    })
  );
  if (!existing.Item) return notFound("Expense not found");

  const prev = existing.Item as StoredExpense;
  const billsTouched =
    parsed.data.noBill !== undefined ||
    parsed.data.billImageUrls !== undefined ||
    parsed.data.billImageUrl !== undefined;

  const bills = billsTouched
    ? resolveBillFields({
        noBill: parsed.data.noBill ?? prev.noBill,
        billImageUrls: parsed.data.billImageUrls ?? prev.billImageUrls,
        billImageUrl:
          parsed.data.billImageUrl !== undefined
            ? parsed.data.billImageUrl
            : prev.billImageUrl,
      })
    : resolveBillFields(prev);

  if (!bills.noBill && (bills.billImageUrls?.length ?? 0) === 0) {
    return badRequest("Upload at least one bill, or mark purchase as having no bill");
  }

  const updated: StoredExpense = {
    ...prev,
    ...(parsed.data.amount !== undefined ? { amount: parsed.data.amount } : {}),
    ...(parsed.data.expenseType !== undefined ? { expenseType: parsed.data.expenseType } : {}),
    ...(parsed.data.description !== undefined
      ? { description: parsed.data.description.trim() || undefined }
      : {}),
    ...(parsed.data.expenseDate !== undefined ? { expenseDate: parsed.data.expenseDate } : {}),
    currency:
      parsed.data.currency !== undefined
        ? normalizeCurrency(parsed.data.currency)
        : normalizeCurrency(prev.currency),
    ...bills,
    updatedAt: now(),
  };

  // Drop legacy single URL when no-bill
  if (bills.noBill) {
    delete (updated as { billImageUrl?: string }).billImageUrl;
  }

  await docClient.send(new PutCommand({ TableName: CONFIG_TABLE, Item: updated }));
  return ok({ expense: toPublic(updated) });
}

export async function deleteExpense(event: APIGatewayProxyEventV2) {
  if (!requireSuperAdmin(event)) return forbidden("Super admin access required");
  const expenseId = event.pathParameters?.expenseId?.trim();
  if (!expenseId) return badRequest("expenseId required");

  await docClient.send(
    new DeleteCommand({
      TableName: CONFIG_TABLE,
      Key: { PK: expenseKeys.pk(expenseId), SK: expenseKeys.sk() },
    })
  );
  return ok({ deleted: true, expenseId });
}

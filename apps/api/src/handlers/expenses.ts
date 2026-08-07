import { v4 as uuidv4 } from "uuid";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { ScanCommand, GetCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseKeys,
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

function toPublic(item: StoredExpense): Expense {
  return {
    expenseId: item.expenseId,
    amount: item.amount,
    currency: normalizeCurrency(item.currency),
    expenseType: item.expenseType,
    description: item.description,
    expenseDate: item.expenseDate,
    billImageUrl: item.billImageUrl,
    createdBy: item.createdBy,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
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
    /** @deprecated use totalByCurrency */
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
  const billImageUrl = parsed.data.billImageUrl?.trim() || undefined;
  const currency = normalizeCurrency(parsed.data.currency);
  const item: StoredExpense = {
    PK: expenseKeys.pk(expenseId),
    SK: expenseKeys.sk(),
    expenseId,
    amount: parsed.data.amount,
    currency,
    expenseType: parsed.data.expenseType,
    description: parsed.data.description?.trim() || undefined,
    expenseDate: parsed.data.expenseDate,
    ...(billImageUrl ? { billImageUrl } : {}),
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
  const billRaw = parsed.data.billImageUrl;
  const billImageUrl =
    billRaw === undefined
      ? prev.billImageUrl
      : billRaw.trim()
        ? billRaw.trim()
        : undefined;

  const updated: StoredExpense = {
    ...prev,
    ...(parsed.data.amount !== undefined ? { amount: parsed.data.amount } : {}),
    ...(parsed.data.expenseType !== undefined ? { expenseType: parsed.data.expenseType } : {}),
    ...(parsed.data.description !== undefined
      ? { description: parsed.data.description.trim() || undefined }
      : {}),
    ...(parsed.data.expenseDate !== undefined ? { expenseDate: parsed.data.expenseDate } : {}),
    billImageUrl,
    currency:
      parsed.data.currency !== undefined
        ? normalizeCurrency(parsed.data.currency)
        : normalizeCurrency(prev.currency),
    updatedAt: now(),
  };

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

import { v4 as uuidv4 } from "uuid";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { ScanCommand, GetCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import {
  createPaymentLedgerSchema,
  updatePaymentLedgerSchema,
  paymentLedgerKeys,
  type PaymentLedgerEntry,
} from "@hr-ecom/shared";
import { requireSuperAdmin } from "../lib/auth";
import { docClient, CONFIG_TABLE, now } from "../lib/db";
import { ok, created, badRequest, forbidden, notFound } from "../lib/response";

type StoredPayment = PaymentLedgerEntry & { PK: string; SK: string };

function toPublic(item: StoredPayment): PaymentLedgerEntry {
  return {
    paymentId: item.paymentId,
    amount: item.amount,
    currency: "USD",
    receivedDate: item.receivedDate,
    paymentSource: item.paymentSource,
    notes: item.notes,
    createdBy: item.createdBy,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function listPaymentItems(): Promise<StoredPayment[]> {
  const items: StoredPayment[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const result = await docClient.send(
      new ScanCommand({
        TableName: CONFIG_TABLE,
        FilterExpression: "begins_with(PK, :p) AND SK = :sk",
        ExpressionAttributeValues: {
          ":p": paymentLedgerKeys.pkPrefix(),
          ":sk": paymentLedgerKeys.sk(),
        },
        ExclusiveStartKey,
      })
    );
    items.push(...((result.Items ?? []) as StoredPayment[]));
    ExclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (ExclusiveStartKey);

  return items.sort((a, b) => {
    const byDate = (b.receivedDate ?? "").localeCompare(a.receivedDate ?? "");
    if (byDate !== 0) return byDate;
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });
}

export async function listPaymentLedger(event: APIGatewayProxyEventV2) {
  if (!requireSuperAdmin(event)) return forbidden("Super admin access required");
  const payments = (await listPaymentItems()).map(toPublic);
  const totalAmount = Math.round(payments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100;
  return ok({ payments, count: payments.length, totalAmount, currency: "USD" });
}

export async function createPaymentLedgerEntry(event: APIGatewayProxyEventV2) {
  const auth = requireSuperAdmin(event);
  if (!auth) return forbidden("Super admin access required");

  const parsed = createPaymentLedgerSchema.safeParse(JSON.parse(event.body ?? "{}"));
  if (!parsed.success) return badRequest(parsed.error.message);

  const paymentId = uuidv4();
  const timestamp = now();
  const item: StoredPayment = {
    PK: paymentLedgerKeys.pk(paymentId),
    SK: paymentLedgerKeys.sk(),
    paymentId,
    amount: parsed.data.amount,
    currency: "USD",
    receivedDate: parsed.data.receivedDate,
    paymentSource: parsed.data.paymentSource,
    notes: parsed.data.notes?.trim() || undefined,
    createdBy: auth.email || auth.userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await docClient.send(new PutCommand({ TableName: CONFIG_TABLE, Item: item }));
  return created({ payment: toPublic(item) });
}

export async function updatePaymentLedgerEntry(event: APIGatewayProxyEventV2) {
  const auth = requireSuperAdmin(event);
  if (!auth) return forbidden("Super admin access required");

  const paymentId = event.pathParameters?.paymentId?.trim();
  if (!paymentId) return badRequest("paymentId required");

  const parsed = updatePaymentLedgerSchema.safeParse(JSON.parse(event.body ?? "{}"));
  if (!parsed.success) return badRequest(parsed.error.message);

  const existing = await docClient.send(
    new GetCommand({
      TableName: CONFIG_TABLE,
      Key: { PK: paymentLedgerKeys.pk(paymentId), SK: paymentLedgerKeys.sk() },
    })
  );
  if (!existing.Item) return notFound("Payment record not found");

  const prev = existing.Item as StoredPayment;
  const updated: StoredPayment = {
    ...prev,
    ...(parsed.data.amount !== undefined ? { amount: parsed.data.amount } : {}),
    ...(parsed.data.receivedDate !== undefined ? { receivedDate: parsed.data.receivedDate } : {}),
    ...(parsed.data.paymentSource !== undefined
      ? { paymentSource: parsed.data.paymentSource }
      : {}),
    ...(parsed.data.notes !== undefined
      ? { notes: parsed.data.notes.trim() || undefined }
      : {}),
    updatedAt: now(),
  };

  await docClient.send(new PutCommand({ TableName: CONFIG_TABLE, Item: updated }));
  return ok({ payment: toPublic(updated) });
}

export async function deletePaymentLedgerEntry(event: APIGatewayProxyEventV2) {
  if (!requireSuperAdmin(event)) return forbidden("Super admin access required");
  const paymentId = event.pathParameters?.paymentId?.trim();
  if (!paymentId) return badRequest("paymentId required");

  await docClient.send(
    new DeleteCommand({
      TableName: CONFIG_TABLE,
      Key: { PK: paymentLedgerKeys.pk(paymentId), SK: paymentLedgerKeys.sk() },
    })
  );
  return ok({ deleted: true, paymentId });
}

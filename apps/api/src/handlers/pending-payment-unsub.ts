import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  pendingPaymentUnsubscribeSchema,
  pendingPaymentUnsubKeys,
  type PendingPaymentUnsubRecord,
  type PendingPaymentUnsubSource,
} from "@hr-ecom/shared";
import { requireAdmin } from "../lib/auth";
import { docClient, PENDING_PAYMENT_UNSUB_TABLE, now } from "../lib/db";
import { ok, badRequest, created, forbidden, unauthorized } from "../lib/response";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** True when this email opted out of pending-payment reminder emails. */
export async function isPendingPaymentReminderUnsubscribed(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@")) return false;

  try {
    const res = await docClient.send(
      new GetCommand({
        TableName: PENDING_PAYMENT_UNSUB_TABLE,
        Key: {
          PK: pendingPaymentUnsubKeys.pk(normalized),
          SK: pendingPaymentUnsubKeys.sk(),
        },
      })
    );
    return Boolean(res.Item);
  } catch (err) {
    console.error("Pending payment unsub lookup failed:", err);
    // Fail open so a table/permission glitch does not block all reminders.
    return false;
  }
}

async function putUnsub(email: string, source: PendingPaymentUnsubSource) {
  const timestamp = now();
  await docClient.send(
    new PutCommand({
      TableName: PENDING_PAYMENT_UNSUB_TABLE,
      Item: {
        PK: pendingPaymentUnsubKeys.pk(email),
        SK: pendingPaymentUnsubKeys.sk(),
        email,
        unsubscribedAt: timestamp,
        source,
        updatedAt: timestamp,
      },
    })
  );
  return { email, unsubscribedAt: timestamp, source } satisfies PendingPaymentUnsubRecord;
}

/** Public: add email to pending-payment reminder unsubscribe list. */
export async function unsubscribePendingPaymentReminders(event: APIGatewayProxyEventV2) {
  let body: unknown;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return badRequest("Invalid JSON");
  }

  const parsed = pendingPaymentUnsubscribeSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid email");

  const email = normalizeEmail(parsed.data.email);
  const record = await putUnsub(email, "payment_reminder");

  return created({
    ok: true,
    email: record.email,
    message:
      "You have been unsubscribed from pending-payment reminder emails. You will still receive order status updates if you place an order.",
  });
}

/** Optional health/debug — confirm an email is on the list (no PII beyond request). */
export async function checkPendingPaymentUnsubscribe(event: APIGatewayProxyEventV2) {
  const email = normalizeEmail(event.queryStringParameters?.email ?? "");
  if (!email.includes("@")) return badRequest("email query required");
  const unsubscribed = await isPendingPaymentReminderUnsubscribed(email);
  return ok({ email, unsubscribed });
}

/** Admin: list unsubscribed emails (same DynamoDB table as public opt-out). */
export async function listPendingPaymentUnsubs(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return unauthorized("Admin access required");

  const items: PendingPaymentUnsubRecord[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const res = await docClient.send(
      new ScanCommand({
        TableName: PENDING_PAYMENT_UNSUB_TABLE,
        ExclusiveStartKey,
        Limit: 200,
      })
    );
    for (const raw of res.Items ?? []) {
      const email = typeof raw.email === "string" ? normalizeEmail(raw.email) : "";
      if (!email.includes("@")) continue;
      items.push({
        email,
        unsubscribedAt:
          typeof raw.unsubscribedAt === "string"
            ? raw.unsubscribedAt
            : typeof raw.updatedAt === "string"
              ? raw.updatedAt
              : "",
        source: raw.source === "admin" ? "admin" : "payment_reminder",
      });
    }
    ExclusiveStartKey = res.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (ExclusiveStartKey);

  items.sort((a, b) => (b.unsubscribedAt || "").localeCompare(a.unsubscribedAt || ""));
  return ok({ items, count: items.length });
}

/** Admin: add email to pending-payment reminder unsubscribe list. */
export async function adminAddPendingPaymentUnsub(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();

  let body: unknown;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return badRequest("Invalid JSON");
  }

  const parsed = pendingPaymentUnsubscribeSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid email");

  const email = normalizeEmail(parsed.data.email);
  const record = await putUnsub(email, "admin");
  return created({ ok: true, item: record });
}

/** Admin: remove email from pending-payment reminder unsubscribe list. */
export async function adminRemovePendingPaymentUnsub(event: APIGatewayProxyEventV2) {
  if (!requireAdmin(event)) return forbidden();

  const email = normalizeEmail(
    decodeURIComponent(event.pathParameters?.email ?? event.queryStringParameters?.email ?? "")
  );
  if (!email.includes("@")) return badRequest("email required");

  await docClient.send(
    new DeleteCommand({
      TableName: PENDING_PAYMENT_UNSUB_TABLE,
      Key: {
        PK: pendingPaymentUnsubKeys.pk(email),
        SK: pendingPaymentUnsubKeys.sk(),
      },
    })
  );
  return ok({ ok: true, email });
}

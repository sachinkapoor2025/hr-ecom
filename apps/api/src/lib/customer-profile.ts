import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { customerKeys } from "@hr-ecom/shared";
import { docClient, CUSTOMERS_TABLE, now } from "./db";

function normalizeEmail(email?: string): string | undefined {
  const trimmed = email?.trim();
  if (!trimmed || !trimmed.includes("@")) return undefined;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : undefined;
}

function pickContactField(incoming?: string, existing?: string): string | undefined {
  const next = incoming?.trim();
  if (next) return next;
  return existing;
}

/** Merge contact fields onto the session profile (used by leads, checkout, cart). */
export async function upsertSessionProfile(
  sessionId: string,
  fields: { name?: string; email?: string; phone?: string }
): Promise<void> {
  const timestamp = now();
  const email = normalizeEmail(fields.email);

  const existing = await docClient.send(
    new GetCommand({
      TableName: CUSTOMERS_TABLE,
      Key: { PK: customerKeys.pk(sessionId), SK: customerKeys.profileSk() },
    })
  );
  const prev = existing.Item ?? {};

  await docClient.send(
    new PutCommand({
      TableName: CUSTOMERS_TABLE,
      Item: {
        sessionId,
        PK: customerKeys.pk(sessionId),
        SK: customerKeys.profileSk(),
        createdAt: (prev.createdAt as string) ?? timestamp,
        lastSeenAt: timestamp,
        updatedAt: timestamp,
        name: pickContactField(fields.name, prev.name as string | undefined),
        email: email ?? (prev.email as string | undefined),
        phone: pickContactField(fields.phone, prev.phone as string | undefined),
      },
    })
  );
}

/**
 * In-memory DynamoDB fallback for local dev without Docker.
 * Enable with USE_MEMORY_DB=true
 */
import type {
  GetCommandInput,
  PutCommandInput,
  DeleteCommandInput,
  QueryCommandInput,
  ScanCommandInput,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";

type Item = Record<string, unknown>;

const store = new Map<string, Item>();

function itemKey(pk: unknown, sk: unknown): string {
  return `${pk}::${sk}`;
}

function matchKeyCondition(
  item: Item,
  keyCondition: string | undefined,
  values: Record<string, unknown> | undefined
): boolean {
  if (!keyCondition || !values) return true;
  if (keyCondition.includes("PK = :pk AND begins_with(SK, :sk)")) {
    return item.PK === values[":pk"] && String(item.SK).startsWith(String(values[":sk"]));
  }
  if (keyCondition.includes("GSI1PK = :pk")) {
    return item.GSI1PK === values[":pk"];
  }
  if (keyCondition.includes("GSI2PK = :pk")) {
    return item.GSI2PK === values[":pk"];
  }
  if (keyCondition.includes("PK = :pk")) {
    return item.PK === values[":pk"] && (!values[":sk"] || item.SK === values[":sk"]);
  }
  return true;
}

function matchFilter(item: Item, expression?: string, values?: Record<string, unknown>): boolean {
  if (!expression || !values) return true;
  if (expression.includes("begins_with(PK, :prefix)")) {
    return String(item.PK).startsWith(String(values[":prefix"])) && item.SK === values[":sk"];
  }
  if (expression.includes("orderId = :oid")) {
    return item.orderId === values[":oid"];
  }
  return true;
}

function applyUpdate(item: Item, input: UpdateCommandInput): Item {
  const updated = { ...item };
  const values = input.ExpressionAttributeValues ?? {};
  const names = input.ExpressionAttributeNames ?? {};

  if (input.UpdateExpression?.includes("#status")) {
    const statusKey = names["#status"] ?? "status";
    updated[statusKey] = values[":status"];
  }
  if (input.UpdateExpression?.includes("paymentIntentId")) {
    updated.paymentIntentId = values[":pid"];
  }
  if (input.UpdateExpression?.includes("razorpayPaymentId")) {
    updated.razorpayPaymentId = values[":pid"];
  }
  if (input.UpdateExpression?.includes("updatedAt")) {
    updated.updatedAt = values[":now"];
  }
  return updated;
}

export const memoryStore = {
  send: async (command: { input: unknown; constructor: { name: string } }) => {
    const name = command.constructor.name;
    const input = command.input as Record<string, unknown>;

    if (name === "PutCommand") {
      const { Item } = input as PutCommandInput;
      if (Item) store.set(itemKey(Item.PK, Item.SK), { ...Item });
      return {};
    }

    if (name === "GetCommand") {
      const { Key } = input as GetCommandInput;
      if (!Key) return { Item: undefined };
      const item = store.get(itemKey(Key.PK, Key.SK));
      return { Item: item ? { ...item } : undefined };
    }

    if (name === "DeleteCommand") {
      const { Key } = input as DeleteCommandInput;
      if (Key) store.delete(itemKey(Key.PK, Key.SK));
      return {};
    }

    if (name === "QueryCommand") {
      const q = input as QueryCommandInput;
      let items = [...store.values()];
      items = items.filter((item) =>
        matchKeyCondition(item, q.KeyConditionExpression, q.ExpressionAttributeValues)
      );
      items = items.filter((item) =>
        matchFilter(item, q.FilterExpression, q.ExpressionAttributeValues)
      );
      if (q.IndexName === "GSI2" && q.ScanIndexForward === false) {
        items.sort((a, b) => String(b.GSI2SK).localeCompare(String(a.GSI2SK)));
      }
      if (q.Limit) items = items.slice(0, q.Limit);
      return { Items: items };
    }

    if (name === "ScanCommand") {
      const s = input as ScanCommandInput;
      let items = [...store.values()];
      items = items.filter((item) =>
        matchFilter(item, s.FilterExpression, s.ExpressionAttributeValues)
      );
      return { Items: items };
    }

    if (name === "UpdateCommand") {
      const u = input as UpdateCommandInput;
      if (!u.Key) return {};
      const key = itemKey(u.Key.PK, u.Key.SK);
      const existing = store.get(key);
      if (!existing) return {};
      const updated = applyUpdate(existing, u);
      store.set(key, updated);
      return { Attributes: updated };
    }

    return {};
  },
};

export function clearMemoryStore() {
  store.clear();
}

export function getMemoryStoreSize() {
  return store.size;
}

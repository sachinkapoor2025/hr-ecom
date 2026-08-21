/**
 * Update the customer gift message (`shippingAddress.senderMessage`) for one order.
 *
 * Dry-run (default):
 *   ENVIRONMENT=prod npx tsx scripts/update-order-sender-message.ts --order US10360
 *
 * Apply:
 *   ENVIRONMENT=prod npx tsx scripts/update-order-sender-message.ts --order US10360 --apply
 *
 * Uses the default AWS credential chain (local profile or GitHub Actions).
 * Never pass or log secret keys.
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { orderKeys, type Order, type ShippingAddress } from "@hr-ecom/shared";

const DEFAULT_ORDER_NUMBER = "US10360";

const CURRENT_MESSAGE =
  "Although we are far away from each other, this distance will not affect the strong bond of our relation. Happy Raksha Bandhan! This package is filled with Rakhi as well as overloaded with our emotions. Please accept this bundle of love and emotions.";

const NEW_MESSAGE =
  "Hallow- Yallow ra, Hope everything is going good. I had a plan to visit, but couldn’t make it this time. Happy Happy Raksha Bandhan. Wishing you a good days ahead with great wealth, health and happiness. I wish you nothing but the best. Nuvvu bagundi andarini baaga Vunchu. — Ishu";

const UNIQUE_NEW_SNIPPET = "Hallow- Yallow ra";

function argFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function argValue(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx < 0) return undefined;
  return process.argv[idx + 1];
}

type StoredOrder = Order & {
  PK: string;
  SK: string;
  shipments?: Array<{
    shipmentId: string;
    shippingAddress?: ShippingAddress;
    [key: string]: unknown;
  }>;
};

function senderMessageOf(order: StoredOrder): string | undefined {
  return order.shippingAddress?.senderMessage;
}

function applyMessage(addr: ShippingAddress | undefined, message: string): ShippingAddress | undefined {
  if (!addr) return addr;
  return { ...addr, senderMessage: message };
}

async function main() {
  const orderNumber = (argValue("order") ?? DEFAULT_ORDER_NUMBER).trim().toUpperCase();
  const apply = argFlag("apply");
  const ENV = process.env.ENVIRONMENT ?? "prod";
  const TABLE = process.env.ORDERS_TABLE ?? `hr-ecom-orders-${ENV}`;
  const REGION = process.env.AWS_DEFAULT_REGION ?? process.env.AWS_REGION ?? "us-east-1";

  if (NEW_MESSAGE.length > 500) {
    console.error(`New message is ${NEW_MESSAGE.length} characters; max is 500.`);
    process.exit(1);
  }

  const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
    marshallOptions: { removeUndefinedValues: true },
  });

  console.log(`Table=${TABLE} region=${REGION} order=${orderNumber} apply=${apply}`);

  const pointer = await doc.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: orderKeys.numberPk(orderNumber), SK: orderKeys.numberSk() },
    })
  );
  const orderId = pointer.Item?.orderId as string | undefined;
  if (!orderId) {
    console.error(`ORDERNUM pointer not found for ${orderNumber} in ${TABLE}`);
    process.exit(1);
  }

  const orderKey = { PK: orderKeys.pk(orderId), SK: orderKeys.sk() };
  const existing = await doc.send(new GetCommand({ TableName: TABLE, Key: orderKey }));
  if (!existing.Item) {
    console.error(`Order item not found: ${orderKeys.pk(orderId)}`);
    process.exit(1);
  }

  const order = existing.Item as StoredOrder;
  const storedNumber = String(order.orderNumber ?? "").toUpperCase();
  if (storedNumber && storedNumber !== orderNumber) {
    console.error(`Order number mismatch: pointer=${orderNumber} item=${storedNumber}`);
    process.exit(1);
  }

  const before = senderMessageOf(order) ?? "";
  console.log(`internalOrderId=${order.orderId}`);
  console.log(`status=${order.status}`);
  console.log(`beforeMessage=${JSON.stringify(before)}`);

  if (before === NEW_MESSAGE) {
    console.log("Already has the new message. Nothing to change.");
    await verifyExclusive(doc, TABLE, orderNumber);
    return;
  }

  if (before !== CURRENT_MESSAGE) {
    console.error("Refusing to update: stored message is not the expected current message.");
    console.error(`expected=${JSON.stringify(CURRENT_MESSAGE)}`);
    process.exit(1);
  }

  const nextAddress = applyMessage(order.shippingAddress, NEW_MESSAGE);
  if (!nextAddress) {
    console.error("Order has no shippingAddress; cannot store senderMessage.");
    process.exit(1);
  }

  let nextShipments = order.shipments;
  let shipmentUpdates = 0;
  if (Array.isArray(order.shipments)) {
    nextShipments = order.shipments.map((shipment) => {
      const msg = shipment.shippingAddress?.senderMessage ?? "";
      if (msg !== CURRENT_MESSAGE && msg !== "") return shipment;
      shipmentUpdates += 1;
      return {
        ...shipment,
        shippingAddress: applyMessage(shipment.shippingAddress ?? order.shippingAddress, NEW_MESSAGE),
      };
    });
  }

  if (!apply) {
    console.log("[dry-run] would SET shippingAddress.senderMessage and matching shipment messages");
    console.log(`shipmentRowsToUpdate=${shipmentUpdates}`);
    console.log(`afterMessage=${JSON.stringify(NEW_MESSAGE)}`);
    return;
  }

  const names: Record<string, string> = {
    "#shippingAddress": "shippingAddress",
    "#updatedAt": "updatedAt",
  };
  const values: Record<string, unknown> = {
    ":addr": nextAddress,
    ":now": new Date().toISOString(),
    ":orderNumber": orderNumber,
  };
  const sets = ["#shippingAddress = :addr", "#updatedAt = :now"];

  if (nextShipments) {
    names["#shipments"] = "shipments";
    values[":shipments"] = nextShipments;
    sets.push("#shipments = :shipments");
  }

  await doc.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: orderKey,
      UpdateExpression: `SET ${sets.join(", ")}`,
      ConditionExpression: "orderNumber = :orderNumber",
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );

  const afterItem = await doc.send(new GetCommand({ TableName: TABLE, Key: orderKey }));
  const after = afterItem.Item as StoredOrder | undefined;
  const afterMessage = after ? senderMessageOf(after) ?? "" : "";
  const shipmentMessages = (after?.shipments ?? []).map((s) => s.shippingAddress?.senderMessage ?? "");

  console.log(`afterMessage=${JSON.stringify(afterMessage)}`);
  console.log(`shipmentMessages=${JSON.stringify(shipmentMessages)}`);
  console.log(`shipmentRowsUpdated=${shipmentUpdates}`);

  if (afterMessage !== NEW_MESSAGE) {
    console.error("Verification failed: order did not return the new message.");
    process.exit(1);
  }

  const otherFieldsUnchanged =
    after?.orderNumber === order.orderNumber &&
    after?.status === order.status &&
    after?.total === order.total &&
    after?.paymentIntentId === order.paymentIntentId &&
    after?.razorpayOrderId === order.razorpayOrderId &&
    JSON.stringify(after?.items) === JSON.stringify(order.items) &&
    after?.shippingAddress?.name === order.shippingAddress?.name &&
    after?.shippingAddress?.email === order.shippingAddress?.email &&
    after?.shippingAddress?.phone === order.shippingAddress?.phone &&
    after?.shippingAddress?.line1 === order.shippingAddress?.line1;

  if (!otherFieldsUnchanged) {
    console.error("Verification failed: unexpected non-message fields changed.");
    process.exit(1);
  }

  await verifyExclusive(doc, TABLE, orderNumber);
  console.log(`OK updated senderMessage for ${orderNumber} only (${TABLE} / shippingAddress.senderMessage)`);
}

async function verifyExclusive(
  doc: DynamoDBDocumentClient,
  table: string,
  expectedOrderNumber: string
) {
  const matches: string[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const page = await doc.send(
      new ScanCommand({
        TableName: table,
        FilterExpression: "contains(shippingAddress.senderMessage, :snip)",
        ExpressionAttributeValues: { ":snip": UNIQUE_NEW_SNIPPET },
        ProjectionExpression: "orderId, orderNumber",
        ExclusiveStartKey,
      })
    );
    for (const item of page.Items ?? []) {
      matches.push(String(item.orderNumber ?? item.orderId ?? "?"));
    }
    ExclusiveStartKey = page.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (ExclusiveStartKey);

  console.log(`scanMatchesForNewMessage=${JSON.stringify(matches)}`);
  if (matches.length !== 1 || matches[0] !== expectedOrderNumber) {
    console.error("Verification failed: new message was not exclusive to the target order.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

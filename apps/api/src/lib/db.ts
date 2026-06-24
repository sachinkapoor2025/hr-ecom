import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { memoryStore } from "./memory-store";

const useMemory = process.env.USE_MEMORY_DB === "true";
const endpoint = process.env.DYNAMODB_ENDPOINT;

const client = useMemory
  ? null
  : new DynamoDBClient({
      region: process.env.AWS_REGION ?? "us-east-1",
      ...(endpoint
        ? {
            endpoint,
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "local",
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "local",
            },
          }
        : {}),
    });

export const docClient = useMemory
  ? (memoryStore as unknown as DynamoDBDocumentClient)
  : DynamoDBDocumentClient.from(client!, {
      marshallOptions: { removeUndefinedValues: true },
    });

export const TABLE_NAME = process.env.TABLE_NAME ?? "hr-ecom-dev";

export function now(): string {
  return new Date().toISOString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

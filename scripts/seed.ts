/**
 * Seeds UsaRakhi categories and products from scripts/data/usarakhi-catalog.json
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { productKeys, categoryKeys, configKeys, defaultPaymentConfig } from "@hr-ecom/shared";

const CATALOG_PATH = join(process.cwd(), "scripts/data/usarakhi-catalog.json");

const endpoint = process.env.DYNAMODB_ENDPOINT ?? "http://localhost:8000";
const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint,
  credentials: { accessKeyId: "local", secretAccessKey: "local" },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME ?? "hr-ecom-dev";
const now = () => new Date().toISOString();

function loadCatalog() {
  if (!existsSync(CATALOG_PATH)) {
    throw new Error(`Catalog not found at ${CATALOG_PATH}. Run: npm run import:usarakhi:fetch`);
  }
  return JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as {
    categories: { name: string; slug: string; description: string; sortOrder: number }[];
    products: {
      name: string;
      slug: string;
      description: string;
      price: number;
      compareAtPrice?: number;
      currency: "USD" | "INR";
      categorySlug: string;
      images: string[];
      sku?: string;
      inventory: number;
      tags: string[];
      seoTitle?: string;
      seoDescription?: string;
    }[];
  };
}

async function seed() {
  const { categories, products } = loadCatalog();
  const timestamp = now();
  console.log(`Seeding ${categories.length} categories, ${products.length} products...`);

  for (const cat of categories) {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...cat,
          published: true,
          PK: categoryKeys.pk(cat.slug),
          SK: categoryKeys.sk(),
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      })
    );
  }

  for (const p of products) {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...p,
          published: true,
          PK: productKeys.pk(p.slug),
          SK: productKeys.sk(),
          GSI1PK: productKeys.gsi1pk(p.categorySlug),
          GSI1SK: productKeys.gsi1sk(p.slug),
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      })
    );
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: configKeys.payments.pk,
        SK: configKeys.payments.sk,
        ...defaultPaymentConfig,
        updatedAt: timestamp,
      },
    })
  );

  console.log("UsaRakhi catalog seeded.");
}

seed().catch(console.error);

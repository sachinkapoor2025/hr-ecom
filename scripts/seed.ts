/**
 * Seeds demo categories and products into DynamoDB Local.
 * For in-memory mode, demo data auto-seeds when API starts (USE_MEMORY_DB=true).
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { productKeys, categoryKeys, configKeys, defaultPaymentConfig } from "@hr-ecom/shared";

const endpoint = process.env.DYNAMODB_ENDPOINT ?? "http://localhost:8000";
const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint,
  credentials: { accessKeyId: "local", secretAccessKey: "local" },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME ?? "hr-ecom-dev";
const now = () => new Date().toISOString();

const categories = [
  { name: "Electronics", description: "Gadgets and devices", sortOrder: 1 },
  { name: "Fashion", description: "Clothing and accessories", sortOrder: 2 },
  { name: "Home", description: "Home and kitchen essentials", sortOrder: 3 },
];

const products = [
  {
    name: "Wireless Headphones",
    description: "Premium noise-cancelling wireless headphones with 30hr battery.",
    price: 149.99,
    categorySlug: "electronics",
    inventory: 50,
    currency: "USD" as const,
    tags: ["audio", "bestseller"],
  },
  {
    name: "Smart Watch Pro",
    description: "Fitness tracking, heart rate monitor, and smartphone notifications.",
    price: 299.99,
    categorySlug: "electronics",
    inventory: 30,
    currency: "USD" as const,
    tags: ["wearable"],
  },
  {
    name: "Classic Cotton T-Shirt",
    description: "Soft organic cotton tee available in multiple colors.",
    price: 29.99,
    categorySlug: "fashion",
    inventory: 200,
    currency: "USD" as const,
    tags: ["clothing"],
  },
  {
    name: "Ceramic Coffee Mug Set",
    description: "Set of 4 handcrafted ceramic mugs, dishwasher safe.",
    price: 34.99,
    categorySlug: "home",
    inventory: 75,
    currency: "USD" as const,
    tags: ["kitchen"],
  },
  {
    name: "Yoga Mat Premium",
    description: "Non-slip eco-friendly yoga mat with carrying strap.",
    price: 899,
    categorySlug: "home",
    inventory: 100,
    currency: "INR" as const,
    tags: ["fitness", "india"],
  },
];

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
}

async function main() {
  const timestamp = now();

  for (const cat of categories) {
    const slug = slugify(cat.name);
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...cat,
          slug,
          published: true,
          PK: categoryKeys.pk(slug),
          SK: categoryKeys.sk(),
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      })
    );
    console.log(`Category: ${cat.name}`);
  }

  for (const p of products) {
    const slug = slugify(p.name);
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...p,
          slug,
          images: [],
          published: true,
          PK: productKeys.pk(slug),
          SK: productKeys.sk(),
          GSI1PK: productKeys.gsi1pk(p.categorySlug),
          GSI1SK: productKeys.gsi1sk(slug),
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      })
    );
    console.log(`Product: ${p.name}`);
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

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

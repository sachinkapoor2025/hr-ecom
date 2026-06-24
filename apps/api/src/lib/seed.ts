import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { productKeys, categoryKeys, configKeys, defaultPaymentConfig } from "@hr-ecom/shared";
import { docClient, TABLE_NAME, now, slugify } from "./db";
import { getMemoryStoreSize } from "./memory-store";

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

export async function seedIfEmpty() {
  if (process.env.USE_MEMORY_DB !== "true") return;
  if (getMemoryStoreSize() > 0) return;

  const timestamp = now();
  console.log("Seeding in-memory database with demo data...");

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

  console.log("Demo data ready.");
}

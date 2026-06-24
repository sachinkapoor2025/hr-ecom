import { PutCommand, GetCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { createCategorySchema, categoryKeys, type Category } from "@hr-ecom/shared";
import { docClient, TABLE_NAME, now, slugify } from "../lib/db";
import { ok, created, badRequest, notFound, forbidden } from "../lib/response";
import { getAuth } from "../lib/auth";

export async function listCategories(_event: APIGatewayProxyEventV2) {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "begins_with(PK, :prefix) AND SK = :sk",
      ExpressionAttributeValues: { ":prefix": "CATEGORY#", ":sk": "META" },
    })
  );

  const categories = ((result.Items ?? []) as Category[]).filter((c) => c.published !== false);
  categories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return ok({ categories });
}

export async function createCategory(event: APIGatewayProxyEventV2) {
  const auth = getAuth(event);
  if (!auth?.isAdmin) return forbidden();

  const body = JSON.parse(event.body ?? "{}");
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.message);

  const slug = slugify(parsed.data.name);
  const timestamp = now();
  const item = {
    ...parsed.data,
    slug,
    PK: categoryKeys.pk(slug),
    SK: categoryKeys.sk(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return created({ category: item });
}

export async function deleteCategory(event: APIGatewayProxyEventV2) {
  const auth = getAuth(event);
  if (!auth?.isAdmin) return forbidden();

  const slug = event.pathParameters?.slug;
  if (!slug) return badRequest("Slug required");

  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: categoryKeys.pk(slug), SK: categoryKeys.sk() },
    })
  );
  return ok({ deleted: true });
}

export async function getCategory(event: APIGatewayProxyEventV2) {
  const slug = event.pathParameters?.slug;
  if (!slug) return badRequest("Slug required");

  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: categoryKeys.pk(slug), SK: categoryKeys.sk() },
    })
  );

  if (!result.Item) return notFound("Category not found");
  return ok({ category: result.Item });
}

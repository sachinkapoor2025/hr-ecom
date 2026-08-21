import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  configKeys,
  defaultReviewRequestSettings,
  reviewRequestSettingsSchema,
  type ReviewRequestSettings,
} from "@hr-ecom/shared";
import { docClient, CONFIG_TABLE, now } from "./db";

function googleReviewUrlFallback(): string {
  const explicit = process.env.GOOGLE_REVIEW_URL?.trim();
  if (explicit) return explicit;
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  if (placeId) return `https://search.google.com/local/writereview?placeid=${placeId}`;
  return "";
}

export async function loadReviewRequestSettings(): Promise<ReviewRequestSettings> {
  const result = await docClient.send(
    new GetCommand({
      TableName: CONFIG_TABLE,
      Key: { PK: configKeys.reviewRequest.pk, SK: configKeys.reviewRequest.sk },
    })
  );

  if (!result.Item) {
    const settings = defaultReviewRequestSettings;
    return { ...settings, googleReviewUrl: googleReviewUrlFallback() };
  }

  const parsed = reviewRequestSettingsSchema.safeParse(result.Item);
  return parsed.success ? parsed.data : defaultReviewRequestSettings;
}

export async function saveReviewRequestSettings(
  settings: ReviewRequestSettings
): Promise<ReviewRequestSettings> {
  const parsed = reviewRequestSettingsSchema.parse(settings);
  await docClient.send(
    new PutCommand({
      TableName: CONFIG_TABLE,
      Item: {
        PK: configKeys.reviewRequest.pk,
        SK: configKeys.reviewRequest.sk,
        ...parsed,
        updatedAt: now(),
      },
    })
  );
  return parsed;
}

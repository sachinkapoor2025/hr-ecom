import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  configKeys,
  defaultGstSupplierSettings,
  gstSupplierSettingsSchema,
  type GstSupplierSettings,
} from "@hr-ecom/shared";
import { docClient, CONFIG_TABLE, now } from "./db";

export async function loadGstSupplierSettings(): Promise<GstSupplierSettings> {
  const result = await docClient.send(
    new GetCommand({
      TableName: CONFIG_TABLE,
      Key: { PK: configKeys.gst.pk, SK: configKeys.gst.sk },
    })
  );
  if (!result.Item) return defaultGstSupplierSettings;
  const parsed = gstSupplierSettingsSchema.safeParse(result.Item);
  return parsed.success ? parsed.data : defaultGstSupplierSettings;
}

export async function saveGstSupplierSettings(settings: GstSupplierSettings): Promise<GstSupplierSettings> {
  const parsed = gstSupplierSettingsSchema.parse(settings);
  await docClient.send(
    new PutCommand({
      TableName: CONFIG_TABLE,
      Item: {
        PK: configKeys.gst.pk,
        SK: configKeys.gst.sk,
        ...parsed,
        updatedAt: now(),
      },
    })
  );
  return parsed;
}

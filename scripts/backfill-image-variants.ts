#!/usr/bin/env npx tsx
/**
 * Generate thumb/card/gallery/zoom WebP variants for existing UsaRakhi S3 images.
 *
 *   UPLOAD_BUCKET=hr-ecom-prod-uploadbucket-xxxxx npx tsx scripts/backfill-image-variants.ts
 *   PREFIX=uploads/ ...
 *   DRY_RUN=1 ...  (list only)
 *
 * Refuses HalloweenReady / BlossomPot buckets — do not run against those stacks.
 */
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { isOptimizableImageKey } from "@hr-ecom/shared";
import { optimizeObject } from "../apps/api/src/lib/optimize-image";

const FORBIDDEN = /halloweenready|blossompot|dyr0xdywradd/i;
const BUCKET = process.env.UPLOAD_BUCKET ?? "";
const DRY = process.env.DRY_RUN === "1";
const PREFIX = process.env.PREFIX ?? "";

async function main() {
  if (!BUCKET) {
    throw new Error("Set UPLOAD_BUCKET to the UsaRakhi / hr-ecom upload bucket");
  }
  if (FORBIDDEN.test(BUCKET)) {
    throw new Error("Refusing to process HalloweenReady / BlossomPot bucket");
  }

  const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });
  let token: string | undefined;
  let listed = 0;
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  do {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        ContinuationToken: token,
        Prefix: PREFIX || undefined,
      })
    );
    for (const obj of page.Contents ?? []) {
      const key = obj.Key;
      if (!key) continue;
      listed += 1;
      if (!isOptimizableImageKey(key)) {
        skipped += 1;
        continue;
      }
      if (DRY) {
        console.log("would process", key, obj.Size);
        processed += 1;
        continue;
      }
      try {
        const result = await optimizeObject(BUCKET, key);
        processed += 1;
        if (processed % 25 === 0) console.log(`processed ${processed}`, result);
      } catch (err) {
        failed += 1;
        console.error("failed", key, err instanceof Error ? err.message : err);
      }
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);

  console.log({ listed, processed, skipped, failed, dry: DRY, bucket: BUCKET, prefix: PREFIX || "(all)" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

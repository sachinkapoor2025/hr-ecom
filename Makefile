.PHONY: build-ApiFunction build-VendorApiFunction build-ReviewEmailsCronFunction build-SesEmailCronFunction build-BounceSyncFunction build-ImageOptimizeFunction api-deps api-bundle

api-deps:
	npm ci
	npm run build -w @hr-ecom/shared

api-bundle: api-deps
	npx esbuild apps/api/src/index.ts \
		--bundle \
		--platform=node \
		--target=es2022 \
		--minify \
		--outfile=$(ARTIFACTS_DIR)/index.js \
		--external:@aws-sdk/client-dynamodb \
		--external:@aws-sdk/lib-dynamodb \
		--external:@aws-sdk/client-s3 \
		--external:@aws-sdk/s3-request-presigner
	npx esbuild apps/api/src/vendor-api.ts \
		--bundle \
		--platform=node \
		--target=es2022 \
		--minify \
		--outfile=$(ARTIFACTS_DIR)/vendor-api.js \
		--external:@aws-sdk/client-dynamodb \
		--external:@aws-sdk/lib-dynamodb \
		--external:@aws-sdk/client-s3 \
		--external:@aws-sdk/s3-request-presigner
	npx esbuild apps/api/src/scheduled.ts \
		--bundle \
		--platform=node \
		--target=es2022 \
		--minify \
		--outfile=$(ARTIFACTS_DIR)/scheduled.js \
		--external:@aws-sdk/client-dynamodb \
		--external:@aws-sdk/lib-dynamodb \
		--external:@aws-sdk/client-s3 \
		--external:@aws-sdk/s3-request-presigner
	npx esbuild apps/api/src/ses-scheduled.ts \
		--bundle \
		--platform=node \
		--target=es2022 \
		--minify \
		--outfile=$(ARTIFACTS_DIR)/ses-scheduled.js \
		--external:@aws-sdk/client-dynamodb \
		--external:@aws-sdk/lib-dynamodb \
		--external:@aws-sdk/client-s3 \
		--external:@aws-sdk/s3-request-presigner
	npx esbuild apps/api/src/bounce-sync.ts \
		--bundle \
		--platform=node \
		--target=es2022 \
		--minify \
		--outfile=$(ARTIFACTS_DIR)/bounce-sync.js \
		--external:@aws-sdk/client-dynamodb \
		--external:@aws-sdk/lib-dynamodb \
		--external:@aws-sdk/client-s3 \
		--external:@aws-sdk/s3-request-presigner

build-ApiFunction: api-bundle

build-VendorApiFunction: api-bundle

build-ReviewEmailsCronFunction: api-bundle

build-SesEmailCronFunction: api-bundle

build-BounceSyncFunction: api-bundle

# Separate artifact: sharp native binary for linux/arm64 (Lambda architecture).
# Do not bundle sharp into the API function — it would bloat every request path.
build-ImageOptimizeFunction:
	mkdir -p $(ARTIFACTS_DIR)
	npx esbuild apps/api/src/image-optimize.ts \
		--bundle \
		--platform=node \
		--target=es2022 \
		--minify \
		--outfile=$(ARTIFACTS_DIR)/index.js \
		--external:sharp \
		--external:@aws-sdk/client-s3
	printf '%s\n' '{"name":"image-optimize","private":true,"dependencies":{"sharp":"0.33.5"}}' > $(ARTIFACTS_DIR)/package.json
	npm install --omit=dev --prefix $(ARTIFACTS_DIR) --cpu=arm64 --os=linux --libc=glibc

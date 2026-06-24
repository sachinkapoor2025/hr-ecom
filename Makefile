.PHONY: build-ApiFunction

build-ApiFunction:
	npm ci
	npm run build -w @hr-ecom/shared
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

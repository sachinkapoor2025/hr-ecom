# Developer Setup

## Prerequisites

- Node.js 24+ (see `.nvmrc` — run `nvm use` or `fnm use` in the repo root)
- AWS CLI + SAM CLI (for deploy)
- Stripe + Razorpay test accounts (optional for local dev)

## Local DynamoDB (optional)

For full local testing without AWS, prompt Cursor:

> "Add DynamoDB Local docker-compose for development"

By default, API uses env `TABLE_NAME` — point to deployed dev stack or local.

## Cognito Admin User

After first SAM deploy:

```bash
aws cognito-idp admin-create-user --user-pool-id <POOL_ID> --username admin@yourstore.com
aws cognito-idp admin-add-user-to-group --user-pool-id <POOL_ID> --username admin@yourstore.com --group-name admin
```

## Bulk Product CSV Format

```csv
name,description,price,categorySlug,inventory,currency,tags
Blue Widget,A great widget,29.99,gadgets,100,USD,"sale,new"
```

Create categories first in admin.

## GitHub Actions AWS credentials

Create an IAM user (or access key for a deploy user) with `sam deploy` permissions. Add these repository secrets in GitHub:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` — required only for temporary credentials (keys starting with `ASIA`). Omit for long-lived IAM access keys.

SAM build runs from the monorepo root so the local `@hr-ecom/shared` workspace package resolves during `sam build`.

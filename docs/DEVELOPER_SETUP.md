# Developer Setup

## Prerequisites

- Node.js 20+
- AWS CLI + SAM CLI (for deploy)
- Stripe + Razorpay test accounts (optional for local dev)

## Local DynamoDB (optional)

For full local testing without AWS, prompt Cursor:

> "Add DynamoDB Local docker-compose for development"

The API uses a multi-table DynamoDB design. Table names come from env vars
`PRODUCTS_TABLE`, `ORDERS_TABLE`, `CARTS_TABLE`, `CUSTOMERS_TABLE`, `EVENTS_TABLE`,
and `CONFIG_TABLE` (each defaulting to `hr-ecom-<domain>-<ENVIRONMENT>`). Create the
local tables with `npm run db:setup` (or set `USE_MEMORY_DB=true`).

Migrating from the legacy single table? Run:

```bash
ENVIRONMENT=prod LEGACY_TABLE=hr-ecom-prod npm run migrate:multitable
```

## Cognito Admin User

After first SAM deploy:

```bash
aws cognito-idp admin-create-user --user-pool-id <POOL_ID> --username admin@yourstore.com
aws cognito-idp admin-add-user-to-group --user-pool-id <POOL_ID> --username admin@yourstore.com --group-name admin
```

## Google Sign-In (Cognito Hosted UI)

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Web client**.
2. Add **Authorized redirect URI**: `https://<CognitoHostedUIDomain>/oauth2/idpresponse`  
   (use the `CognitoHostedUIDomain` stack output, e.g. `hr-ecom-prod-123456789.auth.us-east-1.amazoncognito.com`).
3. Redeploy SAM with parameters:
   ```bash
   sam deploy --parameter-overrides GoogleOAuthClientId=<id> GoogleOAuthClientSecret=<secret>
   ```
4. Set web env `NEXT_PUBLIC_COGNITO_DOMAIN` to the hosted UI domain (same as stack output).

The account page shows **Sign in with Google** when Cognito pool, client ID, and domain are configured.

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

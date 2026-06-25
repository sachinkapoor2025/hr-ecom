# HR E-Commerce Platform

AI-first, full-featured e-commerce built for **prompt-driven development** with Cursor and **near-zero idle cost** on AWS.

## Features

| Area | Included |
|------|----------|
| Storefront | Product catalog, categories, search, cart, checkout |
| Payments | **Stripe** (USA) + **Razorpay** (India), region-configurable |
| Customer outreach | Auto-saves partial name/email/phone as users type (leads) |
| Admin | Products, categories, bulk CSV upload, image upload, orders, leads |
| Auth | AWS Cognito + local dev auth (admin@shop.com for admin) |
| SEO | SSR metadata, sitemap, robots.txt, JSON-LD product schema |
| Infrastructure | SAM: DynamoDB, Lambda, API Gateway, S3, CloudFront, Cognito |
| CI/CD | GitHub Actions + Amplify hosting config | 

## Quick Start (Local)

Requires **Node.js 20+** (see `.nvmrc` — `nvm use` or `fnm use`).

```bash
cd hr-ecom
npm install

# Copy env files
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Option A: In-memory DB (no Docker needed — demo data auto-loads)
npm run dev:all

# Option B: DynamoDB Local (requires Docker)
# npm run setup:local   # docker + table + seed 
# npm run dev:all
```

Open http://localhost:3000

**Admin login (local dev):** go to `/account`, login with `admin@shop.com` / any password (8+ chars), then open `/admin`.

## AI Development Workflow

1. Open repo in **Cursor**
2. Read `AGENTS.md` and `.cursor/rules/ecommerce.mdc`
3. Log into admin portal
4. **Prompt Cursor** to add/improve features
5. Push to GitHub → auto-deploy

## AWS Deploy

```bash
cd infrastructure
sam build
sam deploy --guided --config-env dev
```

Connect Amplify to GitHub repo using `amplify.yml`. Set secrets in GitHub and Amplify env vars.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full design.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:all` | API + web together |
| `npm run setup:local` | Docker DynamoDB + table + seed data |
| `npm run seed` | Re-seed demo products |
| `npm run build` | Build all packages |

## Cost (Idle / Low Traffic)

~**$0–15/month** — DynamoDB on-demand, Lambda, API Gateway pay-per-use.

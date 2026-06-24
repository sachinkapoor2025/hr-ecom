# HR E-Commerce Platform — Architecture

## Goals

- Full-featured e-commerce (catalog, cart, checkout, orders, admin)
- Dual payment gateways: **Stripe** (USA) and **Razorpay** (India), region-configurable
- Customer capture at every touchpoint (partial name/email saved for outreach)
- **SEO-first** storefront (SSR, metadata, sitemap, structured data)
- **AI-driven development**: developers use Cursor prompts; no manual redeploy for code edits
- **Multi-developer**: Git + branch workflow; Cursor rules keep changes consistent
- **AWS serverless**, near-zero idle cost, auto-scales under load

## Why This Stack

| Layer | Choice | Idle cost | Rationale |
|-------|--------|-----------|-----------|
| Frontend | Next.js 15 (App Router) | ~$0 on Amplify/OpenNext | SSR/SSG for SEO; deploy from GitHub without Docker |
| API | API Gateway + Lambda | $0 | Pay per request |
| Database | DynamoDB on-demand | ~$0 | No provisioned capacity; no RDS always-on cost |
| Auth | Cognito User Pool | Free tier | Login/logout, JWT, admin roles |
| Files | S3 + CloudFront | Pennies | Product images, bulk CSV uploads |
| Payments | Stripe + Razorpay | $0 until transaction | Config-driven per region |
| IaC | AWS SAM | $0 | Simpler than raw CloudFormation for serverless |
| CI/CD | GitHub Actions | Free tier | Push → deploy infra + app |

**No Docker for app code** — GitHub Actions builds and deploys directly. Cursor edits code → push → auto deploy. Docker only if you later need custom runtimes (not required now).

## Repository Layout

```
hr-ecom/
├── AGENTS.md                 # Instructions for Cursor AI
├── apps/
│   ├── web/                  # Next.js storefront + admin
│   └── api/                  # Lambda handlers (TypeScript)
├── packages/
│   └── shared/               # Types, constants, validation (Zod)
├── infrastructure/
│   ├── template.yaml         # SAM: DynamoDB, Cognito, Lambda, S3, API GW
│   └── samconfig.toml
├── .cursor/rules/            # Persistent AI coding rules
├── .github/workflows/        # deploy.yml
└── docs/
```

## DynamoDB Single-Table Design

Table: `hr-ecom-{env}`

| PK | SK | Entity |
|----|-----|--------|
| `PRODUCT#<slug>` | `META` | Product |
| `CATEGORY#<slug>` | `META` | Category |
| `USER#<userId>` | `PROFILE` | User profile |
| `USER#<userId>` | `CART` | Cart |
| `USER#<userId>` | `ORDER#<orderId>` | Order |
| `LEAD#<leadId>` | `META` | Partial customer capture |
| `SESSION#<sessionId>` | `META` | Anonymous visitor tracking |
| `CONFIG#PAYMENTS` | `META` | Stripe/Razorpay settings |
| `GSI1PK` | `GSI1SK` | Category → products, status queries |

GSIs:
- **GSI1**: `GSI1PK` = `CATEGORY#<slug>`, `GSI1SK` = `PRODUCT#<slug>`
- **GSI2**: `GSI2PK` = `ENTITY#ORDER`, `GSI2SK` = `<createdAt>`

## API Routes (Lambda)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/products` | List/search products |
| GET | `/products/{slug}` | Product detail |
| POST | `/products` | Admin: create product |
| PUT | `/products/{slug}` | Admin: update |
| DELETE | `/products/{slug}` | Admin: delete |
| POST | `/products/bulk` | Admin: CSV bulk upload |
| GET | `/categories` | List categories |
| POST | `/categories` | Admin: create |
| GET | `/cart` | Get cart |
| POST | `/cart/items` | Add to cart |
| DELETE | `/cart/items/{id}` | Remove item |
| POST | `/checkout` | Create order + payment intent |
| POST | `/webhooks/stripe` | Stripe webhook |
| POST | `/webhooks/razorpay` | Razorpay webhook |
| POST | `/leads` | Save partial customer info |
| GET | `/orders` | User orders |
| GET | `/admin/orders` | Admin orders |
| GET | `/config/payments` | Public payment region config |

## Payment Flow

1. Checkout reads `CONFIG#PAYMENTS` → region (`US` → Stripe, `IN` → Razorpay)
2. Create order in DynamoDB (status: `pending_payment`)
3. Create Stripe PaymentIntent or Razorpay Order
4. Client completes payment
5. Webhook confirms → order status `paid` → inventory decrement

Secrets (Stripe/Razorpay keys) live in **SSM Parameter Store** / **Secrets Manager**, never in code.

## Customer / Lead Capture

Every form blur or debounced keystroke can POST to `/leads`:

- Anonymous `sessionId` (cookie) + optional `userId` after login
- Fields: name (partial OK), email, phone, page, product viewed
- Stored as `LEAD#` and `SESSION#` for CRM-style outreach

## SEO

- Next.js `generateMetadata` per product/category page
- `/sitemap.xml`, `/robots.txt` dynamic routes
- JSON-LD Product schema on product pages
- Canonical URLs, Open Graph tags

## Multi-Developer + Cursor Workflow

1. Clone repo, open in Cursor
2. Read `AGENTS.md` and `.cursor/rules/`
3. Log into admin portal locally or staging
4. Prompt: *"Add wishlist feature"* or *"Improve checkout UX"*
5. Cursor edits `apps/web` and `apps/api` following conventions
6. Push branch → PR → GitHub Actions deploys to staging
7. Multiple devs: feature branches, shared types in `packages/shared`

Admin credentials for staging are in team 1Password / SSM — developers never share source code in prompts; Cursor has repo access.

## AWS Deployment (GitHub Actions)

```
push main → build shared → build api → sam deploy → build web → Amplify/OpenNext deploy
```

### Estimated Monthly Cost (Low Traffic / Idle)

| Service | ~Cost |
|---------|-------|
| DynamoDB on-demand | $0–5 |
| Lambda + API GW | $0–3 |
| S3 + CloudFront | $1–5 |
| Cognito | $0 (under 50k MAU) |
| **Total idle/low** | **~$0–15/mo** |

Scales automatically; no manual intervention.

## Environment Variables

See `apps/web/.env.example` and `infrastructure/template.yaml` Parameters section.

## Future Extensions (prompt-ready)

- Wishlist, reviews, coupons, inventory alerts
- Email (SES), SMS (SNS)
- Multi-currency, multi-language
- Analytics (Plausible / GA4)
- Abandoned cart emails

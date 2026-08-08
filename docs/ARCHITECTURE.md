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

## DynamoDB Multi-Table Design

Per-domain tables (`PAY_PER_REQUEST`), named `hr-ecom-<domain>-{env}` and wired into
the Lambda via env vars (`PRODUCTS_TABLE`, `ORDERS_TABLE`, `CARTS_TABLE`,
`CUSTOMERS_TABLE`, `EVENTS_TABLE`, `CONFIG_TABLE`).

| Table | PK | SK | Notes / GSIs |
|-------|----|----|--------------|
| products | `PRODUCT#<slug>` / `CATEGORY#<slug>` | `META` | GSI1 `CATEGORY#<slug>` → products |
| orders | `ORDER#<orderId>` | `META` | GSI1 byCustomer (`USER#<key>`), GSI2 byDate (`ENTITY#ORDER`), GSI3 byStatus (`STATUS#<status>`) |
| carts | `CART#<userKey>` | `META` | GSI1 byUpdatedAt (`ENTITY#CART`) + `itemCount`; TTL `expiresAt` |
| customers | `SESSION#<sessionId>` | `PROFILE` / `LEAD#<ts>` | GSI1 lead feed (`ENTITY#LEAD`) |
| events | `SESSION#<sessionId>` | `<ts>#<eventId>` | GSI1 byTypeDay (`<type>#<yyyy-mm-dd>`); TTL `expiresAt` (90d). Rollups: PK `ROLLUP#<yyyy-mm-dd>` |
| config | `CONFIG#PAYMENTS` | `META` | Stripe/Razorpay settings |
| config | `CONFIG#SHIPPING` | `META` | USPS rate-shopping, origin address, festival mode |

Order status lifecycle: `pending_payment → paid → processing → shipped → delivered`
(plus `cancelled` / `refunded`), with a `statusHistory[]` audit trail and tracking number.

Migration from the legacy single table: `npm run migrate:multitable` (copies orders +
leads/sessions; products re-seed via `import:usarakhi`).

## Background jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| `ReviewEmailsCronFunction` | Every hour | Email customers 1 day after order is marked **Delivered** or **Complete**, linking to `/reviews` |

When admin (or Orange County vendor tracking) changes order status (accepted, processing, shipped, delivered, complete, cancelled, refunded, or paid), the API emails **both** the customer at `shippingAddress.email` and the ops inbox (`order@usarakhi.com` / `NOTIFY_EMAIL`) via **SMTP** (`notifyCustomerOrderStatusChange` in `apps/api/src/lib/email.ts` — same transactional path as paid confirmation). Admin copy includes customer contact, items, tracking, and an admin order link so the team need not open the portal for every update. **Marketing campaigns** (`/ses-email/*`, admin Email) send via **marketing SMTP** (default Mailercloud `smtp-prod.mailrcld.com:587`) configured under Admin → Email → Settings; Amazon SES API remains an optional legacy transport if `marketingTransport=ses`. Transactional `SMTP_*` env is separate and unchanged. Shipped emails include carrier/tracking when present. `pending_payment` → `cancelled` skips the customer/status pair (admin payment-failed alert only). Separately, **Delivered** or **Complete** also sets `reviewEmailDueAt` (delivery + 1 day); the cron sends one review-request email per order (`reviewEmailSentAt`).

**WhatsApp (optional, additive):** When Meta Cloud API (`WHATSAPP_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID`) and/or Twilio (`TWILIO_*`) env vars are set, the same customer notifications also send via WhatsApp (`apps/api/src/lib/whatsapp.ts` → `notifyCustomerWhatsApp`): welcome/admin/abandoned coupons, order paid + status updates, pending-payment reminders, review requests, contact ack, abandoned-cart recovery. Email remains primary — WhatsApp failures never block checkout or SMTP. Admin abandoned coupons still return a `wa.me` deep link when APIs are unset. For Meta out-of-session sends, set an approved `WHATSAPP_TEMPLATE_NAME` (freeform text only works inside the 24h customer-care window).

**Pending-payment reminders (SMTP):** While an order stays `pending_payment`, the shared 15‑minute cron (`scheduled.handler` → `processPendingPaymentReminders`) emails the customer **once per America/New_York calendar day** (first send ≥ 2 hours after checkout). Campaign ends after **2026-08-28** (last reminder day). Stops immediately when status leaves `pending_payment` (paid/cancelled). Tracked via `pendingPaymentReminderLastDateKey` / `pendingPaymentReminderCount`.

**Pending-payment unsubscribe:** Reminder emails include a link to `/unsubscribe/payment-reminders` (email prefilled). `POST /pending-payment-unsubscribe` stores the address in DynamoDB table `hr-ecom-pending-payment-unsub-{env}` (`PENDING_PAYMENT_UNSUB_TABLE`). The cron skips any order whose `shippingAddress.email` is on that list. This list is separate from SES marketing suppression.

## API Routes (Lambda)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/products` | List/search products |
| GET | `/products/{slug}` | Product detail |
| GET | `/products/{slug}/reviews` | Published product reviews |
| POST | `/products/{slug}/reviews` | Admin: create/moderate a review |
| POST | `/products` | Admin: create product |
| PUT | `/products/{slug}` | Admin: update |
| DELETE | `/products/{slug}` | Admin: delete |
| POST | `/products/bulk` | Admin: CSV bulk upload |
| GET | `/categories` | List categories |
| POST | `/categories` | Admin: create |
| GET | `/cart` | Get cart |
| POST | `/cart/items` | Add to cart (optional `addons[]` as catalog ids or `{ id, quantity }` for UsaRakhi products) |
| PUT | `/cart/items/{lineId}` | Update quantity by cart line id |
| DELETE | `/cart/items/{lineId}` | Remove cart line |
| POST | `/checkout` | Create order + payment intent |
| GET | `/shipping/rates` | Session: USPS rate quotes for cart + destination address |
| GET | `/admin/shipping/settings` | Admin: shipping config (origin, festival mode, services) |
| PUT | `/admin/shipping/settings` | Admin: update shipping config |
| POST | `/admin/orders/{orderId}/buy-label` | Admin: purchase USPS label for order |
| POST | `/admin/orders/{orderId}/rates` | Admin: re-fetch rates for order (service override) |
| GET | `/admin/shipping/products-missing-dims` | Admin: products without weight/dimensions |
| GET | `/admin/load-test` | Super admin: load-test presets + LOAD_TEST_MODE status |
| POST | `/admin/load-test/run` | Super admin: prefer UI browser runner (`smoke` / `u100`…`u1000`). UI: `/admin/load-test` |
| GET | `/admin/expenses` | Super admin: list business expenses. UI: `/admin/expenses` |
| POST | `/admin/expenses` | Super admin: create expense (`amount`, `expenseType`, `expenseDate`, optional `description` / `billImageUrl`) |
| PUT | `/admin/expenses/{expenseId}` | Super admin: update expense |
| DELETE | `/admin/expenses/{expenseId}` | Super admin: delete expense |
| GET | `/admin/payment-ledger` | Super admin: list gateway payment receipts. UI: `/admin/payment-tracking` |
| POST | `/admin/payment-ledger` | Super admin: record payment (`amount`, `receivedDate`, `paymentSource`; currency auto Stripe→USD / Razorpay→INR; optional `gatewayFee` / `notes`) |
| PUT | `/admin/payment-ledger/{paymentId}` | Super admin: update payment record |
| DELETE | `/admin/payment-ledger/{paymentId}` | Super admin: delete payment record |
| GET | `/admin/payment-reconciliation` | Super admin: expected paid orders vs recorded settlements. UI: `/admin/payment-reconciliation` |
| GET | `/admin/vendor-management` | Super admin: vendor order economics (sell vs vendor cost), payout balance, charts. Query `?vendor=orange-county`. UI: `/admin/vendor-management` |
| GET | `/admin/vendor-payouts` | Super admin: list vendor payout ledger (`VENDORPAY#` on config table) |
| POST | `/admin/vendor-payouts` | Super admin: record payment to vendor (`amount`, `paidDate`, `paymentMethod`, optional `orderIds` / `notes`) |
| PUT | `/admin/vendor-payouts/{payoutId}` | Super admin: update payout |
| DELETE | `/admin/vendor-payouts/{payoutId}` | Super admin: delete payout |
| GET | `/admin/vendor-api/health` | Admin: Orange County Vendor API health console (UI: `/admin/vendor-api`) |
| GET | `/admin/vendor-api/auth-check` | Admin: prove missing vendor key returns 401 |
| GET | `/admin/vendor-api/orders` | Admin: proxy list/search vendor orders (`days`/`limit`/`cursor`/`status`/`updatedSince`) |
| GET | `/admin/vendor-api/orders/{orderId}` | Admin: proxy get one vendor order (`OC#####` or UUID) |
| POST | `/admin/vendor-api/shipment` | Admin: proxy AWB update (`orderNumber`, `courierName`, `awb`) |
| POST | `/admin/vendor-api/tracking` | Admin: proxy tracking status (`orderNumber`, `currentShipmentStatus`) |
| GET | `/vendors/orange-county/orders` | **Dedicated Vendor API only** (`VendorApiUrl` / `orange-county.usarakhi.com`). Last **15 days**; default = post-payment statuses (`paid`…`complete`); paginated (`limit`/`cursor`/`nextCursor`); human `orderId`=`OC#####`; vendorCost (not retail). Override with `?status=`. See `docs/VENDOR_ORANGE_COUNTY_API.md` |
| GET | `/vendors/orange-county/orders/{orderId}` | Same vendor API; `{orderId}` accepts `OC10001` or internal UUID |
| POST | `/vendors/orange-county/shipment` | Vendor posts AWB + courier (`orderNumber`, `courierName`, `awb`) |
| POST | `/vendors/orange-county/orders/{orderId}/shipment` | Same AWB update with order id in path |
| POST | `/vendors/orange-county/tracking` | Vendor posts tracking (`orderNumber`, `currentShipmentStatus`) |
| POST | `/vendors/orange-county/orders/{orderId}/tracking` | Same tracking update with order id in path |
| POST | `/webhooks/stripe` | Stripe webhook |

**Product add-ons (UsaRakhi only):** Fixed dry-fruit / chocolate extras (`packages/shared/src/lib/product-addons.ts`). Shown on PDP when `allowsAddons` is true (non–Orange County). Shoppers pick quantity per add-on (1–10); nested on `CartItem.addons` with `quantity`; line totals include `price × quantity`. Merge key includes quantities. OC products reject addons server-side.

### Scale notes (catalog / concurrency)

- DynamoDB stays on-demand (scales with traffic; no always-on fee).
- Catalog: categories via GSI1 (no Scan); short in-memory + `Cache-Control` on public GETs.
- Events: `page_view` rollups sampled to protect hot partitions.
- Cart: parallel Gets + single Put.
- Optional later: Lambda provisioned concurrency if cold-start p95 must drop (adds fixed monthly cost).

| POST | `/webhooks/razorpay` | Razorpay webhook |
| POST | `/leads` | Save partial customer info |
| POST | `/pending-payment-unsubscribe` | Public: opt out of pending-payment reminder emails (DynamoDB list) |
| POST | `/events` | First-party analytics events (batched, public) |
| GET | `/orders` | User orders |
| GET | `/orders/{orderId}` | Order detail (owner/admin) |
| GET | `/admin/orders` | Admin: list orders (filter `?status=`) |
| GET | `/admin/orders/{orderId}` | Admin: order detail |
| PATCH | `/admin/orders/{orderId}` | Admin: update status + tracking; emails customer + order@usarakhi on each status step; schedules review email 1 day after delivered |
| GET | `/admin/analytics/sales` | Admin: day/week/month payments received (excludes refunds) |
| GET | `/admin/analytics/overview` | Admin: traffic + funnel (`?days=`) |
| GET | `/admin/analytics/products` | Admin: most-viewed products |
| GET | `/admin/analytics/searches` | Admin: top + zero-result searches |
| GET | `/admin/analytics/visitors` | Admin: visitor analytics (`?days=` or `?from=&to=` YYYY-MM-DD); totals, byDay (unique sessions/day), by-country, session list |
| GET | `/admin/live-visitors` | Admin: currently active storefront visitors (presence TTL ~3 min; geo map + detail list in Visitor analytics UI) |
| GET | `/admin/sessions` | Admin: recent visitor sessions (`?days=` or `?from=&to=` & `identity=all|known|anonymous`) |
| GET | `/admin/sessions/{sessionId}` | Admin: full visitor journey |
| GET | `/admin/customers/{email}` | Admin: unified customer profile (orders, leads, carts, sessions) |
| GET | `/admin/search` | Admin: global search by name/email/phone (`?q=`) |
| GET | `/admin/carts/abandoned` | Admin: abandoned carts (CSV in UI) |
| GET | `/admin/leads` | Admin: captured leads |
| GET/POST | `/ses-email/reminders*` | Admin: checkout-nudge audience (manual fetch, send, soft-delete). UI: `/admin/email/nudges` |
| GET/POST | `/ses-email/*` | Marketing campaigns (admin auth): dashboard, campaigns, recipients, templates, queue, analytics (+ per-email activity), suppression, bounce sync, settings. UI at `/admin/email` |
| POST | `/webhooks/mailercloud` | Mailercloud bounce/complaint/unsub → marketing `SUPPRESS#` (skipped on next import/send) |
| GET | `/email/open/{token}` | Open tracking pixel |
| GET | `/email/click/{token}` | Click tracking redirect |
| GET | `/email/unsubscribe/{token}` | Unsubscribe → suppression list |
| GET | `/config/payments` | Public payment region config |
| GET | `/blog-images` | Public blog hero image map (slug → URL) |
| PUT | `/admin/blog-images` | Admin: update blog hero images |

## Payment Flow

1. Checkout reads `CONFIG#PAYMENTS` → region (`US` → Stripe, `IN` → Razorpay)
2. Create order in DynamoDB (status: `pending_payment`)
3. Create Stripe PaymentIntent or Razorpay Order
4. Client completes payment (Razorpay also calls `POST /payments/razorpay/verify`)
5. **Webhook is source of truth** (`POST /webhooks/stripe`, `POST /webhooks/razorpay`) → `paid` + inventory
6. Safety net: hourly cron reconciles Razorpay `pending_payment` orders against Razorpay capture API; admin can **Sync payment from Razorpay** on the order page

Requires GitHub secret `RAZORPAY_WEBHOOK_SECRET` and Razorpay Dashboard webhook to `{API}/webhooks/razorpay` for events `payment.captured`, `order.paid`, `qr_code.credited`.

Secrets (Stripe/Razorpay keys) live in **SSM Parameter Store** / **Secrets Manager** / GitHub Actions secrets, never in code.

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
- Abandoned cart emails (+ WhatsApp when phone + API configured)

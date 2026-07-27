# Orange County vendor order API

UsaRakhi admin sees **all** orders in `/admin/orders`.  
Orange County uses a **separate API Gateway** (not the storefront API) and only receives orders that include **their** hamper line items (`vendorSlug=orange-county`).

Customer storefront never shows the vendor name — only “Rakhi Hamper”.

## What to share with the vendor

| Item | Value |
|------|--------|
| Base API URL | CloudFormation output `VendorApiUrl` (different host from storefront `ApiUrl`) |
| Auth header | `X-Vendor-Api-Key: <secret>` |
| API key | GitHub Actions secret / SAM param `ORANGE_COUNTY_VENDOR_API_KEY` |

After deploy, get the live URL:

```bash
aws cloudformation describe-stacks --stack-name hr-ecom-prod \
  --query "Stacks[0].Outputs[?OutputKey=='VendorApiUrl'].OutputValue" --output text
```

Example shape (ID changes per account):

`https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/prod`

### Generate a key (example)

```bash
openssl rand -hex 32
```

Set it as:

1. GitHub repo secret: `ORANGE_COUNTY_VENDOR_API_KEY`
2. Redeploy API (SAM) so Lambda env `ORANGE_COUNTY_VENDOR_API_KEY` is set

Share **only** the **VendorApiUrl** + this key with Orange County (secure channel). Rotate if leaked.

The storefront API (`ApiUrl` / `foqu2…`) does **not** expose these vendor routes.

## Endpoints

### List their orders

```http
GET {VENDOR_API_URL}/vendors/orange-county/orders
X-Vendor-Api-Key: <key>
```

Optional query params:

| Param | Description |
|-------|-------------|
| `limit` | Max orders (default 50, max 100) |
| `status` | Exact status, e.g. `paid`, `processing`, `shipped` |
| `since` | ISO date — only orders with `createdAt >= since` |

Example:

```bash
curl -sS \
  -H "X-Vendor-Api-Key: YOUR_KEY" \
  "https://YOUR_VENDOR_API_URL/prod/vendors/orange-county/orders?limit=50"
```

Response shape (simplified):

```json
{
  "vendorSlug": "orange-county",
  "count": 2,
  "orders": [
    {
      "orderId": "…",
      "status": "paid",
      "createdAt": "…",
      "shippingAddress": {
        "name": "…",
        "line1": "…",
        "city": "…",
        "state": "…",
        "postalCode": "…",
        "country": "US",
        "phone": "…",
        "email": "…"
      },
      "trackingNumber": null,
      "carrier": null,
      "items": [
        {
          "sku": "TFUSRH2026-16",
          "productSlug": "classic-rakhi-double-delight-box",
          "name": "…",
          "quantity": 1
        }
      ]
    }
  ]
}
```

Notes:

- **Selling price is never returned** (no `price`, `currency`, or `vendorSubtotal`)
- `sku` is the vendor code from the Orange County sheet (e.g. `TFUSRH2026-16`)
- Unpaid / cancelled / refunded orders are **hidden** unless you pass `?status=…`
- `items` are **only** Orange County lines (UsaRakhi-only SKUs on mixed carts are omitted)

### Single order

```http
GET {VENDOR_API_URL}/vendors/orange-county/orders/{orderId}
X-Vendor-Api-Key: <key>
```

Returns `403` if the order has no Orange County items or the key is wrong.

## Admin portal (UsaRakhi)

- `/admin/orders` — all orders
- Filter **Vendor → Orange County** to see only orders that include OC hampers
- Order detail shows an **Orange County** badge on the order and on each OC line item

## Requirements for tagging to work

1. Products imported with `vendorSlug: orange-county` and `sku` from the vendor sheet
2. Customer adds those products to cart (cart stamps `vendorSlug` + `sku` on the line)
3. Checkout writes `vendorSlugs` on the order

If an old order was placed before `vendorSlug` existed on products, it will not appear in the vendor feed. SKU is still resolved from the bundled catalog when missing on the line.

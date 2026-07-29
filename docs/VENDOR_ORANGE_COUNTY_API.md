# Orange County vendor order API

Dedicated API Gateway (`VendorApiUrl`) — **not** the storefront API.

Auth header on every request:

```http
X-Vendor-Api-Key: <ORANGE_COUNTY_VENDOR_API_KEY>
```

Base URL (prod example):

`https://hou08enf2k.execute-api.us-east-1.amazonaws.com/prod`

---

## 1. List orders (import feed)

```http
GET {VENDOR_API_URL}/vendors/orange-county/orders
```

### Query params

| Param | Default | Description |
|-------|---------|-------------|
| `days` | **15** | Only orders with `createdAt` in the last N days (max 90). Prevents re-importing old history. |
| `since` | *(derived from `days`)* | ISO timestamp override for createdAt lower bound |
| `updatedSince` | — | Optional ISO — only orders with `updatedAt >= updatedSince` (incremental sync) |
| `limit` | 50 | Max orders (max 100) |
| `status` | — | Exact status filter, e.g. `paid` |

Unpaid / cancelled / refunded are hidden unless `status` is set.

### Duplicate prevention (recommended)

1. Always call with default **last 15 days** (or pass `days=15`).
2. Store each `orderId` locally; skip ids you already imported.
3. For incremental sync, pass `updatedSince` = last successful poll time.

### Example

```bash
curl -sS \
  -H "X-Vendor-Api-Key: YOUR_KEY" \
  "https://hou08enf2k.execute-api.us-east-1.amazonaws.com/prod/vendors/orange-county/orders?days=15&limit=50"
```

### Response fields (order)

| Field | Meaning |
|-------|---------|
| `orderId` | Unique order id |
| `orderDate` / `createdAt` | When order was placed |
| `senderName` | Gift sender name |
| `recipientName` | Ship-to name |
| `recipientAddressLine1` | Street |
| `recipientAddressLine2` | Apt / suite (nullable) |
| `city` / `state` / `country` / `zipCode` | Address |
| `recipientPhoneNumber` | Recipient phone |
| `orderValue` | **Total fulfill** = sum of item vendor costs × qty (USD). Not retail. |
| `orderValueCurrency` | `USD` |
| `deliveryDate` | Requested / estimated delivery (nullable) |
| `giftMessage` | Greeting text for the shipment |
| `status` | UsaRakhi status |
| `trackingNumber` / `carrier` | If already set |

### Response fields (each item)

| Field | Meaning |
|-------|---------|
| `sku` / `productCode` | Vendor SKU (e.g. `TFUSRH2026-16`) |
| `productName` | Title |
| `price` | Vendor purchase / fulfill unit price (`vendorCost`). Not website retail. |
| `quantity` | Units |
| `productImageUrl` | Absolute image URL |
| `weight` / `weightUnit` | When available (may be `null` until product weights are set) |

---

## 2. Get one order

```http
GET {VENDOR_API_URL}/vendors/orange-county/orders/{orderId}
```

---

## 3. Post AWB when shipped

```http
POST {VENDOR_API_URL}/vendors/orange-county/orders/{orderId}/shipment
Content-Type: application/json
X-Vendor-Api-Key: YOUR_KEY
```

```json
{
  "orderNumber": "same-as-orderId-optional",
  "courierName": "USPS",
  "awb": "9400111899223344556677"
}
```

Effects:

- Saves `trackingNumber` = `awb`, `carrier` = `courierName`
- Moves order to `shipped` when allowed
- Notifies the customer

```bash
curl -sS -X POST \
  -H "X-Vendor-Api-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"courierName":"USPS","awb":"9400111899223344556677"}' \
  "https://hou08enf2k.execute-api.us-east-1.amazonaws.com/prod/vendors/orange-county/orders/ORDER_ID/shipment"
```

---

## 4. Post tracking status updates

```http
POST {VENDOR_API_URL}/vendors/orange-county/orders/{orderId}/tracking
Content-Type: application/json
X-Vendor-Api-Key: YOUR_KEY
```

```json
{
  "orderNumber": "same-as-orderId-optional",
  "currentStatus": "in_transit",
  "note": "optional free text"
}
```

Accepted status examples (case-insensitive):  
`processing`, `packed`, `shipped`, `in_transit`, `dispatched`, `out_for_delivery`, `delivered`, `complete`

```bash
curl -sS -X POST \
  -H "X-Vendor-Api-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"currentStatus":"delivered"}' \
  "https://hou08enf2k.execute-api.us-east-1.amazonaws.com/prod/vendors/orange-county/orders/ORDER_ID/tracking"
```

---

## Admin (UsaRakhi)

- `/admin/orders` — filter Vendor → Orange County  
- Storefront API host does **not** expose these routes

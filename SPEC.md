# Coffee Shop POS — Product Spec

## What's shipped (v0.1)

All screens from the wireframes are live at https://coffee-shop-pos-phi.vercel.app

| Screen | Route | Status |
|---|---|---|
| Till (order screen) | `/` | ✅ Done |
| Customize item modal | overlay on `/` | ✅ Done |
| Payment | `/payment` | ✅ Done |
| Receipt | `/receipt` | ✅ Done |
| Dashboard | `/dashboard` | ✅ Done |

**Current limitations (all intentional for v0.1):**
- All data is in-memory sample data — resets on page refresh
- Print / Email / SMS buttons show a toast "Not connected yet"
- Products have colored letter placeholders, no real photos
- Single hardcoded cashier "Aey", order numbers start at 1284
- No authentication — anyone can access any screen

---

## Phase 2 — Database (next session)

Replace in-memory sample data with real Supabase tables.

### Tables to create

**`products`**
```
id          uuid PK
name        text
category    text  -- Coffee | Tea | Pastry | Cold drinks | Specials
price       int   -- in Thai Baht, no decimals
sold_out    bool  default false
customizable bool default false
photo_url   text  nullable
created_at  timestamptz
```

**`orders`**
```
id              serial PK
cashier         text
payment_method  text  -- cash | card
cash_received   int   nullable
change          int   nullable
subtotal        int
vat             int
total           int
voided          bool  default false
void_reason     text  nullable
created_at      timestamptz
```

**`order_items`**
```
id          uuid PK
order_id    int  FK → orders.id
product_id  uuid FK → products.id
quantity    int
unit_price  int   -- price at time of order (snapshot)
options     jsonb -- { size, milk, extras[], note }
```

### Migration plan

1. Create Supabase project, run migrations
2. Seed products table from `src/data/products.ts`
3. Replace `src/data/products.ts` static array with a Supabase fetch in the Till page
4. On payment confirm, write to `orders` + `order_items`
5. Dashboard reads live from `orders` — replace `src/data/stats.ts` and `src/data/sampleOrders.ts`

### Types already ready

`src/types/index.ts` defines `Product`, `CartItem`, `Order` — these map directly to the DB schema above. No type changes needed when connecting.

---

## Phase 3 — Product photos

Each product card currently shows a colored letter placeholder (`ProductPlaceholder.tsx`).

Plan:
- Add `photo_url` column to `products` table (Phase 2)
- Upload photos to Supabase Storage bucket `product-photos`
- Replace `<ProductPlaceholder>` with `<Image src={photoUrl} />` when url is present, fall back to placeholder when null

---

## Phase 4 — Auth & multi-staff

| Feature | Notes |
|---|---|
| Login screen | Supabase Auth, email or phone |
| Role: staff | Can access Till + Payment + Receipt only |
| Role: owner | Can access all screens including Dashboard |
| Cashier name | Pull from auth session instead of hardcoded "Aey" |
| Per-staff sales | Filter dashboard live feed by cashier |

---

## Phase 5 — Receipt delivery

The Print / Email / SMS buttons are stubs. Real implementation:

| Button | Service |
|---|---|
| Print | Browser `window.print()` with a `@media print` receipt stylesheet |
| Email | Resend API — send HTML receipt to customer email |
| SMS | Twilio — send text receipt to customer phone (captured on Payment screen) |

---

## Phase 6 — Nice-to-haves (backlog)

- **Void order** — button on the Till or a separate /orders screen, writes `voided=true` + void reason
- **Discount** — percentage or fixed amount, shown in CartPanel (UI stub already has the text link)
- **Customer loyalty** — phone number captured at payment, track visit count in a `customers` table
- **End-of-day report** — new dashboard tab: daily totals, export to CSV
- **Offline mode** — queue orders in IndexedDB when network drops, sync when back
- **Kitchen display** — separate `/kitchen` route, shows incoming orders in real time via Supabase Realtime

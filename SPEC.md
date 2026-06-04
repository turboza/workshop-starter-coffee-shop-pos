# Coffee Shop POS — Product Spec

## What's shipped (v0.2)

All screens are implemented.

| Screen | Route | Status |
|---|---|---|
| Till (order screen) | `/` | ✅ Done |
| Customize item modal | overlay on `/` | ✅ Done |
| Payment | `/payment` | ✅ Done |
| Receipt | `/receipt` | ✅ Done |
| Dashboard | `/dashboard` | ✅ Done |

**What's real (connected to Supabase):**
- Orders saved to database on every payment confirm
- Dashboard Live Feed shows real orders from today
- Revenue · Today and Transactions stat cards use real data
- Hourly Revenue chart uses real data (timezone-aware, uses browser local time)

**Still sample/fake data (marked with "sample" badge on dashboard):**
- Avg Ticket stat card
- Voids Today stat card
- Top Products panel (Today / Week / Month)

**Permanent limitations (by design):**
- Print / Email / SMS buttons show a toast "Not connected yet"
- Products have colored letter placeholders, no real photos
- Single hardcoded cashier "Aey", order numbers start at 1284

---

## Phase 2 — Database ✅ DONE (partial)

Supabase cloud project: `ialqovihedyaycazhwyh.supabase.co`

### Tables live in production

**`orders`**
```
id             serial PK  -- auto-incremented
cashier        text
payment_method text        -- cash | card
cash_received  int         -- nullable, cash only
change         int         -- nullable, cash only
subtotal       int
vat            int
total          int
created_at     timestamptz default now()
```

**`order_items`** (detail lines — frozen snapshot at time of sale)
```
id           uuid PK
order_id     int  FK → orders.id
product_name text  -- snapshot of name, no FK to products
unit_price   int
quantity     int
size         text  -- nullable
milk         text  -- nullable
extras       text[] -- nullable
note         text  -- nullable
```

### What's still deferred from Phase 2

- **Products table** — menu still lives in `src/data/products.ts` (code). Moving it to Supabase requires rewriting the Till screen's product loading — risky, saved for a dedicated session.
- **Top Products (real data)** — needs aggregation query on `order_items` grouped by `product_name`.
- **Avg Ticket stat card** — easy once above is done.
- **Voids Today stat card** — needs `voided` column added to `orders` + void workflow.
- **Sync order number** — CartContext order# (starts at 1284) and Supabase serial ID diverge. Decide whether to align them.

---

## Phase 3 — Product photos

Each product card currently shows a colored letter placeholder (`ProductPlaceholder.tsx`).

Plan:
- Add `photo_url` column to `products` table (when Phase 2 products table is done)
- Upload photos to Supabase Storage bucket `product-photos`
- Replace `<ProductPlaceholder>` with `<Image src={photoUrl} />` when url is present, fall back to placeholder when null

---

## Phase 4 — Auth & multi-staff ✅ DONE (partial)

| Feature | Notes | Status |
|---|---|---|
| Login screen | Email + password, sign up + sign in on `/login` | ✅ Done |
| Route protection | All routes require login; proxy.ts redirects unauthenticated visitors | ✅ Done |
| Logout | Dashboard sidebar + Till account menu (top-right avatar icon) | ✅ Done |
| RLS tightened | `orders` and `order_items` now require `authenticated` role | ✅ Done |
| Role: staff | Can access Till + Payment + Receipt only | Deferred |
| Role: owner | Can access all screens including Dashboard | Deferred |
| Cashier name | Pull from auth session instead of hardcoded "Aey" | Deferred |
| Per-staff sales | Filter dashboard live feed by cashier | Deferred |

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

- **Void order** — button on the Till or a separate /orders screen, writes `voided=true` + void reason (column not yet in DB)
- **Discount** — percentage or fixed amount, shown in CartPanel (UI stub already has the text link)
- **Customer loyalty** — phone number captured at payment, track visit count in a `customers` table
- **End-of-day report** — new dashboard tab: daily totals, export to CSV
- **Offline mode** — queue orders in IndexedDB when network drops, sync when back
- **Kitchen display** — separate `/kitchen` route, shows incoming orders in real time via Supabase Realtime
- **Real-time dashboard** — Supabase Realtime channel so Live Feed updates without page reload

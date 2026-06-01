-- orders: one row per completed sale (the receipt header)
create table orders (
  id             serial primary key,
  cashier        text not null,
  payment_method text not null,
  cash_received  int,
  change         int,
  subtotal       int not null,
  vat            int not null,
  total          int not null,
  created_at     timestamptz not null default now()
);

-- order_items: one row per drink/food on the receipt
create table order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     int not null references orders(id) on delete cascade,
  product_name text not null,
  unit_price   int not null,
  quantity     int not null,
  size         text,
  milk         text,
  extras       text[],
  note         text
);

-- Row Level Security: required by Supabase for tables in the public schema
alter table orders      enable row level security;
alter table order_items enable row level security;

-- Temporary open policies (no auth yet — tighten in Phase 4 when login is added)
create policy "allow_all_orders"      on orders      for all to anon using (true) with check (true);
create policy "allow_all_order_items" on order_items for all to anon using (true) with check (true);

-- Inventory: ingredients table and stock adjustments audit log

create table ingredients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  unit        text not null,
  count_h     int  not null default 0,
  par_h       int  not null,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table stock_adjustments (
  id            uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  previous_h    int  not null,
  new_h         int  not null,
  delta_h       int  not null,
  reason        text,
  cashier       text not null,
  created_at    timestamptz not null default now()
);

-- RLS: authenticated users only (matches migration 20260604064712 pattern)
alter table ingredients      enable row level security;
alter table stock_adjustments enable row level security;

create policy "authenticated_all_ingredients"
  on ingredients for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated_all_stock_adjustments"
  on stock_adjustments for all
  to authenticated
  using (true)
  with check (true);

-- Seed 12 ingredients from mockup spec (counts/pars in hundredths)
insert into ingredients (name, unit, count_h, par_h, sort_order) values
  ('Coffee beans · Light roast', 'kg',  1140,   800,  1),
  ('Coffee beans · Dark roast',  'kg',   310,   500,  2),
  ('Milk · Whole',               'L',   2200,  1200,  3),
  ('Milk · Oat',                 'L',    180,   800,  4),
  ('Milk · Soy',                 'L',    800,   500,  5),
  ('Matcha powder',              'g',  32000, 20000,  6),
  ('Chocolate syrup',            'L',    340,   300,  7),
  ('Cups · 16oz',                'pc', 18000, 15000,  8),
  ('Lids · 16oz',                'pc',  6000, 12000,  9),
  ('Straws · paper',             'pc', 48000, 20000, 10),
  ('Croissants',                 'pc',   600,  1000, 11),
  ('Pain au choc',               'pc',  1400,   800, 12);

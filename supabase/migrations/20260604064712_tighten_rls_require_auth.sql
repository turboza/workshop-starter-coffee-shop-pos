-- Phase 4: tighten RLS — replace open anon policies with authenticated-only access

-- Drop the temporary open policies
drop policy if exists "allow_all_orders"      on orders;
drop policy if exists "allow_all_order_items" on order_items;

-- orders: any logged-in user can read and write
create policy "authenticated_all_orders"
  on orders for all
  to authenticated
  using (true)
  with check (true);

-- order_items: any logged-in user can read and write
create policy "authenticated_all_order_items"
  on order_items for all
  to authenticated
  using (true)
  with check (true);

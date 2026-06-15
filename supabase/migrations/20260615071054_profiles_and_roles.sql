-- Phase 4: staff roles — profiles table, RLS, signup trigger, guard trigger
-- Does NOT touch orders / order_items or their existing policies.

-- ─── 1. Private schema for internal helpers ───────────────────────────────
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ─── 2. Profiles table ────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'cashier' check (role in ('cashier', 'manager')),
  email       text,
  name        text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Grant table-level access so authenticated role can reach it through the API
grant select, update on public.profiles to authenticated;

-- ─── 3. Recursion-safe helper ─────────────────────────────────────────────
-- SECURITY DEFINER so it bypasses RLS on its internal read (avoids the
-- classic infinite-recursion trap: a policy on profiles that queries profiles).
create function private.is_manager()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'manager'
  );
$$;

revoke execute on function private.is_manager() from public;
grant  execute on function private.is_manager() to authenticated;

-- ─── 4. RLS policies on profiles ─────────────────────────────────────────
-- SELECT: own row, or all rows if manager
create policy "profiles_select"
  on public.profiles for select
  to authenticated
  using ( id = (select auth.uid()) or private.is_manager() );

-- UPDATE: managers only; both clauses required by Postgres
create policy "profiles_update"
  on public.profiles for update
  to authenticated
  using ( private.is_manager() )
  with check ( private.is_manager() );

-- No INSERT / DELETE policies → denied for authenticated.
-- Inserts happen only via the signup trigger below (SECURITY DEFINER).

-- ─── 5. Signup trigger — auto-create cashier profile ─────────────────────
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, email, name)
  values (
    new.id,
    'cashier',
    new.email,
    new.raw_user_meta_data->>'name'
  );
  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ─── 6. Guard trigger — column-lock + last-manager protection ────────────
create function private.profiles_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only the role column may change
  if new.id is distinct from old.id
    or new.email is distinct from old.email
    or new.name is distinct from old.name
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Only the role column may be updated on profiles';
  end if;

  -- Block demoting the last manager
  if old.role = 'manager' and new.role = 'cashier' then
    if (select count(*) from public.profiles where role = 'manager') <= 1 then
      raise exception 'Cannot demote the last manager — promote someone else first';
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function private.profiles_guard() from public;

create trigger profiles_before_update
  before update on public.profiles
  for each row execute function private.profiles_guard();

-- ─── 7. Backfill existing users + seed first manager ─────────────────────
insert into public.profiles (id, role, email, name)
select
  id,
  'cashier',
  email,
  raw_user_meta_data->>'name'
from auth.users
on conflict (id) do nothing;

update public.profiles
set role = 'manager'
where email = 'manager@example.com';

-- Copy everything below this line and paste into Supabase → SQL Editor → New query, then Run.
-- This creates the supplements table (same idea as when you created entries).

create table if not exists public.supplements (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  price numeric not null default 0,
  servings_per_container integer not null default 1,
  servings_per_day numeric not null default 1,
  created_at timestamptz not null default now()
);

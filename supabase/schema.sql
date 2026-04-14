-- ============================================================
--  GHOSTHAUL — SUPABASE DATABASE SCHEMA
--  Run this in: Supabase Dashboard → SQL Editor → New Query
--  🔑 Get Supabase at: https://supabase.com (free tier)
-- ============================================================

-- ── 1. Trucks table ─────────────────────────────────────────
create table if not exists trucks (
  id                    bigserial primary key,
  truck_id              text not null unique,         -- e.g. "TN-01"
  driver_name           text not null,
  driver_phone          text,
  driver_fcm_token      text,                         -- Firebase push token
  current_city          text not null,
  destination           text not null,
  capacity_tonnes       numeric default 10,
  available_tonnes      numeric default 10,
  outbound_load_pct     numeric default 100,          -- % full on outbound leg
  status                text default 'available'      -- available | matched | predicting | enroute
                          check (status in ('available','matched','predicting','enroute','offline')),
  eta_hours             numeric,                      -- hours until delivery done (empty start)
  credit_score          int default 500,              -- GhostHaul freight credit score 0–900
  historical_match_rate numeric default 50,           -- % of past trips that had a return match
  eta_accuracy          numeric default 0.8,          -- how accurate past ETAs were
  days_since_empty      int default 0,
  empty_probability     numeric,                      -- set by AI prediction engine
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ── 2. Matches table ────────────────────────────────────────
create table if not exists matches (
  id                    bigserial primary key,
  truck_id              bigint references trucks(id),
  shipper_id            text,
  shipper_name          text,
  from_city             text not null,
  to_city               text not null,
  load_tonnes           numeric default 5,
  agreed_price          numeric default 0,
  distance_km           numeric,
  duration_hours        numeric,
  co2_saved             numeric,                      -- tonnes
  credit_value          numeric,                      -- INR
  status                text default 'confirmed'
                          check (status in ('pending','confirmed','enroute','completed','cancelled')),
  created_at            timestamptz default now()
);

-- ── 3. Carbon credits table ─────────────────────────────────
create table if not exists carbon_credits (
  id                    bigserial primary key,
  match_id              bigint references matches(id),
  truck_id              bigint references trucks(id),
  driver_id             text,
  tonnes_saved          numeric not null,
  credit_value          numeric not null,             -- INR total
  driver_payout         numeric,                      -- 60% to driver
  platform_revenue      numeric,                      -- 40% to platform
  status                text default 'pending_verification'
                          check (status in ('pending_verification','verified','sold','paid')),
  buyer_name            text,
  created_at            timestamptz default now()
);

-- ── 4. Driver scores table ───────────────────────────────────
create table if not exists driver_scores (
  id                    bigserial primary key,
  driver_id             text not null unique,
  score                 int default 500,              -- 0–900 GhostHaul credit score
  trips                 int default 0,
  reliability           numeric default 0.8,          -- 0–1
  total_earnings        numeric default 0,
  carbon_earned         numeric default 0,
  updated_at            timestamptz default now()
);

-- ── 5. Shipper requests table ────────────────────────────────
create table if not exists shipper_requests (
  id                    bigserial primary key,
  shipper_id            text,
  shipper_name          text,
  from_city             text not null,
  to_city               text not null,
  load_tonnes           numeric default 5,
  budget_inr            numeric,
  status                text default 'open'
                          check (status in ('open','matched','cancelled')),
  created_at            timestamptz default now()
);

-- ── 6. RPC: carbon dashboard stats ──────────────────────────
create or replace function get_carbon_stats()
returns json language sql as $$
  select json_build_object(
    'total_tonnes', coalesce(sum(tonnes_saved), 0),
    'total_value',  coalesce(sum(credit_value), 0),
    'credits_sold', count(*) filter (where status = 'sold'),
    'driver_payout', coalesce(sum(driver_payout), 0)
  ) from carbon_credits;
$$;

-- ── 7. Enable realtime ───────────────────────────────────────
-- Run in Supabase: Table Editor → Realtime tab → enable for trucks + matches

alter publication supabase_realtime add table trucks;
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table carbon_credits;

-- ── 8. Row Level Security (basic) ───────────────────────────
alter table trucks enable row level security;
alter table matches enable row level security;
alter table carbon_credits enable row level security;
alter table driver_scores enable row level security;

-- Allow anon read (for dashboard)
create policy "trucks_read" on trucks for select using (true);
create policy "matches_read" on matches for select using (true);
create policy "carbon_read" on carbon_credits for select using (true);
create policy "scores_read" on driver_scores for select using (true);

-- Only service role can insert/update (API routes use service role key)
-- (default: deny insert/update for anon — service key bypasses RLS)

-- ── 9. Seed demo data ────────────────────────────────────────
insert into trucks (truck_id, driver_name, driver_phone, current_city, destination, capacity_tonnes, available_tonnes, status, eta_hours, credit_score, historical_match_rate, outbound_load_pct)
values
  ('TN-01', 'Rajan Kumar',   '+91-9876543210', 'Chennai',   'Mumbai',    12, 6,  'matched',    18, 812, 88, 94),
  ('KA-07', 'Suresh Mohan',  '+91-9876543211', 'Bangalore', 'Delhi',     16, 9,  'available',  28, 741, 72, 87),
  ('MH-14', 'Arjun Kumar',   '+91-9876543212', 'Mumbai',    'Kolkata',   20, 14, 'available',  36, 698, 65, 80),
  ('DL-22', 'Vikram Singh',  '+91-9876543213', 'Delhi',     'Chennai',   14, 7,  'matched',    42, 785, 79, 91),
  ('TS-09', 'Priya Selvan',  '+91-9876543214', 'Hyderabad', 'Pune',      10, 5,  'available',  14, 656, 61, 75),
  ('WB-03', 'Karthik Raj',   '+91-9876543215', 'Kolkata',   'Mumbai',    24, 12, 'predicting', 52, 723, 70, 82),
  ('MH-31', 'Anbu Mani',     '+91-9876543216', 'Pune',      'Bangalore', 14, 8,  'matched',    22, 797, 83, 96),
  ('GJ-18', 'Selvam P',      '+91-9876543217', 'Ahmedabad', 'Chennai',   18, 11, 'available',  44, 669, 63, 78)
on conflict (truck_id) do nothing;

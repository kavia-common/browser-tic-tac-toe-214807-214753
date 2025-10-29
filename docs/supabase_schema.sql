-- Supabase SQL schema for Tic Tac Toe leaderboard
-- Run in Supabase SQL editor.

-- Enable UUID generation, depending on Postgres extension availability:
-- create extension if not exists "uuid-ossp";
-- create extension if not exists "pgcrypto";

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  player_x text not null,
  player_o text not null,
  winner text not null check (winner in ('X','O','draw')),
  winner_name text null,
  created_at timestamptz not null default now()
);

-- Optional players registry (not required for leaderboard but useful):
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  display_name text unique not null,
  created_at timestamptz not null default now()
);

-- Recommended RLS policies (adjust as needed):
alter table public.matches enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='matches' and policyname='Allow anonymous insert'
  ) then
    create policy "Allow anonymous insert" on public.matches
      for insert
      to anon, authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='matches' and policyname='Allow global select'
  ) then
    create policy "Allow global select" on public.matches
      for select
      to anon, authenticated
      using (true);
  end if;
end$$;

-- Indexes for common queries
create index if not exists idx_matches_created_at on public.matches(created_at desc);
create index if not exists idx_matches_winner_name on public.matches(winner_name);
create index if not exists idx_matches_player_x on public.matches(player_x);
create index if not exists idx_matches_player_o on public.matches(player_o);

-- Run this in the Supabase SQL editor (Dashboard → SQL Editor).
-- Additive only — safe to run once; re-running is a no-op thanks to IF NOT EXISTS / ON CONFLICT.

-- ── profiles ────────────────────────────────────────────────────────────
-- One row per auth user, tracks paid/unlocked status.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  has_paid boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── problem_topics ──────────────────────────────────────────────────────
-- Defines a deliberate topic order. The first two by sort_order are free;
-- everything else requires profiles.has_paid = true. A topic missing from
-- this table sorts last and is treated as locked.
create table if not exists problem_topics (
  name text primary key,
  sort_order integer not null unique
);

insert into problem_topics (name, sort_order) values
  ('Arrays', 0),
  ('Stack', 1),
  ('Linked List', 2),
  ('Trees', 3),
  ('Graphs', 4),
  ('Dynamic Programming', 5),
  ('Sliding Window', 6),
  ('Two Pointers', 7),
  ('Binary Search', 8),
  ('Backtracking', 9),
  ('Heap', 10),
  ('Trie', 11),
  ('Greedy', 12)
on conflict (name) do update set sort_order = excluded.sort_order;

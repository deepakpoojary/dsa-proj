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
  ('Greedy', 12),
  ('BST', 13),
  ('Strings', 14),
  ('Bit Manipulation', 15),
  ('Math', 16),
  ('Queue', 17)
on conflict (name) do update set sort_order = excluded.sort_order;

-- ── problems.is_top150 ──────────────────────────────────────────────────
-- Hand-curated flag marking the ~150 most classic/interview-relevant
-- problems, used to drive a "Top 150" filter on top of the full list.
alter table problems add column if not exists is_top150 boolean not null default false;

-- ── user_progress ────────────────────────────────────────────────────────
-- Per-user "solved" checkbox state. Existence of a row = solved. Reward
-- amount (₹500 / ₹1000) is derived from problems.is_top150 in app code,
-- not stored here, so changing the reward tier never requires a backfill.
create table if not exists user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null references problems(id) on delete cascade,
  solved_at timestamptz not null default now(),
  primary key (user_id, problem_id)
);

alter table user_progress enable row level security;

drop policy if exists "user_progress_select_own" on user_progress;
create policy "user_progress_select_own" on user_progress
  for select using (auth.uid() = user_id);

drop policy if exists "user_progress_insert_own" on user_progress;
create policy "user_progress_insert_own" on user_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_progress_delete_own" on user_progress;
create policy "user_progress_delete_own" on user_progress
  for delete using (auth.uid() = user_id);

-- ── theory_progress ──────────────────────────────────────────────────────
-- Same "solved" tracking as user_progress, but for theory_questions —
-- kept as a separate table since the FK targets a different parent table.
create table if not exists theory_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references theory_questions(id) on delete cascade,
  solved_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table theory_progress enable row level security;

drop policy if exists "theory_progress_select_own" on theory_progress;
create policy "theory_progress_select_own" on theory_progress
  for select using (auth.uid() = user_id);

drop policy if exists "theory_progress_insert_own" on theory_progress;
create policy "theory_progress_insert_own" on theory_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "theory_progress_delete_own" on theory_progress;
create policy "theory_progress_delete_own" on theory_progress
  for delete using (auth.uid() = user_id);

-- ── user_finance ─────────────────────────────────────────────────────────
-- Per-user Net Worth tracker: a starting balance (e.g. existing debt, entered
-- as a negative number) plus a target and a day-count, used to compute
-- "₹X/day needed to reach target" on the /dashboard page. Earned amounts
-- themselves are NOT stored here — they're derived live from user_progress
-- and theory_progress, same as everywhere else in this app.
create table if not exists user_finance (
  user_id uuid primary key references auth.users(id) on delete cascade,
  starting_balance numeric not null default 0,
  target_amount numeric not null default 0,
  target_days integer not null default 90,
  updated_at timestamptz not null default now()
);

alter table user_finance enable row level security;

drop policy if exists "user_finance_select_own" on user_finance;
create policy "user_finance_select_own" on user_finance
  for select using (auth.uid() = user_id);

drop policy if exists "user_finance_insert_own" on user_finance;
create policy "user_finance_insert_own" on user_finance
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_finance_update_own" on user_finance;
create policy "user_finance_update_own" on user_finance
  for update using (auth.uid() = user_id);

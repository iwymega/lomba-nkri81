create table if not exists public.leaderboard_entries (
  id bigint generated always as identity primary key,
  game_key text not null check (game_key in ('lari', 'kerupuk', 'karung', 'tarik', 'estafet')),
  player_name text not null check (char_length(player_name) between 2 and 32),
  region text,
  score integer not null check (score between -100 and 1000000),
  detail_label text,
  detail_value text,
  verdict text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists leaderboard_entries_game_score_idx
  on public.leaderboard_entries (game_key, score desc, created_at asc);

alter table public.leaderboard_entries enable row level security;

create policy "public can read leaderboard"
on public.leaderboard_entries
for select
to anon, authenticated
using (true);

create policy "public can submit leaderboard score"
on public.leaderboard_entries
for insert
to anon, authenticated
with check (
  score between -100 and 1000000
  and char_length(player_name) between 2 and 32
);

alter table public.leaderboard_entries
  drop constraint if exists leaderboard_entries_game_key_check;

alter table public.leaderboard_entries
  add constraint leaderboard_entries_game_key_check
  check (game_key in ('lari', 'kerupuk', 'karung', 'tarik', 'estafet'));

alter table public.leaderboard_entries
  drop constraint if exists leaderboard_entries_score_check;

alter table public.leaderboard_entries
  add constraint leaderboard_entries_score_check
  check (score between -100 and 1000000);

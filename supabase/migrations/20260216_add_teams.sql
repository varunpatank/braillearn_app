-- Create teams and team_members tables for Classroom / Team Dashboard

create table if not exists public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique,
  description text,
  owner_id uuid references public.users(id) on delete set null,
  is_public boolean not null default true,
  total_xp bigint default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.team_members (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text default 'member', -- member | teacher | admin
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (team_id, user_id)
);

create index if not exists teams_created_at_idx on public.teams (created_at);
create index if not exists team_members_team_idx on public.team_members (team_id);
create index if not exists team_members_user_idx on public.team_members (user_id);

-- RLS policies for basic team membership
create policy "Public teams are readable"
  on public.teams for select
  using (is_public = true);

create policy "Authenticated users can insert into teams"
  on public.teams for insert
  with check (auth.uid() is not null);

create policy "Team members can read their teams"
  on public.team_members for select
  using (auth.uid() = user_id or exists (select 1 from public.teams t where t.id = team_id and t.is_public = true));

-- convenience view: team leaderboard (aggregates user points)
create or replace view public.team_leaderboard as
select
  tm.team_id,
  u.id as user_id,
  u.email,
  u.username,
  u.total_points,
  u.level
from public.team_members tm
join public.users u on u.id = tm.user_id;

-- NOTE: remember to run this migration against your Supabase project to enable "teams" support.

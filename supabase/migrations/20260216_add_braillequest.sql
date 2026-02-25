-- Add missions and mission_submissions tables for BrailleQuest

create table if not exists public.missions (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  xp_reward integer not null default 50,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean not null default true
);

create table if not exists public.mission_submissions (
  id uuid default uuid_generate_v4() primary key,
  mission_id uuid references public.missions(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  image_path text,
  image_url text,
  latitude numeric(10,6),
  longitude numeric(10,6),
  ai_verification jsonb default '{}'::jsonb,
  score integer default 0,
  status text not null default 'pending', -- pending | verified | rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Storage bucket for mission uploads
insert into storage.buckets (id, name, public)
values ('mission-submissions', 'mission-submissions', true)
on conflict (id) do nothing;

-- Indexes
create index if not exists missions_created_at_idx on public.missions (created_at);
create index if not exists mission_submissions_mission_idx on public.mission_submissions (mission_id);
create index if not exists mission_submissions_user_idx on public.mission_submissions (user_id);
create index if not exists mission_submissions_status_idx on public.mission_submissions (status);

-- RLS policies (allow authenticated users to insert their own submissions)
create policy "Authenticated users can insert mission submissions"
  on public.mission_submissions for insert
  with check (auth.uid() = user_id);

create policy "Users can read their own submissions"
  on public.mission_submissions for select
  using (auth.uid() = user_id or true); -- allow public read for impact map

create policy "Users can update their own submissions"
  on public.mission_submissions for update
  using (auth.uid() = user_id);

create policy "Anyone can read missions"
  on public.missions for select
  using (is_active = true);

-- Create extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- Enable Row Level Security
alter table auth.users enable row level security;

-- Create tables
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login timestamp with time zone,
  user_metadata jsonb default '{}'::jsonb,
  progress jsonb default '{
    "level": 1,
    "experience": 0,
    "streak": 0,
    "last_active": null
  }'::jsonb,
  preferences jsonb default '{
    "theme": "light",
    "font_size": "medium",
    "audio_feedback": true,
    "arduino_mode": false
  }'::jsonb
);

create table public.custom_lessons (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  level integer not null,
  category text not null,
  duration integer not null,
  exercises jsonb not null,
  prerequisites text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_public boolean default false,
  likes integer default 0,
  shared_with text[] default array[]::text[]
);

create table public.lesson_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  lesson_id text not null,
  completed boolean default false,
  score integer default 0,
  date_started timestamp with time zone default timezone('utc'::text, now()) not null,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  time_spent integer default 0,
  attempts integer default 0,
  notes text
);

create table public.learning_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  level_range integer[] not null,
  focus_areas text[] not null,
  learning_style text not null,
  daily_time_commitment integer not null,
  lessons text[] not null,
  roadmap jsonb not null,
  weekly_schedule jsonb not null,
  status text default 'active'
);

create table public.exercise_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  lesson_id text not null,
  exercise_id text not null,
  attempt_date timestamp with time zone default timezone('utc'::text, now()) not null,
  score integer not null,
  time_taken integer not null,
  correct boolean not null,
  answer_given text
);

-- Create indexes
create index users_email_idx on public.users (email);
create index custom_lessons_user_id_idx on public.custom_lessons (user_id);
create index lesson_progress_user_id_idx on public.lesson_progress (user_id);
create index learning_plans_user_id_idx on public.learning_plans (user_id);
create index exercise_attempts_user_id_idx on public.exercise_attempts (user_id);

-- Enable Full Text Search
alter table public.custom_lessons add column fts tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored;

create index custom_lessons_fts_idx on public.custom_lessons using gin (fts);

-- RLS Policies
create policy "Users can read their own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can read their own custom lessons"
  on public.custom_lessons for select
  using (auth.uid() = user_id or is_public = true);

create policy "Users can create their own custom lessons"
  on public.custom_lessons for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own custom lessons"
  on public.custom_lessons for update
  using (auth.uid() = user_id);

create policy "Users can delete their own custom lessons"
  on public.custom_lessons for delete
  using (auth.uid() = user_id);

create policy "Users can read their own lesson progress"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "Users can create their own lesson progress"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own lesson progress"
  on public.lesson_progress for update
  using (auth.uid() = user_id);

-- Triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_custom_lessons_updated_at
  before update on public.custom_lessons
  for each row
  execute function update_updated_at_column();

create trigger update_learning_plans_updated_at
  before update on public.learning_plans
  for each row
  execute function update_updated_at_column();

-- Sample default lessons insertion (first 10 for demonstration)
insert into public.custom_lessons (
  title, description, level, category, duration, exercises, is_public
) values
  ('Introduction to Braille', 'Learn the basics of the braille alphabet', 1, 'basics', 20, 
   '[{"id":"ex1","type":"multiple-choice","question":"What is braille?","options":["A writing system for the blind","A type of music","A computer language","A form of art"],"correct_answer":"A writing system for the blind","points":10}]'::jsonb, 
   true),
  ('Letters A-J', 'Master the first ten letters of the braille alphabet', 1, 'basics', 25,
   '[{"id":"ex2","type":"braille-to-text","question":"Convert these braille patterns to letters","options":["A","B","C","D","E","F","G","H","I","J"],"correct_answer":["A","B","C","D","E","F","G","H","I","J"],"points":15}]'::jsonb,
   true);
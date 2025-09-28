-- Start with clean slate and create extensions
drop schema public cascade;
create schema public;
grant all on schema public to postgres;
grant all on schema public to public;

create extension if not exists "uuid-ossp" schema extensions;
create extension if not exists "pg_trgm" schema extensions;

-- Create users table first (required for foreign keys)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
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

-- Create classes table
create table public.classes (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  meeting_link text,
  schedule jsonb not null default '{
    "days": [],
    "time": "",
    "duration": 60
  }'::jsonb,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  category text not null,
  chapters jsonb[] not null default array[]::jsonb[],
  max_students integer not null default 10,
  enrolled_students uuid[] not null default array[]::uuid[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tags text[] not null default array[]::text[],
  is_public boolean not null default true
);

-- Create progress tracking table
create table public.class_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  completed_chapters uuid[] default array[]::uuid[],
  last_accessed timestamp with time zone,
  progress_percentage integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reviews table
create table public.class_reviews (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read boolean default false,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index users_email_idx on public.users (email);
create index classes_creator_id_idx on public.classes (creator_id);
create index classes_level_idx on public.classes (level);
create index classes_category_idx on public.classes (category);
create index class_progress_user_id_idx on public.class_progress (user_id);
create index class_progress_class_id_idx on public.class_progress (class_id);
create index class_reviews_class_id_idx on public.class_reviews (class_id);
create index notifications_user_id_idx on public.notifications (user_id);

-- Add full text search to classes
alter table public.classes
add column fts tsvector generated always as (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B')
) stored;

create index classes_fts_idx on public.classes using gin (fts);

-- Set up storage
insert into storage.buckets (id, name, public)
values ('class-images', 'class-images', true)
on conflict (id) do nothing;

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = clock_timestamp();
  return new;
end;
$$ language plpgsql;

-- Add triggers
create trigger handle_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.classes
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.class_progress
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.class_reviews
  for each row execute function public.handle_updated_at();

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.classes enable row level security;
alter table public.class_progress enable row level security;
alter table public.class_reviews enable row level security;
alter table public.notifications enable row level security;

-- Set up RLS policies
create policy "Users can read their own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on public.users
  for update using (auth.uid() = id);

create policy "Users can read public classes" on public.classes
  for select using (is_public = true or auth.uid() = creator_id or auth.uid() = any(enrolled_students));

create policy "Users can create classes" on public.classes
  for insert with check (auth.uid() = creator_id);

create policy "Users can update their own classes" on public.classes
  for update using (auth.uid() = creator_id);

create policy "Users can delete their own classes" on public.classes
  for delete using (auth.uid() = creator_id);

create policy "Users can read their own progress" on public.class_progress
  for select using (auth.uid() = user_id);

create policy "Users can create their own progress" on public.class_progress
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own progress" on public.class_progress
  for update using (auth.uid() = user_id);

create policy "Anyone can read reviews" on public.class_reviews
  for select using (true);

create policy "Enrolled users can create reviews" on public.class_reviews
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.classes
      where id = class_id and
      auth.uid() = any(enrolled_students)
    )
  );

create policy "Users can update their own reviews" on public.class_reviews
  for update using (auth.uid() = user_id);

create policy "Users can read their own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update their own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Storage policies
create policy "Anyone can view class images" on storage.objects
  for select using (bucket_id = 'class-images');

create policy "Authenticated users can upload class images" on storage.objects
  for insert with check (bucket_id = 'class-images' and auth.role() = 'authenticated');

create policy "Users can update their own class images" on storage.objects
  for update using (bucket_id = 'class-images' and owner = auth.uid());

create policy "Users can delete their own class images" on storage.objects
  for delete using (bucket_id = 'class-images' and owner = auth.uid());
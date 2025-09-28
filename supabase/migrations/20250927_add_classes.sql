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
  is_public boolean not null default true,
  fts tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored
);

-- Create indexes
create index classes_creator_id_idx on public.classes (creator_id);
create index classes_level_idx on public.classes (level);
create index classes_category_idx on public.classes (category);
create index classes_fts_idx on public.classes using gin (fts);

-- Add RLS policies
create policy "Users can read public classes"
  on public.classes for select
  using (is_public = true or auth.uid() = creator_id or auth.uid() = any(enrolled_students));

create policy "Users can create classes"
  on public.classes for insert
  with check (auth.uid() = creator_id);

create policy "Users can update their own classes"
  on public.classes for update
  using (auth.uid() = creator_id);

create policy "Users can delete their own classes"
  on public.classes for delete
  using (auth.uid() = creator_id);

-- Add storage bucket for class images
insert into storage.buckets (id, name, public) values ('class-images', 'class-images', true);

-- Add storage policies
create policy "Anyone can view class images"
  on storage.objects for select
  using ( bucket_id = 'class-images' );

create policy "Authenticated users can upload class images"
  on storage.objects for insert
  with check (
    bucket_id = 'class-images' 
    and auth.role() = 'authenticated'
  );

create policy "Users can update their own class images"
  on storage.objects for update
  using (
    bucket_id = 'class-images'
    and owner = auth.uid()
  );

create policy "Users can delete their own class images"
  on storage.objects for delete
  using (
    bucket_id = 'class-images'
    and owner = auth.uid()
  );

-- Add trigger for updated_at
create trigger update_classes_updated_at
  before update on public.classes
  for each row
  execute function update_updated_at_column();
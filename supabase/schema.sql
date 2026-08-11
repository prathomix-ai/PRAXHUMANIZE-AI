-- =========================================================
-- Prathomix / AI Text Humanizer — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- =========================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- users: mirrors auth.users, adds app-specific fields
-- ---------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  credits integer not null default 20,
  created_at timestamptz not null default now()
);

-- Auto-create a public.users row whenever someone signs up in auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, credits)
  values (new.id, new.email, 20)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- generations: history of every humanize request
-- ---------------------------------------------------------
create table if not exists public.generations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users (id) on delete cascade,
  original_text text not null default '',
  humanized_text text not null default '',
  category text not null check (
    category in ('report', 'website_copy', 'essay', 'email', 'social_media', 'script')
  ),
  tone text not null check (
    tone in ('professional', 'conversational', 'empathetic', 'witty', 'academic')
  ),
  -- File-upload flow (see /api/process-file). Defaults to 'text' for the
  -- plain-text workspace generations.
  source text not null default 'text' check (source in ('text', 'file')),
  file_name text,
  file_type text check (file_type in ('pdf', 'docx')),
  storage_path text, -- path within the 'documents' storage bucket
  status text not null default 'completed' check (
    status in ('processing', 'completed', 'failed')
  ),
  created_at timestamptz not null default now()
);

create index if not exists generations_user_id_idx on public.generations (user_id);
create index if not exists generations_created_at_idx on public.generations (created_at desc);

-- ---------------------------------------------------------
-- Row Level Security — users can only touch their own rows
-- ---------------------------------------------------------
alter table public.users enable row level security;
alter table public.generations enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can view their own generations"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own generations"
  on public.generations for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- Helper RPC: atomically decrement credits, returns new balance
-- (call this from the API route right before/after a successful generation)
-- ---------------------------------------------------------
create or replace function public.decrement_credits(uid uuid, amount integer default 1)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining integer;
begin
  update public.users
  set credits = greatest(credits - amount, 0)
  where id = uid
  returning credits into remaining;

  return remaining;
end;
$$;

-- ---------------------------------------------------------
-- Storage: private bucket for humanized document downloads
-- Run this once. Files live at "<user_id>/<generation_id>.<ext>".
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Users can read their own documents"
  on storage.objects for select
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own documents"
  on storage.objects for delete
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------
-- document_history: secure record of humanized files
-- ---------------------------------------------------------
create table if not exists public.document_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  original_filename text not null,
  category text,
  tone text,
  language text default 'English',
  created_at timestamptz not null default now()
);

alter table public.document_history add column if not exists language text default 'English';

create index if not exists idx_document_history_user_created 
  on public.document_history (user_id, created_at desc);

alter table public.document_history enable row level security;

create policy "Users can view their own document history"
  on public.document_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own document history"
  on public.document_history for insert
  with check (auth.uid() = user_id);



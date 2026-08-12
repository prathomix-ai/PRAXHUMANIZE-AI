-- =========================================================
-- Prathomix / AI Text Humanizer — Complete Supabase Schema
-- Run this script in your Supabase SQL Editor.
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- 1. USERS TABLE (Mirrors auth.users)
-- ---------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  credits integer not null default 20,
  full_name text,
  gender text,
  created_at timestamptz not null default now()
);

alter table public.users add column if not exists full_name text;
alter table public.users add column if not exists gender text;

-- RLS Policies for public.users
alter table public.users enable row level security;

drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Trigger to automatically create public.users row on auth signup
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
-- 2. DOCUMENT_HISTORY TABLE (Comprehensive User History)
-- ---------------------------------------------------------
create table if not exists public.document_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  input_type varchar(50) not null default 'text', -- 'text', 'pdf', 'docx', etc.
  file_name text,                                  -- Uploaded filename (e.g., 'report.pdf')
  original_filename text,                          -- Legacy alias for compatibility
  file_url text,                                   -- Storage URL or bucket object path
  original_text text,                              -- Raw text input or extracted content
  humanized_text text,                             -- Final AI humanized output content
  category varchar(100),                           -- e.g., 'Essay', 'Report', 'Email'
  tone varchar(100),                               -- e.g., 'Professional', 'Conversational'
  language varchar(100) default 'English',          -- Target language
  status varchar(50) not null default 'success',   -- 'success', 'processing', 'failed'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe migration statements for existing document_history tables
alter table public.document_history add column if not exists input_type varchar(50) default 'text';
alter table public.document_history add column if not exists file_name text;
alter table public.document_history add column if not exists original_filename text;
alter table public.document_history add column if not exists file_url text;
alter table public.document_history add column if not exists original_text text;
alter table public.document_history add column if not exists humanized_text text;
alter table public.document_history add column if not exists category varchar(100);
alter table public.document_history add column if not exists tone varchar(100);
alter table public.document_history add column if not exists language varchar(100) default 'English';
alter table public.document_history add column if not exists status varchar(50) default 'success';
alter table public.document_history add column if not exists updated_at timestamptz default now();

-- Index for fast history lookups ordered by user and creation timestamp
create index if not exists idx_document_history_user_created 
  on public.document_history (user_id, created_at desc);

-- Automatic updated_at timestamp trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_document_history_updated_at on public.document_history;
create trigger tr_document_history_updated_at
  before update on public.document_history
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) FOR DOCUMENT_HISTORY
-- ---------------------------------------------------------
alter table public.document_history enable row level security;

-- Drop existing policies if updating schema
drop policy if exists "Users can view their own document history" on public.document_history;
drop policy if exists "Users can insert their own document history" on public.document_history;
drop policy if exists "Users can update their own document history" on public.document_history;
drop policy if exists "Users can delete their own document history" on public.document_history;

-- Create comprehensive RLS policies (SELECT, INSERT, UPDATE, DELETE)
create policy "Users can view their own document history"
  on public.document_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own document history"
  on public.document_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own document history"
  on public.document_history for update
  using (auth.uid() = user_id);

create policy "Users can delete their own document history"
  on public.document_history for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- 4. STORAGE BUCKET: user_documents
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('user_documents', 'user_documents', false)
on conflict (id) do nothing;

-- RLS Policies for user_documents storage bucket
drop policy if exists "Users can read their own user_documents" on storage.objects;
drop policy if exists "Users can upload their own user_documents" on storage.objects;
drop policy if exists "Users can update their own user_documents" on storage.objects;
drop policy if exists "Users can delete their own user_documents" on storage.objects;

create policy "Users can read their own user_documents"
  on storage.objects for select
  using (bucket_id = 'user_documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload their own user_documents"
  on storage.objects for insert
  with check (bucket_id = 'user_documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own user_documents"
  on storage.objects for update
  using (bucket_id = 'user_documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own user_documents"
  on storage.objects for delete
  using (bucket_id = 'user_documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------
-- 5. HELPER RPC: Atomically decrement user credits
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

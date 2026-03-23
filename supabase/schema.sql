-- Schema for invoice-refresh (clients, documents, versions)
-- Run this in Supabase SQL Editor for a fresh project.

-- ============================================================
-- Tables
-- ============================================================

-- Clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) > 0),
  contact_person text,
  representatives text[] not null default '{}'::text[],
  address text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Documents (per client)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Versions (snapshot JSON payload)
create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version integer not null check (version > 0),
  saved_at timestamptz not null default now(),
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create unique index if not exists document_versions_document_version_uidx
  on public.document_versions(document_id, version);

create index if not exists documents_client_id_idx on public.documents(client_id);
create index if not exists document_versions_document_id_idx on public.document_versions(document_id);

-- ============================================================
-- Triggers: auto-update updated_at
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

-- ============================================================
-- Atomic version insert (avoids race conditions)
-- Determines the next version number inside Postgres so two
-- concurrent calls can never produce duplicates.
-- ============================================================

create or replace function public.add_document_version(
  p_document_id uuid,
  p_data jsonb,
  p_title text
)
returns integer
language plpgsql
as $$
declare
  next_ver integer;
begin
  -- Lock the document row to serialise concurrent version inserts
  perform 1 from public.documents where id = p_document_id for update;

  select coalesce(max(version), 0) + 1
    into next_ver
    from public.document_versions
   where document_id = p_document_id;

  insert into public.document_versions (document_id, version, saved_at, data)
  values (p_document_id, next_ver, now(), p_data);

  update public.documents
     set title = p_title,
         updated_at = now()
   where id = p_document_id;

  return next_ver;
end;
$$;

-- ============================================================
-- RLS: enable on every table and add basic anon policies.
-- These allow full CRUD for the anon role.  When you add
-- Supabase Auth later, replace these with user-scoped policies.
-- ============================================================

alter table public.clients enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;

-- Clients
create policy "anon_clients_select"  on public.clients for select  to anon using (true);
create policy "anon_clients_insert"  on public.clients for insert  to anon with check (true);
create policy "anon_clients_update"  on public.clients for update  to anon using (true) with check (true);
create policy "anon_clients_delete"  on public.clients for delete  to anon using (true);

-- Documents
create policy "anon_documents_select" on public.documents for select to anon using (true);
create policy "anon_documents_insert" on public.documents for insert to anon with check (true);
create policy "anon_documents_update" on public.documents for update to anon using (true) with check (true);
create policy "anon_documents_delete" on public.documents for delete to anon using (true);

-- Document versions
create policy "anon_versions_select" on public.document_versions for select to anon using (true);
create policy "anon_versions_insert" on public.document_versions for insert to anon with check (true);
create policy "anon_versions_delete" on public.document_versions for delete to anon using (true);

-- NOTE: When you add Supabase Auth, drop the anon policies above
-- and create authenticated-user policies scoped to user id.

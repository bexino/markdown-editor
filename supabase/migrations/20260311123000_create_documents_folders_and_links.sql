create or replace function public.set_documents_updated_at()
returns trigger
language plpgsql
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  content text not null default ''::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_user_id_idx
  on public.documents using btree (user_id);

create index if not exists documents_updated_at_idx
  on public.documents using btree (updated_at desc);

drop trigger if exists documents_set_updated_at on public.documents;

create trigger documents_set_updated_at
before update on public.documents
for each row
execute function public.set_documents_updated_at();

alter table public.documents enable row level security;

create policy "users can view their own documents"
  on public.documents
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can insert their own documents"
  on public.documents
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can update their own documents"
  on public.documents
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete their own documents"
  on public.documents
  for delete
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists folders_user_id_idx
  on public.folders using btree (user_id);

create index if not exists folders_updated_at_idx
  on public.folders using btree (updated_at desc);

alter table public.folders enable row level security;

create policy "Users can view their folders"
  on public.folders
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their folders"
  on public.folders
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their folders"
  on public.folders
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their folders"
  on public.folders
  for delete
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.folder_documents (
  folder_id uuid not null references public.folders (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint folder_documents_pkey primary key (folder_id, document_id)
);

create index if not exists folder_documents_folder_id_idx
  on public.folder_documents using btree (folder_id);

create index if not exists folder_documents_document_id_idx
  on public.folder_documents using btree (document_id);

alter table public.folder_documents enable row level security;

create policy "Users can view their folder links"
  on public.folder_documents
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.folders f
      where f.id = folder_documents.folder_id
        and f.user_id = auth.uid()
    )
  );

create policy "Users can create their folder links"
  on public.folder_documents
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.folders f
      join public.documents d on d.id = folder_documents.document_id
      where f.id = folder_documents.folder_id
        and f.user_id = auth.uid()
        and d.user_id = auth.uid()
    )
  );

create policy "Users can delete their folder links"
  on public.folder_documents
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.folders f
      join public.documents d on d.id = folder_documents.document_id
      where f.id = folder_documents.folder_id
        and f.user_id = auth.uid()
        and d.user_id = auth.uid()
    )
  );

create table if not exists public.pinned_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid references public.documents (id) on delete cascade,
  folder_id uuid references public.folders (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint pinned_items_target_check
    check (
      (document_id is not null and folder_id is null)
      or (document_id is null and folder_id is not null)
    )
);

create unique index if not exists pinned_items_user_document_idx
  on public.pinned_items (user_id, document_id)
  where document_id is not null;

create unique index if not exists pinned_items_user_folder_idx
  on public.pinned_items (user_id, folder_id)
  where folder_id is not null;

alter table public.pinned_items enable row level security;

create policy "Users can view their pinned items"
  on public.pinned_items
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their pinned items"
  on public.pinned_items
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their pinned items"
  on public.pinned_items
  for delete
  using (auth.uid() = user_id);

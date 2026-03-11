drop policy if exists "Users can view their pinned items" on public.pinned_items;
drop policy if exists "Users can insert their pinned items" on public.pinned_items;
drop policy if exists "Users can delete their pinned items" on public.pinned_items;

create policy "Users can view their pinned items"
  on public.pinned_items
  for select
  to public
  using (auth.uid() = user_id);

create policy "Users can insert their pinned items"
  on public.pinned_items
  for insert
  to public
  with check (auth.uid() = user_id);

create policy "Users can delete their pinned items"
  on public.pinned_items
  for delete
  to public
  using (auth.uid() = user_id);

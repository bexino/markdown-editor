create or replace function public.cancel_pending_email_change(
  target_user_id uuid,
  confirmed_email text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  normalized_email text := lower(trim(confirmed_email));
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if auth.uid() <> target_user_id then
    raise exception 'You can only cancel your own pending email change.';
  end if;

  update auth.users
  set
    email = normalized_email,
    email_change = '',
    email_change_token_current = '',
    email_change_token_new = '',
    email_change_sent_at = null,
    email_change_confirm_status = 0,
    updated_at = now()
  where id = target_user_id
    and lower(email) = normalized_email;

  if not found then
    raise exception 'Unable to clear the pending email change.';
  end if;
end;
$$;

revoke all on function public.cancel_pending_email_change(uuid, text) from public;
grant execute on function public.cancel_pending_email_change(uuid, text) to authenticated;

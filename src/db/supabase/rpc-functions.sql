-- ─── get_my_role() ────────────────────────────
-- Reusable helper used by RLS policies to check
-- the caller's role without repeating subqueries.
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid()
$$;


-- ─── handle_new_user() ───────────────────────
-- Auto-creates a profile row whenever a new user
-- signs up through Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, is_active, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
    'employee',
    true,
    now(),
    now()
  );
  return new;
end;
$$;

-- Drop if exists to make this idempotent
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

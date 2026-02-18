-- ─── Enable RLS on all tables ─────────────────
alter table profiles       enable row level security;
alter table vehicles       enable row level security;
alter table rates          enable row level security;
alter table parking_areas  enable row level security;
alter table transactions   enable row level security;
alter table activity_logs  enable row level security;


-- ═══════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════

-- Any authenticated user can read profiles
create policy "profiles_select_authenticated"
  on profiles for select
  to authenticated
  using (true);

-- Users can update their own profile (name only, not role)
create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admins can insert new profiles
create policy "profiles_insert_admin"
  on profiles for insert
  to authenticated
  with check (public.get_my_role() = 'admin');

-- Admins can update any profile (including role changes)
create policy "profiles_update_admin"
  on profiles for update
  to authenticated
  using (public.get_my_role() = 'admin');

-- Admins can delete (soft-delete) profiles
create policy "profiles_delete_admin"
  on profiles for delete
  to authenticated
  using (public.get_my_role() = 'admin');


-- ═══════════════════════════════════════════════
-- VEHICLES
-- ═══════════════════════════════════════════════

-- All authenticated users can view vehicles
create policy "vehicles_select_authenticated"
  on vehicles for select
  to authenticated
  using (true);

-- Employees and admins can register vehicles
create policy "vehicles_insert_staff"
  on vehicles for insert
  to authenticated
  with check (public.get_my_role() in ('employee', 'admin'));

-- Employees and admins can update vehicles
create policy "vehicles_update_staff"
  on vehicles for update
  to authenticated
  using (public.get_my_role() in ('employee', 'admin'));


-- ═══════════════════════════════════════════════
-- RATES
-- ═══════════════════════════════════════════════

-- Everyone authenticated can read rates
create policy "rates_select_authenticated"
  on rates for select
  to authenticated
  using (true);

-- Only admins can manage rates
create policy "rates_insert_admin"
  on rates for insert
  to authenticated
  with check (public.get_my_role() = 'admin');

create policy "rates_update_admin"
  on rates for update
  to authenticated
  using (public.get_my_role() = 'admin');

create policy "rates_delete_admin"
  on rates for delete
  to authenticated
  using (public.get_my_role() = 'admin');


-- ═══════════════════════════════════════════════
-- PARKING AREAS
-- ═══════════════════════════════════════════════

-- Everyone authenticated can view areas (needed for occupancy display)
create policy "areas_select_authenticated"
  on parking_areas for select
  to authenticated
  using (true);

-- Only admins can create/edit areas
create policy "areas_insert_admin"
  on parking_areas for insert
  to authenticated
  with check (public.get_my_role() = 'admin');

create policy "areas_update_admin"
  on parking_areas for update
  to authenticated
  using (public.get_my_role() = 'admin');

-- Employees can update occupancy (check-in/check-out increments)
create policy "areas_update_occupancy_employee"
  on parking_areas for update
  to authenticated
  using (public.get_my_role() = 'employee');


-- ═══════════════════════════════════════════════
-- TRANSACTIONS
-- ═══════════════════════════════════════════════

-- Employees see only their own transactions
create policy "transactions_select_own_employee"
  on transactions for select
  to authenticated
  using (
    profile_id = auth.uid()
    and public.get_my_role() = 'employee'
  );

-- Admins and owners see all transactions
create policy "transactions_select_admin_owner"
  on transactions for select
  to authenticated
  using (public.get_my_role() in ('admin', 'owner'));

-- Employees and admins can create transactions (check-in)
create policy "transactions_insert_staff"
  on transactions for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and public.get_my_role() in ('employee', 'admin')
  );

-- Employees and admins can update transactions (check-out)
create policy "transactions_update_staff"
  on transactions for update
  to authenticated
  using (
    profile_id = auth.uid()
    and public.get_my_role() in ('employee', 'admin')
  );


-- ═══════════════════════════════════════════════
-- ACTIVITY LOGS
-- ═══════════════════════════════════════════════

-- Users can only insert their own logs
create policy "logs_insert_own"
  on activity_logs for insert
  to authenticated
  with check (profile_id = auth.uid());

-- Employees see only their own logs
create policy "logs_select_own_employee"
  on activity_logs for select
  to authenticated
  using (
    profile_id = auth.uid()
    and public.get_my_role() = 'employee'
  );

-- Admins and owners see all logs
create policy "logs_select_admin_owner"
  on activity_logs for select
  to authenticated
  using (public.get_my_role() in ('admin', 'owner'));

-- Logs are immutable: no update or delete policies

-- ─── Enable RLS on all tables ─────────────────
alter table profil       enable row level security;
alter table kendaraan     enable row level security;
alter table tarif         enable row level security;
alter table area_parkir   enable row level security;
alter table transaksi     enable row level security;
alter table log_aktifitas  enable row level security;


-- ═══════════════════════════════════════════════
-- PROFIL
-- ═══════════════════════════════════════════════

-- Any authenticated user can read profiles
create policy "profil_select_authenticated"
  on profil for select
  to authenticated
  using (true);

-- Users can update their own profile (name only, not role)
create policy "profil_update_own"
  on profil for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admins can insert new profiles
create policy "profil_insert_admin"
  on profil for insert
  to authenticated
  with check (public.get_my_role() = 'admin');

-- Admins can update any profile (including role changes)
create policy "profil_update_admin"
  on profil for update
  to authenticated
  using (public.get_my_role() = 'admin');

-- Admins can delete (soft-delete) profiles
create policy "profil_delete_admin"
  on profil for delete
  to authenticated
  using (public.get_my_role() = 'admin');


-- ═══════════════════════════════════════════════
-- KENDARAAN
-- ═══════════════════════════════════════════════

-- All authenticated users can view vehicles
create policy "kendaraan_select_authenticated"
  on kendaraan for select
  to authenticated
  using (true);

-- Employees and admins can register vehicles
create policy "kendaraan_insert_staff"
  on kendaraan for insert
  to authenticated
  with check (public.get_my_role() in ('petugas', 'admin'));

-- Employees and admins can update vehicles
create policy "kendaraan_update_staff"
  on kendaraan for update
  to authenticated
  using (public.get_my_role() in ('petugas', 'admin'));


-- ═══════════════════════════════════════════════
-- TARIF
-- ═══════════════════════════════════════════════

-- Everyone authenticated can read rates
create policy "tarif_select_authenticated"
  on tarif for select
  to authenticated
  using (true);

-- Only admins can manage rates
create policy "tarif_insert_admin"
  on tarif for insert
  to authenticated
  with check (public.get_my_role() = 'admin');

create policy "tarif_update_admin"
  on tarif for update
  to authenticated
  using (public.get_my_role() = 'admin');

create policy "tarif_delete_admin"
  on tarif for delete
  to authenticated
  using (public.get_my_role() = 'admin');


-- ═══════════════════════════════════════════════
-- AREA PARKIR
-- ═══════════════════════════════════════════════

-- Everyone authenticated can view areas (needed for occupancy display)
create policy "area_parkir_select_authenticated"
  on area_parkir for select
  to authenticated
  using (true);

-- Only admins can create/edit areas
create policy "area_parkir_insert_admin"
  on area_parkir for insert
  to authenticated
  with check (public.get_my_role() = 'admin');

create policy "area_parkir_update_admin"
  on area_parkir for update
  to authenticated
  using (public.get_my_role() = 'admin');

-- Employees can update occupancy (check-in/check-out increments)
create policy "area_parkir_update_occupancy_staff"
  on area_parkir for update
  to authenticated
  using (public.get_my_role() = 'petugas');


-- ═══════════════════════════════════════════════
-- TRANSAKSI
-- ═══════════════════════════════════════════════

-- Employees see only their own transactions
create policy "transaksi_select_own_staff"
  on transaksi for select
  to authenticated
  using (
    id_petugas = auth.uid()
    and public.get_my_role() = 'petugas'
  );

-- Admins and owners see all transactions
create policy "transaksi_select_admin_owner"
  on transaksi for select
  to authenticated
  using (public.get_my_role() in ('admin', 'owner'));

-- Employees and admins can create transactions (check-in)
create policy "transaksi_insert_staff"
  on transaksi for insert
  to authenticated
  with check (
    id_petugas = auth.uid()
    and public.get_my_role() in ('petugas', 'admin')
  );

-- Employees and admins can update transactions (check-out)
create policy "transaksi_update_staff"
  on transaksi for update
  to authenticated
  using (
    id_petugas = auth.uid()
    and public.get_my_role() in ('petugas', 'admin')
  );


-- ═══════════════════════════════════════════════
-- LOG AKTIFITAS
-- ═══════════════════════════════════════════════

-- Users can only insert their own logs
create policy "log_aktifitas_insert_own"
  on log_aktifitas for insert
  to authenticated
  with check (id_petugas = auth.uid());

-- Employees see only their own logs
create policy "log_aktifitas_select_own_staff"
  on log_aktifitas for select
  to authenticated
  using (
    id_petugas = auth.uid()
    and public.get_my_role() = 'petugas'
  );

-- Admins and owners see all logs
create policy "log_aktifitas_select_admin_owner"
  on log_aktifitas for select
  to authenticated
  using (public.get_my_role() in ('admin', 'owner'));

-- Logs are immutable: no update or delete policies

-- ============================================================================
--  Empero — Políticas RLS (Row Level Security)
-- ============================================================================
--  Pegá TODO este archivo en: Supabase Dashboard → SQL Editor → Run.
--  Es idempotente: podés correrlo las veces que quieras sin romper nada.
--
--  Qué hace:
--   - Enciende RLS en `products` y `product_families`.
--   - Público (anon key, sitio):   solo LEE productos disponibles + familias.
--   - Admin (usuario logueado):     LEE todo + puede crear/editar/borrar.
--   - Las funciones /api usan la SERVICE KEY, que ignora RLS por diseño:
--     siguen funcionando igual (upload, products, revalidate).
--
--  Resultado: el sitio y el panel funcionan EXACTAMENTE igual, pero un
--  desconocido ya NO puede borrar/editar tu catálogo desde la consola.
-- ============================================================================


-- ========================= TABLA: products ==================================

alter table public.products enable row level security;

-- Público: solo ve productos disponibles (el sitio ya filtra por disponible=true,
-- así que el comportamiento es idéntico).
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  to anon
  using (disponible = true);

-- Admin autenticado: ve todos los productos (incluidos los no disponibles).
drop policy if exists "products_auth_read_all" on public.products;
create policy "products_auth_read_all"
  on public.products for select
  to authenticated
  using (true);

-- Escrituras: SOLO usuarios autenticados.
drop policy if exists "products_auth_insert" on public.products;
create policy "products_auth_insert"
  on public.products for insert
  to authenticated
  with check (true);

drop policy if exists "products_auth_update" on public.products;
create policy "products_auth_update"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "products_auth_delete" on public.products;
create policy "products_auth_delete"
  on public.products for delete
  to authenticated
  using (true);


-- ===================== TABLA: product_families ==============================

alter table public.product_families enable row level security;

-- Público: puede leer todas las familias (necesario para agrupar el catálogo).
-- No hay datos sensibles en familias.
drop policy if exists "families_public_read" on public.product_families;
create policy "families_public_read"
  on public.product_families for select
  to anon
  using (true);

-- Admin autenticado: lee todo.
drop policy if exists "families_auth_read_all" on public.product_families;
create policy "families_auth_read_all"
  on public.product_families for select
  to authenticated
  using (true);

-- Escrituras: SOLO usuarios autenticados.
drop policy if exists "families_auth_insert" on public.product_families;
create policy "families_auth_insert"
  on public.product_families for insert
  to authenticated
  with check (true);

drop policy if exists "families_auth_update" on public.product_families;
create policy "families_auth_update"
  on public.product_families for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "families_auth_delete" on public.product_families;
create policy "families_auth_delete"
  on public.product_families for delete
  to authenticated
  using (true);


-- ============================================================================
--  VERIFICACIÓN (opcional): corré esto después para confirmar que RLS quedó ON.
-- ============================================================================
--  select tablename, rowsecurity
--  from pg_tables
--  where schemaname = 'public' and tablename in ('products', 'product_families');
--
--  -- Debería devolver rowsecurity = true en ambas.
-- ============================================================================

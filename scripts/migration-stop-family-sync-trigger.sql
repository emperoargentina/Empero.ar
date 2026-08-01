-- Deja de pisar nombre/categoría/imagen/características de los productos hijo
-- al agregarlos a una familia o al editar la familia. La identidad del
-- producto (nombre, categoría, imagen) es siempre suya — la familia solo
-- agrupa (familia_id). El nombre/categoría/imagen "de familia" para el
-- catálogo público ahora se leen directo de product_families (ver
-- src/lib/productsApi.ts), no se copian a cada producto.
--
-- Corré esto UNA VEZ en el SQL Editor de Supabase, en dos pasos.

-- ============================================================
-- PASO 1 — inspeccionar: ver qué triggers existen hoy en products
-- y product_families, y el código de la función que ejecutan.
-- ============================================================
select
  c.relname as table_name,
  t.tgname as trigger_name,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_body
from pg_trigger t
join pg_proc p on p.oid = t.tgfoid
join pg_class c on c.oid = t.tgrelid
where c.relname in ('products', 'product_families')
  and not t.tgisinternal;

-- ============================================================
-- PASO 2 — encontrados en PASO 1 (corrida del 2026-08-01):
--
--   trg_sync_variant_from_family   on products          -- pisa nombre/categoria/
--                                                        -- imagen/caracteristicas
--                                                        -- del hijo al asignarlo
--                                                        -- a una familia
--   trg_propagate_family_update    on product_families   -- pisa esos mismos campos
--                                                        -- en TODOS los hijos al
--                                                        -- editar la familia
--
-- (products_updated_at NO se toca — solo mantiene updated_at, no tiene
-- nada que ver con el sync de identidad).
-- ============================================================
drop trigger if exists trg_sync_variant_from_family on public.products;
drop trigger if exists trg_propagate_family_update on public.product_families;

drop function if exists public.sync_variant_from_family();
drop function if exists public.propagate_family_update();

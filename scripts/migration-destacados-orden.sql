-- Migración: orden manual de productos destacados
-- Corré esto una vez en el SQL Editor de Supabase para poder reordenar
-- los destacados arrastrando las cards en el panel admin.

alter table public.products
  add column if not exists destacado_orden integer;

create index if not exists products_destacado_orden_idx on public.products (destacado_orden);

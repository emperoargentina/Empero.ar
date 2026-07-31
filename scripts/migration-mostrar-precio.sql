-- Migración: toggle "Mostrar precio" por producto/variante.
-- Corré esto una sola vez en el SQL Editor de Supabase.
--
-- Default false: por pedido, el precio arranca oculto en la ficha pública
-- para todos los productos existentes hasta que se lo active manualmente.

alter table public.products
  add column if not exists mostrar_precio boolean not null default false;

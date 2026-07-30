-- Paso 3 (final) de la migración a familias reales.
-- Corré esto SOLO después de que migrate-to-families.mjs haya terminado
-- y haya reportado "0 productos con familia_id null".

alter table public.products
  alter column familia_id set not null;

alter table public.products
  add constraint products_familia_id_fkey
  foreign key (familia_id) references public.product_families(id)
  on delete restrict;

create index if not exists products_familia_id_idx on public.products (familia_id);

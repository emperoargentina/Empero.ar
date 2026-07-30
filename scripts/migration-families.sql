-- Migración: entidad "familia de producto" real.
-- Corré esto en el SQL Editor de Supabase. Es aditivo y seguro: crea una
-- tabla nueva y triggers, no toca la columna products.familia_id todavía.
--
-- Orden completo de la migración:
--   1. migration-families.sql            (este archivo)
--   2. migrate-to-families.mjs           (backfill de datos existentes)
--   3. migration-families-finalize.sql   (NOT NULL + FK, manual, al final)

create table if not exists public.product_families (
  id                         text primary key default gen_random_uuid()::text,
  nombre                     text not null,
  categoria                  text not null,
  cloudinary_url             text,
  cloudinary_image_id        text,
  caracteristicas_generales  text[],
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

-- Antes de insertar/actualizar una variante, deriva nombre/categoria/imagen/
-- características de su familia — el cliente nunca necesita enviarlos, y
-- cualquier valor stale que mande queda pisado (fuente de verdad = familia).
create or replace function sync_variant_from_family() returns trigger as $$
declare
  fam record;
begin
  select nombre, categoria, cloudinary_url, cloudinary_image_id, caracteristicas_generales
    into fam
    from public.product_families
    where id = new.familia_id;

  new.nombre                    := fam.nombre;
  new.categoria                 := fam.categoria;
  new.cloudinary_url            := fam.cloudinary_url;
  new.cloudinary_image_id       := fam.cloudinary_image_id;
  new.caracteristicas_generales := fam.caracteristicas_generales;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_variant_from_family on public.products;
create trigger trg_sync_variant_from_family
  before insert or update of familia_id on public.products
  for each row execute function sync_variant_from_family();

-- Al editar una familia, propaga los campos compartidos a todas sus variantes.
create or replace function propagate_family_update() returns trigger as $$
begin
  update public.products
  set nombre = new.nombre,
      categoria = new.categoria,
      cloudinary_url = new.cloudinary_url,
      cloudinary_image_id = new.cloudinary_image_id,
      caracteristicas_generales = new.caracteristicas_generales,
      updated_at = now()
  where familia_id = new.id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_propagate_family_update on public.product_families;
create trigger trg_propagate_family_update
  after update of nombre, categoria, cloudinary_url, cloudinary_image_id, caracteristicas_generales
  on public.product_families
  for each row execute function propagate_family_update();

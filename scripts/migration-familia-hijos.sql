-- Migración: soporte para "producto hijo" sin familia asignada todavía.
-- Corré esto una sola vez en el SQL Editor de Supabase antes de usar el
-- toggle "Convertir en Producto Hijo" / botón "Crear Familia" en el admin.
--
-- Qué hace:
--   1. Permite que product_families.categoria empiece vacía (se completa
--      recién cuando se agrega el primer producto hijo a la familia).
--   2. Crea la familia sentinela "Sin asignar" — pool oculto donde caen los
--      productos hijos hasta que se los asigna a una familia real.
--   3. Ajusta el trigger que deriva nombre/categoría/imagen desde la familia:
--      si el producto cae en la familia sentinela, NO pisa esos campos
--      (los deja tal cual los mandó el formulario). Para cualquier otra
--      familia real, el comportamiento es exactamente el mismo de siempre.

alter table public.product_families
  alter column categoria drop not null;

insert into public.product_families (id, nombre, categoria, cloudinary_url, cloudinary_image_id, caracteristicas_generales)
values ('_sin_asignar', 'Sin asignar', null, null, null, null)
on conflict (id) do nothing;

create or replace function sync_variant_from_family() returns trigger as $$
declare
  fam record;
begin
  if new.familia_id = '_sin_asignar' then
    return new;
  end if;

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

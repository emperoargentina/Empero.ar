-- Vuelve a sincronizar SOLO la categoría entre la familia y sus hijos.
-- Nombre, imagen y características son siempre del hijo y nunca se tocan
-- automáticamente (eso lo sacamos en migration-stop-family-sync-trigger.sql).
-- La categoría sí se mantiene igual entre todos los hijos de una familia,
-- porque el catálogo público filtra/agrupa por categoría y una familia con
-- hijos de categorías distintas rompe ese filtro.
--
-- Corré esto UNA VEZ en el SQL Editor de Supabase, después de haber corrido
-- migration-stop-family-sync-trigger.sql.

-- 1) Al asignar un producto a una familia (familia_id cambia), toma la
--    categoría de esa familia.
create or replace function public.sync_variant_categoria_from_family()
returns trigger
language plpgsql
as $$
declare
  fam_categoria text;
begin
  if new.familia_id = '_sin_asignar' then
    return new;
  end if;

  select categoria into fam_categoria
    from public.product_families
    where id = new.familia_id;

  if fam_categoria is not null then
    new.categoria := fam_categoria;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_variant_categoria_from_family on public.products;
create trigger trg_sync_variant_categoria_from_family
before insert or update of familia_id on public.products
for each row
execute function public.sync_variant_categoria_from_family();

-- 2) Al cambiar la categoría de la familia, se propaga a todos sus hijos
--    ya asignados.
create or replace function public.propagate_family_categoria()
returns trigger
language plpgsql
as $$
begin
  if new.categoria is distinct from old.categoria then
    update public.products
    set categoria = new.categoria,
        updated_at = now()
    where familia_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_propagate_family_categoria on public.product_families;
create trigger trg_propagate_family_categoria
after update of categoria on public.product_families
for each row
execute function public.propagate_family_categoria();

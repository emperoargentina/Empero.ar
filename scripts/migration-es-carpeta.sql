-- Migración: distinguir "familia real" (carpeta creada a propósito con el
-- botón "Crear familia") del envoltorio 1:1 que cada producto único tiene
-- automáticamente en product_families. Sin esto, una familia con un solo
-- hijo adentro es indistinguible de un producto único cualquiera.
--
-- Corré esto una sola vez en el SQL Editor de Supabase.
--
-- Default false: la inmensa mayoría de filas existentes en product_families
-- son envoltorios de productos únicos (del import original), no carpetas.
-- El código (createEmptyFamily) ya manda es_carpeta = true al crear una
-- familia nueva desde "Crear familia".

alter table public.product_families
  add column if not exists es_carpeta boolean not null default false;

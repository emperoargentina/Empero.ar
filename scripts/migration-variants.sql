-- Migración: soporte de variantes reales por familia de producto
-- Corré esto una vez en el SQL Editor de Supabase antes de correr
-- scripts/import-products.mjs con el nuevo Products_final.json.

alter table public.products
  add column if not exists familia_id      text,
  add column if not exists etiqueta        text,
  add column if not exists potencia_kw     numeric,
  add column if not exists consumo_gas_m3h numeric,
  add column if not exists rejilla_mm      text;

-- Campos obsoletos: el nuevo JSON ya no los provee (quedaron reemplazados
-- por texto libre en caracteristicas_generales o por los campos de arriba).
alter table public.products
  drop column if exists voltaje,
  drop column if exists motor_rpm,
  drop column if exists potencias_kw,
  drop column if exists temperaturas_c,
  drop column if exists programas;

create index if not exists products_familia_id_idx on public.products (familia_id);

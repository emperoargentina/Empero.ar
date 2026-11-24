-- ============================================================================
--  Empero — Tabla `consultas` (formulario de contacto del sitio)
-- ============================================================================
--  Pegá TODO este archivo en: Supabase Dashboard → SQL Editor → Run.
--  Es idempotente: podés correrlo las veces que quieras.
--
--  Flujo:
--   - El sitio NO escribe directo en la tabla: el formulario llama a
--     /api/consultas, que valida, guarda con la SERVICE KEY (ignora RLS) y
--     manda el aviso por email con Resend.
--   - Público (anon): sin acceso. Nadie puede leer ni insertar desde la consola.
--   - Admin (usuario logueado): lee, actualiza el estado y borra desde
--     /admin/consultas.
-- ============================================================================

create table if not exists public.consultas (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  nombre        text not null check (char_length(nombre) between 1 and 120),
  email         text not null check (char_length(email) between 3 and 254),
  telefono      text check (telefono is null or char_length(telefono) <= 40),
  empresa       text check (empresa is null or char_length(empresa) <= 120),
  mensaje       text not null check (char_length(mensaje) between 1 and 5000),
  estado        text not null default 'nueva'
                check (estado in ('nueva', 'leida', 'respondida', 'archivada')),
  email_enviado boolean not null default false,
  origen        text,
  user_agent    text
);

create index if not exists consultas_created_at_idx on public.consultas (created_at desc);
create index if not exists consultas_email_created_idx on public.consultas (email, created_at desc);

alter table public.consultas enable row level security;

drop policy if exists "consultas_auth_read" on public.consultas;
create policy "consultas_auth_read"
  on public.consultas for select
  to authenticated
  using (true);

drop policy if exists "consultas_auth_update" on public.consultas;
create policy "consultas_auth_update"
  on public.consultas for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "consultas_auth_delete" on public.consultas;
create policy "consultas_auth_delete"
  on public.consultas for delete
  to authenticated
  using (true);

-- Sin políticas para `anon` ni de `insert`: el alta solo ocurre desde
-- /api/consultas con la service key.

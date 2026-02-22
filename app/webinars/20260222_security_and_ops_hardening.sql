-- Security and operations hardening baseline
-- Apply this migration in Supabase SQL editor before production launch.

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('create', 'update', 'delete')),
  entity text not null,
  entity_id text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

drop policy if exists "admin_audit_logs_admin_read" on public.admin_audit_logs;
create policy "admin_audit_logs_admin_read"
on public.admin_audit_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, 'user')) = 'admin'
  )
);

drop policy if exists "admin_audit_logs_admin_write" on public.admin_audit_logs;
create policy "admin_audit_logs_admin_write"
on public.admin_audit_logs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, 'user')) = 'admin'
  )
);

-- Optional uniqueness guards to avoid duplicate commercial grants.
create unique index if not exists uniq_algo_license_user_algo
on public.algo_licenses (user_id, algo_id);

create unique index if not exists uniq_webinar_registration_user_event
on public.webinar_registrations (user_id, webinar_id);


-- Central de Suporte AD Bela-Vista
-- Fluxo:
-- - Membro abre chamado sem login.
-- - Admin/Pastor/Suporte faz login e gerencia chamados.
-- - Realtime pode ser habilitado para support_tickets, support_messages e support_notifications.

-- Buckets recomendados no Supabase Storage:
-- - support-attachments-public (publico, para anexos simples no navegador)
-- Se preferir privado, ajuste o front para signed URLs.

insert into storage.buckets (id, name, public)
values ('support-attachments-public', 'support-attachments-public', true)
on conflict (id) do update set public = true;

drop policy if exists "support_attachments_public_select" on storage.objects;
create policy "support_attachments_public_select"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'support-attachments-public');

drop policy if exists "support_attachments_public_insert" on storage.objects;
create policy "support_attachments_public_insert"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'support-attachments-public');

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique default '',
  user_id uuid,
  user_name text,
  user_phone text,
  user_email text,
  subject text not null,
  category text not null,
  description text not null,
  priority text not null default 'Normal',
  status text not null default 'Pendente',
  rating integer check (rating between 1 and 5),
  rating_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid,
  sender_name text,
  sender_type text not null default 'user',
  sender_role text not null default 'user',
  message text not null,
  attachment_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.support_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  message text not null,
  "read" boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.support_logs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  actor_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.support_tickets add column if not exists user_name text;
alter table public.support_tickets add column if not exists user_phone text;
alter table public.support_tickets add column if not exists user_email text;
alter table public.support_tickets add column if not exists rating integer check (rating between 1 and 5);
alter table public.support_tickets add column if not exists rating_comment text;
alter table public.support_tickets alter column user_id drop not null;
alter table public.support_tickets alter column protocol set default '';

alter table public.support_messages add column if not exists sender_name text;
alter table public.support_messages add column if not exists sender_type text not null default 'user';
alter table public.support_messages add column if not exists sender_role text not null default 'user';
alter table public.support_messages alter column sender_id drop not null;

create index if not exists idx_support_tickets_user_id on public.support_tickets(user_id);
create index if not exists idx_support_tickets_created_at on public.support_tickets(created_at desc);
create index if not exists idx_support_messages_ticket_id on public.support_messages(ticket_id, created_at asc);
create index if not exists idx_support_notifications_user_id on public.support_notifications(user_id, created_at desc);
create index if not exists idx_support_logs_ticket_id on public.support_logs(ticket_id, created_at asc);

create or replace function public.support_is_admin_or_support()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'pastor', 'secretario', 'suporte')
  );
$$;

revoke all on function public.support_is_admin_or_support() from public;
grant execute on function public.support_is_admin_or_support() to authenticated;

create or replace function public.support_set_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

drop trigger if exists trg_support_tickets_updated_at on public.support_tickets;
create trigger trg_support_tickets_updated_at
before update on public.support_tickets
for each row
execute function public.support_set_updated_at();

create or replace function public.support_generate_protocol()
returns trigger
language plpgsql
security definer
as $$
declare
  y text;
  seq integer;
begin
  y := to_char(now(), 'YYYY');

  select coalesce(max((regexp_replace(protocol, '^SUP-' || y || '-', ''))::int), 0) + 1
    into seq
  from public.support_tickets
  where protocol like 'SUP-' || y || '-%';

  new.protocol := 'SUP-' || y || '-' || lpad(seq::text, 4, '0');
  return new;
end
$$;

drop trigger if exists trg_support_protocol on public.support_tickets;
create trigger trg_support_protocol
before insert on public.support_tickets
for each row
when (new.protocol is null or new.protocol = '')
execute function public.support_generate_protocol();

create or replace function public.support_notify_on_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ticket_user uuid;
  ticket_protocol text;
begin
  select user_id, protocol
    into ticket_user, ticket_protocol
  from public.support_tickets
  where id = new.ticket_id;

  if coalesce(new.sender_type, new.sender_role) = 'user' then
    insert into public.support_notifications (user_id, title, message)
    select p.id, 'Novo chamado recebido', 'Nova mensagem no chamado ' || ticket_protocol
    from public.profiles p
    where p.role in ('admin', 'pastor', 'secretario', 'suporte')
      and p.id is not null;
  elsif ticket_user is not null then
    insert into public.support_notifications (user_id, title, message)
    values (ticket_user, 'Resposta do suporte', 'Voce recebeu uma nova mensagem no chamado ' || ticket_protocol);
  end if;

  update public.support_tickets
  set last_message_at = new.created_at
  where id = new.ticket_id;

  return new;
end
$$;

drop trigger if exists trg_support_notify_new_message on public.support_messages;
create trigger trg_support_notify_new_message
after insert on public.support_messages
for each row
execute function public.support_notify_on_new_message();

create or replace function public.support_log_ticket_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.support_logs (ticket_id, actor_id, action, metadata)
  values (
    new.id,
    new.user_id,
    'ticket_created',
    jsonb_build_object('protocol', new.protocol, 'category', new.category, 'priority', new.priority)
  );
  return new;
end
$$;

drop trigger if exists trg_support_log_ticket_insert on public.support_tickets;
create trigger trg_support_log_ticket_insert
after insert on public.support_tickets
for each row
execute function public.support_log_ticket_insert();

create or replace function public.support_log_ticket_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.support_logs (ticket_id, actor_id, action, metadata)
    values (new.id, auth.uid(), 'status_changed', jsonb_build_object('from', old.status, 'to', new.status));
  end if;

  if old.rating is distinct from new.rating and new.rating is not null then
    insert into public.support_logs (ticket_id, actor_id, action, metadata)
    values (new.id, auth.uid(), 'rating_received', jsonb_build_object('rating', new.rating));
  end if;

  return new;
end
$$;

drop trigger if exists trg_support_log_ticket_update on public.support_tickets;
create trigger trg_support_log_ticket_update
after update on public.support_tickets
for each row
execute function public.support_log_ticket_update();

create or replace function public.support_open_public_ticket(
  p_user_name text,
  p_user_phone text,
  p_user_email text,
  p_subject text,
  p_category text,
  p_description text,
  p_priority text,
  p_attachment_url text default null
)
returns table (
  id uuid,
  protocol text,
  user_name text,
  user_phone text,
  user_email text,
  subject text,
  category text,
  description text,
  priority text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket public.support_tickets;
begin
  insert into public.support_tickets (
    user_id,
    user_name,
    user_phone,
    user_email,
    subject,
    category,
    description,
    priority,
    status
  )
  values (
    null,
    nullif(trim(p_user_name), ''),
    nullif(trim(p_user_phone), ''),
    nullif(trim(p_user_email), ''),
    trim(p_subject),
    trim(p_category),
    trim(p_description),
    coalesce(nullif(trim(p_priority), ''), 'Normal'),
    'Pendente'
  )
  returning * into v_ticket;

  insert into public.support_messages (
    ticket_id,
    sender_id,
    sender_name,
    sender_type,
    sender_role,
    message,
    attachment_url
  )
  values (
    v_ticket.id,
    null,
    v_ticket.user_name,
    'user',
    'user',
    v_ticket.description,
    p_attachment_url
  );

  return query
  select
    v_ticket.id,
    v_ticket.protocol,
    v_ticket.user_name,
    v_ticket.user_phone,
    v_ticket.user_email,
    v_ticket.subject,
    v_ticket.category,
    v_ticket.description,
    v_ticket.priority,
    v_ticket.status,
    v_ticket.created_at,
    v_ticket.updated_at;
end
$$;

revoke all on function public.support_open_public_ticket(text, text, text, text, text, text, text, text) from public;
grant execute on function public.support_open_public_ticket(text, text, text, text, text, text, text, text) to anon, authenticated;

alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_notifications enable row level security;
alter table public.support_logs enable row level security;

drop policy if exists "support_tickets_select_own" on public.support_tickets;
drop policy if exists "support_tickets_select_admin" on public.support_tickets;
create policy "support_tickets_select_admin"
on public.support_tickets
for select
to authenticated
using (public.support_is_admin_or_support());

drop policy if exists "support_tickets_insert_own" on public.support_tickets;
drop policy if exists "support_tickets_insert_public" on public.support_tickets;
create policy "support_tickets_insert_public"
on public.support_tickets
for insert
to anon, authenticated
with check (user_id is null or user_id = auth.uid());

drop policy if exists "support_tickets_update_admin" on public.support_tickets;
create policy "support_tickets_update_admin"
on public.support_tickets
for update
to authenticated
using (public.support_is_admin_or_support())
with check (public.support_is_admin_or_support());

drop policy if exists "support_tickets_update_own_rating" on public.support_tickets;

drop policy if exists "support_messages_select" on public.support_messages;
create policy "support_messages_select"
on public.support_messages
for select
to authenticated
using (public.support_is_admin_or_support());

drop policy if exists "support_messages_insert" on public.support_messages;
create policy "support_messages_insert"
on public.support_messages
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.support_tickets t
    where t.id = support_messages.ticket_id
      and (
        (coalesce(sender_type, sender_role) = 'user' and sender_id is null)
        or
        (sender_id = auth.uid() and public.support_is_admin_or_support())
        or
        (coalesce(sender_type, sender_role) = 'system' and sender_id = auth.uid() and public.support_is_admin_or_support())
      )
  )
);

drop policy if exists "support_notifications_select_own" on public.support_notifications;
create policy "support_notifications_select_own"
on public.support_notifications
for select
to authenticated
using (user_id = auth.uid() or public.support_is_admin_or_support());

drop policy if exists "support_notifications_insert_own" on public.support_notifications;
drop policy if exists "support_notifications_insert_admin" on public.support_notifications;
create policy "support_notifications_insert_admin"
on public.support_notifications
for insert
to authenticated
with check (public.support_is_admin_or_support());

drop policy if exists "support_notifications_update" on public.support_notifications;
create policy "support_notifications_update"
on public.support_notifications
for update
to authenticated
using (user_id = auth.uid() or public.support_is_admin_or_support())
with check (user_id = auth.uid() or public.support_is_admin_or_support());

drop policy if exists "support_logs_select" on public.support_logs;
create policy "support_logs_select"
on public.support_logs
for select
to authenticated
using (
  public.support_is_admin_or_support()
  or exists (
    select 1
    from public.support_tickets t
    where t.id = support_logs.ticket_id
      and t.user_id = auth.uid()
  )
);

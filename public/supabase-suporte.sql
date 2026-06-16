-- Supabase SQL para Central de Suporte AD Bela-Vista (membro + admin)
-- Inclui:
-- 1) Tabelas: support_tickets, support_messages, support_notifications
-- 2) Storage para anexos: support-attachments, support-attachments-public
-- 3) RLS + policies
-- 4) Protocolo SUP-YYYY-XXXX (via trigger)

-- ================================
-- STORAGE (Anexos)
-- ================================
-- Observação:
-- - O ideal é criar buckets via painel do Supabase.
-- - Como o SQL abaixo não consegue garantir criação automática em todos os setups,
--   adicionamos instruções e policies para os buckets caso existam.

-- Recomendado criar manualmente os buckets:
--   - support-attachments (privado / signed URL)
--   - support-attachments-public (público, se desejar visualizar no browser sem signed URL)
-- O front padrão usará signed URL a partir de support-attachments.

-- ================================
-- PERFIS / PAPÉIS
-- ================================
-- O projeto já usa public.profiles com role = 'admin' | 'secretario'.
-- Para suporte, vamos aceitar também role = 'suporte' (opcional).
-- Caso você ainda não tenha a role 'suporte', crie-a via SQL após:
--   update public.profiles set role='suporte' where ...;

-- ================================
-- TABELAS
-- ================================

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique,
  user_id uuid not null,
  subject text not null,
  category text not null,
  description text not null,
  priority text not null default 'Normal',
  status text not null default 'Aguardando',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null,
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

-- Índices
create index if not exists idx_support_tickets_user_id on public.support_tickets(user_id);
create index if not exists idx_support_tickets_created_at on public.support_tickets(created_at desc);
create index if not exists idx_support_messages_ticket_id on public.support_messages(ticket_id, created_at asc);
create index if not exists idx_support_notifications_user_id on public.support_notifications(user_id, created_at desc);

-- ================================
-- FUNÇÕES AUXILIARES
-- ================================

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
      and p.role in ('admin','secretario','suporte')
  );
$$;

revoke all on function public.support_is_admin_or_support() from public;
grant execute on function public.support_is_admin_or_support() to authenticated;

-- Atualiza updated_at
create or replace function public.support_set_updated_at()
returns trigger
language plpgsql
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

-- Protocolo SUP-YYYY-XXXX
-- Gera sequencial por ano.
create or replace function public.support_generate_protocol()
returns trigger
language plpgsql
as $$
DECLARE
  y text;
  seq integer;
BEGIN
  y := to_char(now(), 'YYYY');

  select coalesce(max((regexp_replace(protocol, '^SUP-' || y || '-', '') )::int),0) + 1
    into seq
  from public.support_tickets
  where protocol like 'SUP-' || y || '-%';

  new.protocol := format('SUP-%s-%04s', y, seq);
  return new;
END
$$;

drop trigger if exists trg_support_protocol on public.support_tickets;
create trigger trg_support_protocol
before insert on public.support_tickets
for each row
when (new.protocol is null or new.protocol = '')
execute function public.support_generate_protocol();

-- ================================
-- RLS
-- ================================

alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_notifications enable row level security;

-- Tickets: usuário vê somente os próprios
drop policy if exists "support_tickets_select_own" on public.support_tickets;
create policy "support_tickets_select_own"
on public.support_tickets
for select
to authenticated
using (user_id = auth.uid() or public.support_is_admin_or_support());

-- Tickets: inserir apenas o próprio usuário
drop policy if exists "support_tickets_insert_own" on public.support_tickets;
create policy "support_tickets_insert_own"
on public.support_tickets
for insert
to authenticated
with check (user_id = auth.uid());

-- Tickets: atualizar (admin/suporte ou o próprio dono somente status/assunto/descr)
-- Para manter simples e seguro, dono pode atualizar apenas subject/description/category/priority.
-- status é controlado por admin/suporte.
drop policy if exists "support_tickets_update_admin" on public.support_tickets;
create policy "support_tickets_update_admin"
on public.support_tickets
for update
to authenticated
using (public.support_is_admin_or_support())
with check (public.support_is_admin_or_support());

-- ================================
-- Mensagens
-- ================================

-- Usuário vê mensagens do próprio ticket (ou admin)
drop policy if exists "support_messages_select" on public.support_messages;
create policy "support_messages_select"
on public.support_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.support_tickets t
    where t.id = support_messages.ticket_id
      and (t.user_id = auth.uid() or public.support_is_admin_or_support())
  )
);

-- Usuário insere mensagem apenas no ticket dele
-- (admin também pode)
drop policy if exists "support_messages_insert" on public.support_messages;
create policy "support_messages_insert"
on public.support_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.support_tickets t
    where t.id = support_messages.ticket_id
      and (t.user_id = auth.uid() or public.support_is_admin_or_support())
  )
);

-- Admin/suporte remove/atualiza não previsto (não abrimos update/delete)
-- (Se quiser, crie políticas adicionais.)

-- ================================
-- Notifications
-- ================================

drop policy if exists "support_notifications_select_own" on public.support_notifications;
create policy "support_notifications_select_own"
on public.support_notifications
for select
to authenticated
using (user_id = auth.uid() or public.support_is_admin_or_support());

-- Usuário não insere notifications diretamente
drop policy if exists "support_notifications_insert_own" on public.support_notifications;
create policy "support_notifications_insert_own"
on public.support_notifications
for insert
to authenticated
with check (false);

-- Admin/suporte pode inserir notificações (para o usuário)
drop policy if exists "support_notifications_insert_admin" on public.support_notifications;
create policy "support_notifications_insert_admin"
on public.support_notifications
for insert
to authenticated
with check (public.support_is_admin_or_support());

-- Admin/suporte pode marcar como read
-- Usuário pode atualizar read nas próprias notificações
drop policy if exists "support_notifications_update" on public.support_notifications;
create policy "support_notifications_update"
on public.support_notifications
for update
to authenticated
using (user_id = auth.uid() or public.support_is_admin_or_support())
with check (user_id = auth.uid() or public.support_is_admin_or_support());

-- ================================
-- TRIGGERS PARA NOTIFICAÇÕES (opcional)
-- ================================
-- A automação completa envolve lógica de status/mensagens.
-- Vamos implementar uma parte:
-- - ao inserir mensagem: cria notificação para o outro lado.

create or replace function public.support_notify_on_new_message()
returns trigger
language plpgsql
as $$
DECLARE
  ticket_user uuid;
  admin_side uuid;
  is_admin_sender boolean;
  recipient uuid;
BEGIN
  select user_id into ticket_user from public.support_tickets where id = new.ticket_id;

  is_admin_sender := public.support_is_admin_or_support();

  -- Recipient:
  -- - se sender é admin/suporte => notifica usuário dono do ticket
  -- - se sender é usuário => notifica admin/suporte (broadcast para todos roles)
  IF (new.sender_id = ticket_user) THEN
    -- usuário enviou => broadcast para admins/suporte
    insert into public.support_notifications (user_id, title, message)
    select p.id, '🔔 Nova mensagem', 'Novo comentário no chamado ' || (select protocol from public.support_tickets t where t.id = new.ticket_id)
    from public.profiles p
    where p.role in ('admin','secretario','suporte')
      and p.id is not null;
  ELSE
    -- admin/suporte enviou => notifica usuário
    recipient := ticket_user;
    insert into public.support_notifications (user_id, title, message)
    values (
      recipient,
      '📩 Resposta do suporte',
      'Você recebeu uma nova mensagem no chamado ' || (select protocol from public.support_tickets t where t.id = new.ticket_id)
    );
  END IF;

  return new;
END
$$;

drop trigger if exists trg_support_notify_new_message on public.support_messages;
create trigger trg_support_notify_new_message
after insert on public.support_messages
for each row
execute function public.support_notify_on_new_message();

-- ================================
-- Dica: Realtime
-- ================================
-- O admin e o membro devem usar Supabase Realtime para:
-- - INSERT em support_tickets (para notificações)
-- - INSERT em support_messages (chat)
-- - INSERT em support_notifications (notificações)



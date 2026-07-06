-- Area do Membro AD Bela-Vista
-- Rode este arquivo no SQL Editor do Supabase depois do schema principal.
-- Este fluxo usa tabela propria para contas de membros, sem criar usuarios em Authentication.

create extension if not exists pgcrypto;

grant usage on schema public to anon, authenticated;
grant usage on schema extensions to anon, authenticated;

create table if not exists public.member_accounts (
  id uuid primary key default extensions.gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text not null,
  cpf text unique,
  avatar_url text,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

alter table public.member_accounts
  add column if not exists avatar_url text;

alter table public.member_accounts
  alter column cpf drop not null;

create table if not exists public.member_account_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  account_id uuid not null references public.member_accounts(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);

alter table public.member_accounts enable row level security;
alter table public.member_account_sessions enable row level security;

create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.system_settings enable row level security;

create index if not exists idx_member_account_sessions_account_id
  on public.member_account_sessions(account_id);

create index if not exists idx_member_account_sessions_expires_at
  on public.member_account_sessions(expires_at);

alter table public.membros
  add column if not exists member_account_id uuid references public.member_accounts(id) on delete set null;

create index if not exists idx_membros_member_account_id
  on public.membros(member_account_id);

alter table public.membros enable row level security;

create or replace function public.member_token_hash(p_token text)
returns text
language sql
immutable
as $$
  select encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex');
$$;

create or replace function public.member_account_from_token(p_token text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select s.account_id
  from public.member_account_sessions s
  where s.token_hash = public.member_token_hash(p_token)
    and s.expires_at > now()
  limit 1;
$$;

drop function if exists public.member_register_account(text, text, text, text, text, text);
drop function if exists public.member_register_account(text, text, text, text, text);
create or replace function public.member_register_account(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_password text
)
returns table (
  account_id uuid,
  session_token text,
  full_name text,
  email text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_token text;
  v_email text;
begin
  v_email := lower(trim(coalesce(p_email, '')));

  if length(trim(coalesce(p_first_name, ''))) < 2 then
    raise exception 'Informe o nome.';
  end if;

  if length(trim(coalesce(p_last_name, ''))) < 2 then
    raise exception 'Informe o sobrenome.';
  end if;

  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Informe um e-mail valido.';
  end if;

  if length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) < 10 then
    raise exception 'Informe um telefone valido.';
  end if;

  if length(coalesce(p_password, '')) < 8 or coalesce(p_password, '') !~ '[A-Za-z]' or coalesce(p_password, '') !~ '[0-9]' then
    raise exception 'A senha precisa ter pelo menos 8 caracteres, com letras e numeros.';
  end if;

  insert into public.member_accounts (
    first_name,
    last_name,
    email,
    phone,
    password_hash
  )
  values (
    trim(p_first_name),
    trim(p_last_name),
    v_email,
    trim(p_phone),
    extensions.crypt(p_password, extensions.gen_salt('bf'))
  )
  returning id into v_account_id;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.member_account_sessions (account_id, token_hash)
  values (v_account_id, public.member_token_hash(v_token));

  return query
  select
    v_account_id,
    v_token,
    trim(p_first_name) || ' ' || trim(p_last_name),
    v_email;
exception
  when unique_violation then
    raise exception 'Este e-mail ja possui uma conta.';
end;
$$;

drop function if exists public.member_login_account(text, text);
create or replace function public.member_login_account(
  p_email text,
  p_password text
)
returns table (
  account_id uuid,
  session_token text,
  full_name text,
  email text,
  phone text,
  cpf text,
  avatar_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account public.member_accounts;
  v_token text;
begin
  select *
    into v_account
  from public.member_accounts a
  where a.email = lower(trim(coalesce(p_email, '')))
  limit 1;

  if v_account.id is null or extensions.crypt(coalesce(p_password, ''), v_account.password_hash) <> v_account.password_hash then
    raise exception 'E-mail ou senha incorretos.';
  end if;

  delete from public.member_account_sessions s
  where s.account_id = v_account.id
    and s.expires_at <= now();

  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.member_account_sessions (account_id, token_hash)
  values (v_account.id, public.member_token_hash(v_token));

  update public.member_accounts
  set last_login_at = now(),
      updated_at = now()
  where id = v_account.id;

  return query
  select
    v_account.id,
    v_token,
    v_account.first_name || ' ' || v_account.last_name,
    v_account.email,
    v_account.phone,
    v_account.cpf,
    v_account.avatar_url;
end;
$$;

drop function if exists public.member_get_account(text);
create or replace function public.member_get_account(p_session_token text)
returns table (
  account_id uuid,
  full_name text,
  email text,
  phone text,
  cpf text,
  avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id,
    a.first_name || ' ' || a.last_name,
    a.email,
    a.phone,
    a.cpf,
    a.avatar_url
  from public.member_accounts a
  where a.id = public.member_account_from_token(p_session_token)
  limit 1;
$$;

drop function if exists public.member_update_account(text, text, text, text, text);
create or replace function public.member_update_account(
  p_session_token text,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_avatar_url text default null
)
returns table (
  account_id uuid,
  full_name text,
  email text,
  phone text,
  cpf text,
  avatar_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
begin
  v_account_id := public.member_account_from_token(p_session_token);

  if v_account_id is null then
    raise exception 'Sessao expirada. Entre novamente.';
  end if;

  if length(trim(coalesce(p_first_name, ''))) < 2 then
    raise exception 'Informe o nome.';
  end if;

  if length(trim(coalesce(p_last_name, ''))) < 2 then
    raise exception 'Informe o sobrenome.';
  end if;

  if length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) < 10 then
    raise exception 'Informe um telefone valido.';
  end if;

  update public.member_accounts a
  set first_name = trim(p_first_name),
      last_name = trim(p_last_name),
      phone = trim(p_phone),
      avatar_url = coalesce(nullif(p_avatar_url, ''), a.avatar_url),
      updated_at = now()
  where a.id = v_account_id;

  return query
  select
    a.id,
    a.first_name || ' ' || a.last_name,
    a.email,
    a.phone,
    a.cpf,
    a.avatar_url
  from public.member_accounts a
  where a.id = v_account_id;
end;
$$;

create or replace function public.member_logout_account(p_session_token text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.member_account_sessions s
  where s.token_hash = public.member_token_hash(p_session_token);
$$;

drop function if exists public.member_list_registrations(text);
create or replace function public.member_list_registrations(p_session_token text)
returns table (
  id uuid,
  nome text,
  cpf text,
  tipo_cadastro text,
  status text,
  created_at timestamptz,
  data_nasc date,
  celular text,
  email text,
  estado_civil text,
  cidade_estado text,
  setor_igreja text,
  forma_recebimento text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.id,
    m.nome,
    m.cpf,
    m.tipo_cadastro,
    m.status,
    m.created_at,
    m.data_nasc,
    m.celular,
    m.email,
    m.estado_civil,
    m.cidade_estado,
    m.setor_igreja,
    m.forma_recebimento
  from public.membros m
  where m.member_account_id = public.member_account_from_token(p_session_token)
  order by m.created_at desc;
$$;

create or replace function public.member_create_registration(
  p_session_token text,
  p_payload jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_id uuid;
  v_payload jsonb;
  v_columns text;
  v_values text;
begin
  v_account_id := public.member_account_from_token(p_session_token);

  if v_account_id is null then
    raise exception 'Sessao expirada. Entre novamente.';
  end if;

  v_payload := coalesce(p_payload, '{}'::jsonb)
    - 'id'
    - 'created_at'
    - 'updated_at'
    - 'account_id'
    - 'member_account_id';

  v_payload := jsonb_set(v_payload, '{member_account_id}', to_jsonb(v_account_id), true);
  v_payload := jsonb_set(v_payload, '{status}', to_jsonb('Em análise'::text), true);

  select
    string_agg(format('%I', c.column_name), ', ' order by c.ordinal_position),
    string_agg(
      case
        when a.atttypid in ('text'::regtype, 'varchar'::regtype, 'bpchar'::regtype)
          then format('$1->>%L', c.column_name)
        else format('nullif($1->>%L, '''')::%s', c.column_name, format_type(a.atttypid, a.atttypmod))
      end,
      ', ' order by c.ordinal_position
    )
  into v_columns, v_values
  from information_schema.columns c
  join pg_class cl
    on cl.relname = c.table_name
  join pg_namespace ns
    on ns.oid = cl.relnamespace
    and ns.nspname = c.table_schema
  join pg_attribute a
    on a.attrelid = cl.oid
    and a.attname = c.column_name
    and a.attnum > 0
    and not a.attisdropped
  where c.table_schema = 'public'
    and c.table_name = 'membros'
    and c.column_name in (select jsonb_object_keys(v_payload))
    and c.column_name not in ('id', 'created_at', 'updated_at');

  if v_columns is null then
    raise exception 'Payload de cadastro vazio ou invalido.';
  end if;

  execute format(
    'insert into public.membros (%s) select %s returning id',
    v_columns,
    v_values
  )
  using v_payload
  into v_id;

  return v_id;
end;
$$;

create or replace function public.member_get_registration(
  p_session_token text,
  p_registration_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select to_jsonb(m)
  from public.membros m
  where m.id = p_registration_id
    and m.member_account_id = public.member_account_from_token(p_session_token)
  limit 1;
$$;

create or replace function public.member_update_registration(
  p_session_token text,
  p_registration_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_payload jsonb;
  v_sets text;
  v_updated jsonb;
begin
  v_account_id := public.member_account_from_token(p_session_token);

  if v_account_id is null then
    raise exception 'Sessao expirada. Entre novamente.';
  end if;

  if not exists (
    select 1
    from public.membros m
    where m.id = p_registration_id
      and m.member_account_id = v_account_id
  ) then
    raise exception 'Cadastro nao encontrado para esta conta.';
  end if;

  v_payload := coalesce(p_payload, '{}'::jsonb)
    - 'id'
    - 'created_at'
    - 'updated_at'
    - 'account_id'
    - 'member_account_id'
    - 'foto_url'
    - 'doc_url'
    - 'foto_certidao_nasc'
    - 'foto_certidao_casamento'
    - 'foto_diploma'
    - 'foto_comprovante_end'
    - 'assinatura_url';

  v_payload := v_payload - 'status' - 'data_aprovacao';
  v_payload := jsonb_set(v_payload, '{status}', to_jsonb('Em análise'::text), true);

  select string_agg(
    format(
      '%I = %s',
      c.column_name,
      case
        when a.atttypid in ('text'::regtype, 'varchar'::regtype, 'bpchar'::regtype)
          then format('$1->>%L', c.column_name)
        else format('nullif($1->>%L, '''')::%s', c.column_name, format_type(a.atttypid, a.atttypmod))
      end
    ),
    ', ' order by c.ordinal_position
  )
  into v_sets
  from information_schema.columns c
  join pg_class cl
    on cl.relname = c.table_name
  join pg_namespace ns
    on ns.oid = cl.relnamespace
    and ns.nspname = c.table_schema
  join pg_attribute a
    on a.attrelid = cl.oid
    and a.attname = c.column_name
    and a.attnum > 0
    and not a.attisdropped
  where c.table_schema = 'public'
    and c.table_name = 'membros'
    and c.column_name in (select jsonb_object_keys(v_payload))
    and c.column_name not in ('id', 'created_at', 'updated_at', 'member_account_id');

  if v_sets is null then
    raise exception 'Nenhum campo valido para atualizar.';
  end if;

  execute format(
    'update public.membros set %s where id = $2 and member_account_id = $3 returning to_jsonb(public.membros.*)',
    v_sets
  )
  using v_payload, p_registration_id, v_account_id
  into v_updated;

  return v_updated;
end;
$$;

create or replace function public.admin_save_pastor_signature(
  p_signature_url text,
  p_pastor_name text default 'Pastor responsavel',
  p_pastor_role text default 'Pastor responsavel'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_value jsonb;
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'pastor')
  ) then
    raise exception 'Acesso negado.';
  end if;

  if length(coalesce(p_signature_url, '')) < 30 then
    raise exception 'Assinatura invalida.';
  end if;

  v_value := jsonb_build_object(
    'signature_url', p_signature_url,
    'pastor_name', nullif(trim(coalesce(p_pastor_name, '')), ''),
    'pastor_role', nullif(trim(coalesce(p_pastor_role, '')), '')
  );

  insert into public.system_settings (key, value, updated_at)
  values ('pastor_signature', v_value, now())
  on conflict (key) do update
    set value = excluded.value,
        updated_at = now();

  return v_value;
end;
$$;

create or replace function public.get_pastor_signature()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select s.value
      from public.system_settings s
      where s.key = 'pastor_signature'
      limit 1
    ),
    '{}'::jsonb
  );
$$;

revoke all on function public.member_token_hash(text) from public;
revoke all on function public.member_account_from_token(text) from public;
revoke all on function public.member_register_account(text, text, text, text, text) from public;
revoke all on function public.member_login_account(text, text) from public;
revoke all on function public.member_get_account(text) from public;
revoke all on function public.member_update_account(text, text, text, text, text) from public;
revoke all on function public.member_logout_account(text) from public;
revoke all on function public.member_list_registrations(text) from public;
revoke all on function public.member_create_registration(text, jsonb) from public;
revoke all on function public.member_get_registration(text, uuid) from public;
revoke all on function public.member_update_registration(text, uuid, jsonb) from public;
revoke all on function public.admin_save_pastor_signature(text, text, text) from public;
revoke all on function public.get_pastor_signature() from public;

grant execute on function public.member_register_account(text, text, text, text, text) to anon, authenticated;
grant execute on function public.member_login_account(text, text) to anon, authenticated;
grant execute on function public.member_get_account(text) to anon, authenticated;
grant execute on function public.member_update_account(text, text, text, text, text) to anon, authenticated;
grant execute on function public.member_logout_account(text) to anon, authenticated;
grant execute on function public.member_list_registrations(text) to anon, authenticated;
grant execute on function public.member_create_registration(text, jsonb) to anon, authenticated;
grant execute on function public.member_get_registration(text, uuid) to anon, authenticated;
grant execute on function public.member_update_registration(text, uuid, jsonb) to anon, authenticated;
grant execute on function public.admin_save_pastor_signature(text, text, text) to authenticated;
grant execute on function public.get_pastor_signature() to anon, authenticated;

-- Arquivos enviados pelo membro no bucket privado membros-docs.
-- O fluxo customizado de login nao usa Authentication, entao os uploads continuam
-- passando pelas regras existentes do projeto. A ficha em si e salva por RPC.

insert into storage.buckets (id, name, public)
values ('membros-docs', 'membros-docs', false)
on conflict (id) do update set public = false;

-- Forca o PostgREST/Supabase API a reconhecer as novas funcoes RPC.
notify pgrst, 'reload schema';

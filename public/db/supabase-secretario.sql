  -- SQL para habilitar o painel do secretario no Supabase.
  -- Rode no SQL Editor do Supabase depois de criar o usuario do secretario em Authentication.

  -- 1) Perfis de acesso
  create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role text not null default 'secretario',
    created_at timestamptz not null default now()
  );

  alter table public.profiles
    add column if not exists role text not null default 'secretario';

  alter table public.profiles
    alter column role set default 'secretario';

  update public.profiles
  set role = 'secretario'
  where role is null;

  alter table public.profiles
    alter column role set not null;

  alter table public.profiles drop constraint if exists profiles_role_check;
  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('admin', 'pastor', 'secretario'));

  alter table public.profiles enable row level security;

  -- Helper usado pelas policies e pela busca segura.
  create or replace function public.tem_role(roles text[])
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
      and p.role = any(roles)
    );
  $$;

  revoke all on function public.tem_role(text[]) from public;
  grant execute on function public.tem_role(text[]) to authenticated;

  create or replace function public.admin_list_auth_users()
  returns table (
    id uuid,
    email text,
    role text,
    created_at timestamptz,
    last_sign_in_at timestamptz
  )
  language sql
  stable
  security definer
  set search_path = public, auth
  as $$
    select
      u.id,
      u.email::text,
      coalesce(p.role, 'sem perfil') as role,
      u.created_at,
      u.last_sign_in_at
    from auth.users u
    left join public.profiles p on p.id = u.id
    where public.tem_role(array['admin', 'secretario'])
    order by u.created_at desc
    limit 200;
  $$;

  revoke all on function public.admin_list_auth_users() from public;
  grant execute on function public.admin_list_auth_users() to authenticated;

  create or replace function public.admin_upsert_user_role(
    p_email text,
    p_role text
  )
  returns table (
    id uuid,
    email text,
    role text
  )
  language plpgsql
  security definer
  set search_path = public, auth
  as $$
  declare
    v_user auth.users%rowtype;
    v_role text;
  begin
    if not public.tem_role(array['admin', 'secretario']) then
      raise exception 'Acesso restrito.';
    end if;

    v_role := lower(trim(coalesce(p_role, '')));
    if v_role not in ('admin', 'pastor', 'secretario') then
      raise exception 'Perfil invalido.';
    end if;

    select *
    into v_user
    from auth.users
    where lower(email) = lower(trim(coalesce(p_email, '')))
    limit 1;

    if v_user.id is null then
      raise exception 'Usuario nao encontrado no Authentication. Crie o login primeiro e tente novamente.';
    end if;

    insert into public.profiles (id, role)
    values (v_user.id, v_role)
    on conflict (id) do update set role = excluded.role;

    return query
    select v_user.id, v_user.email::text, v_role;
  end;
  $$;

  revoke all on function public.admin_upsert_user_role(text, text) from public;
  grant execute on function public.admin_upsert_user_role(text, text) to authenticated;

  drop policy if exists "Usuario ve proprio perfil" on public.profiles;
  create policy "Usuario ve proprio perfil"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

  drop policy if exists "Admin ve perfis" on public.profiles;
  create policy "Admin ve perfis"
  on public.profiles
  for select
  to authenticated
  using (public.tem_role(array['admin', 'pastor', 'secretario']));

  drop policy if exists "Admin gerencia perfis" on public.profiles;
  create policy "Admin gerencia perfis"
  on public.profiles
  for all
  to authenticated
  using (public.tem_role(array['admin', 'secretario']))
  with check (public.tem_role(array['admin', 'secretario']));

  -- 2) Busca da secretaria mantida por compatibilidade.
  -- O secretario agora tambem tem acesso administrativo completo pelo painel unificado.
  create or replace function public.buscar_membros_secretaria(
    termo text,
    termo_digits text default '',
    termo_cpf_formatado text default ''
  )
  returns setof public.membros
  language sql
  stable
  security definer
  set search_path = public
  as $$
    with entrada as (
      select
        trim(coalesce(termo, '')) as t,
        regexp_replace(coalesce(termo_digits, termo, ''), '\D', '', 'g') as d,
        trim(coalesce(termo_cpf_formatado, '')) as f
    )
    select m.*
    from public.membros m
    cross join entrada e
    where public.tem_role(array['admin', 'pastor', 'secretario'])
      and (
        (char_length(e.t) >= 3 and m.nome ilike ('%' || replace(replace(e.t, '%', ''), ',', '') || '%'))
        or (char_length(e.t) >= 3 and coalesce(m.cpf, '') ilike ('%' || replace(replace(e.t, '%', ''), ',', '') || '%'))
        or (char_length(e.d) >= 4 and regexp_replace(coalesce(m.cpf, ''), '\D', '', 'g') ilike ('%' || e.d || '%'))
        or (char_length(e.f) >= 4 and coalesce(m.cpf, '') ilike ('%' || e.f || '%'))
      )
    order by m.nome
    limit 12;
  $$;

  revoke all on function public.buscar_membros_secretaria(text, text, text) from public;
  grant execute on function public.buscar_membros_secretaria(text, text, text) to authenticated;

  -- 3) Politicas da tabela membros.
  -- Admin, pastor e secretario acessam o painel unificado.
  -- Secretario tem o mesmo acesso operacional do admin, inclusive exclusao.
  alter table public.membros enable row level security;

  -- Defesa extra para cadastros enviados pelo formulario publico.
  -- RLS controla a permissao; o trigger normaliza e recusa payloads abusivos enviados via DevTools/API.
  create or replace function public.validar_cadastro_publico_membros()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
  as $$
  begin
    if auth.role() = 'anon' then
      new.tipo_cadastro := nullif(trim(coalesce(new.tipo_cadastro, '')), '');
      new.nome := nullif(trim(coalesce(new.nome, '')), '');
      new.cpf := nullif(trim(coalesce(new.cpf, '')), '');
      new.celular := nullif(trim(coalesce(new.celular, '')), '');
      new.status := 'Pendente';
      new.member_account_id := null;
      new.data_aprovacao := null;
      new.privacy_version := nullif(trim(coalesce(new.privacy_version, '')), '');
      new.privacy_source := 'public_registration';
      new.privacy_accepted_at := now();

      if new.tipo_cadastro not in ('Membro', 'Congregado') then
        raise exception 'Tipo de cadastro invalido.';
      end if;

      if new.nome is null or length(new.nome) < 3 or length(new.nome) > 160 then
        raise exception 'Nome obrigatorio ou invalido.';
      end if;

      if length(regexp_replace(coalesce(new.cpf, ''), '\D', '', 'g')) < 4 then
        raise exception 'Documento obrigatorio ou invalido.';
      end if;

      if length(regexp_replace(coalesce(new.celular, ''), '\D', '', 'g')) < 10 then
        raise exception 'Celular obrigatorio ou invalido.';
      end if;

      if length(coalesce(new.privacy_version, '')) not between 1 and 64 then
        raise exception 'Aceite dos termos de privacidade invalido.';
      end if;
    end if;

    return new;
  end;
  $$;

  drop trigger if exists validar_cadastro_publico_membros_trg on public.membros;
  create trigger validar_cadastro_publico_membros_trg
  before insert on public.membros
  for each row
  execute function public.validar_cadastro_publico_membros();

  drop policy if exists "Admin ve todos membros" on public.membros;
  create policy "Admin ve todos membros"
  on public.membros
  for select
  to authenticated
  using (public.tem_role(array['admin', 'pastor', 'secretario']));

  drop policy if exists "Cadastro publico insere membros" on public.membros;
  create policy "Cadastro publico insere membros"
  on public.membros
  for insert
  to anon
  with check (
    tipo_cadastro in ('Membro', 'Congregado')
    and coalesce(status, 'Pendente') = 'Pendente'
    and length(trim(coalesce(nome, ''))) between 3 and 160
    and length(regexp_replace(coalesce(cpf, ''), '\D', '', 'g')) >= 4
    and length(regexp_replace(coalesce(celular, ''), '\D', '', 'g')) >= 10
    and privacy_accepted_at is not null
    and length(trim(coalesce(privacy_version, ''))) between 1 and 64
    and privacy_source = 'public_registration'
  );

  drop policy if exists "Admin e secretaria inserem membros" on public.membros;
  create policy "Admin e secretaria inserem membros"
  on public.membros
  for insert
  to authenticated
  with check (public.tem_role(array['admin', 'pastor', 'secretario']));

  drop policy if exists "Admin e secretaria atualizam membros" on public.membros;
  create policy "Admin e secretaria atualizam membros"
  on public.membros
  for update
  to authenticated
  using (public.tem_role(array['admin', 'pastor', 'secretario']))
  with check (public.tem_role(array['admin', 'pastor', 'secretario']));

  drop policy if exists "Admin exclui membros" on public.membros;
  create policy "Admin exclui membros"
  on public.membros
  for delete
  to authenticated
  using (public.tem_role(array['admin', 'secretario']));

  -- 4) Storage para arquivos enviados pela secretaria.
  -- Ajuste os buckets se no seu projeto eles tiverem outro nome.
  insert into storage.buckets (id, name, public)
  values ('membros-docs', 'membros-docs', false)
  on conflict (id) do update set public = false;

  drop policy if exists "Secretaria envia arquivos membros-docs" on storage.objects;
  create policy "Secretaria envia arquivos membros-docs"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'membros-docs'
    and public.tem_role(array['admin', 'pastor', 'secretario'])
  );

  drop policy if exists "Secretaria atualiza arquivos membros-docs" on storage.objects;
  create policy "Secretaria atualiza arquivos membros-docs"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'membros-docs'
    and public.tem_role(array['admin', 'pastor', 'secretario'])
  )
  with check (
    bucket_id = 'membros-docs'
    and public.tem_role(array['admin', 'pastor', 'secretario'])
  );

  drop policy if exists "Secretaria remove arquivos membros-docs" on storage.objects;
  create policy "Secretaria remove arquivos membros-docs"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'membros-docs'
    and public.tem_role(array['admin', 'pastor', 'secretario'])
  );

  drop policy if exists "Secretaria le arquivos membros-docs" on storage.objects;
  create policy "Secretaria le arquivos membros-docs"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'membros-docs'
    and public.tem_role(array['admin', 'pastor', 'secretario'])
  );

  -- 5) Transformar usuarios em admin/secretario.
  -- Troque os e-mails abaixo pelos e-mails reais criados em Authentication.

  -- Pastor / admin:
  -- insert into public.profiles (id, role)
  -- select id, 'admin'
  -- from auth.users
  -- where email = 'email-do-pastor@exemplo.com'
  -- on conflict (id) do update set role = excluded.role;

  -- Secretario:
  -- insert into public.profiles (id, role)
  -- select id, 'secretario'
  -- from auth.users
  -- where email = 'email-do-secretario@exemplo.com'
  -- on conflict (id) do update set role = excluded.role;

  notify pgrst, 'reload schema';

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
    check (role in ('admin', 'pastor', 'secretario', 'suporte'));

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
  using (public.tem_role(array['admin', 'pastor']));

  drop policy if exists "Admin gerencia perfis" on public.profiles;
  create policy "Admin gerencia perfis"
  on public.profiles
  for all
  to authenticated
  using (public.tem_role(array['admin']))
  with check (public.tem_role(array['admin']));

  -- 2) Busca limitada para a secretaria.
  -- O secretario nao precisa de SELECT direto na tabela inteira.
  -- O painel chama esta funcao e recebe no maximo 12 resultados por busca.
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
  -- Admin ve tudo; secretario busca pela funcao acima e pode atualizar cadastros.
  -- Cadastros publicos continuam aceitos, e admin/secretario tambem podem criar cadastros logados.
  alter table public.membros enable row level security;

  drop policy if exists "Admin ve todos membros" on public.membros;
  create policy "Admin ve todos membros"
  on public.membros
  for select
  to authenticated
  using (public.tem_role(array['admin', 'pastor']));

  drop policy if exists "Cadastro publico insere membros" on public.membros;
  create policy "Cadastro publico insere membros"
  on public.membros
  for insert
  to anon
  with check (true);

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
  using (public.tem_role(array['admin']));

  -- 4) Storage para arquivos enviados pela secretaria.
  -- Ajuste os buckets se no seu projeto eles tiverem outro nome.
  drop policy if exists "Secretaria envia arquivos membros-docs" on storage.objects;
  create policy "Secretaria envia arquivos membros-docs"
  on storage.objects
  for insert
  to authenticated
  with check (
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

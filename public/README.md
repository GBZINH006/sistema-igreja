# Sistema AD Bela-Vista

Aplicacao estatica para cadastro publico, portal do membro e painel administrativo/pastoral da AD Bela-Vista.

## Paginas principais

- `cadastro.html`: ficha publica de cadastro.
- `membro-login.html`: login/criacao de conta do membro.
- `membro.html`: portal do membro.
- `admin.html`: painel restrito para `admin` e `pastor`.
- `relatorios.html`, `indicadores.html`, `configuracoes.html`: paginas auxiliares do painel.

## Seguranca

- A chave em `config.js` deve ser a chave `anon` do Supabase. Nunca coloque `service_role` em arquivos dentro de `public`.
- Rode `supabase-security-hardening.sql` no SQL Editor do Supabase para aplicar RLS, roles, auditoria e bucket privado.
- O bucket principal de documentos deve ser `membros-docs`, privado, com URLs assinadas.
- Usuarios do painel devem existir no Supabase Auth e ter perfil em `public.profiles`.

Exemplo para liberar um pastor:

```sql
insert into public.profiles (id, role)
select id, 'pastor'
from auth.users
where email = 'pastor@dominio.com'
on conflict (id) do update set role = excluded.role;
```

Exemplo para liberar um administrador:

```sql
insert into public.profiles (id, role)
select id, 'admin'
from auth.users
where email = 'admin@dominio.com'
on conflict (id) do update set role = excluded.role;
```

## Deploy

O deploy esperado e Vercel. O arquivo `vercel.json` define headers de seguranca e redireciona rotas desconhecidas para `cadastro.html`.

## Observacoes

A central de suporte antiga foi removida do codigo publico. O foco atual do sistema e ficha, portal do membro e painel.

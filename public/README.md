# Sistema AD Bela-Vista

Aplicacao estatica para cadastro publico, portal do membro e painel administrativo/pastoral da AD Bela-Vista.

## Paginas principais

- `pages/cadastro.html`: ficha publica de cadastro.
- `pages/membro-login.html`: login/criacao de conta do membro.
- `pages/membro.html`: portal do membro.
- `pages/admin.html`: painel restrito para `admin`, `pastor` e `secretario`.
- `pages/usuarios.html`: cadastro e controle de usuarios administrativos.
- `pages/relatorios.html`, `pages/indicadores.html`, `pages/configuracoes.html`: paginas auxiliares do painel.
- `pages/suporte.html`: manual publico da ficha de cadastro.

## Estrutura de pastas

- `pages/`: arquivos HTML.
- `js/`: scripts JavaScript.
- `css/`: estilos.
- `assets/`: imagens e midias estaticas.
- `db/`: scripts SQL do Supabase.
- `robots/`: arquivo `robots.txt`.

## Seguranca

- A chave em `config.js` deve ser a chave `anon` do Supabase. Nunca coloque `service_role` em arquivos dentro de `public`.
- Rode `supabase-security-hardening.sql` no SQL Editor do Supabase para aplicar RLS, roles, auditoria e bucket privado.
- O bucket principal de documentos deve ser `membros-docs`, privado, com URLs assinadas.
- Usuarios do painel devem existir no Supabase Auth e ter perfil em `public.profiles`.
- Use `pages/usuarios.html` para criar logins e definir perfis quando as RPCs administrativas estiverem aplicadas.

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

O deploy esperado e Vercel. O arquivo `vercel.json` define headers de seguranca, mantem compatibilidade com rotas como `/admin.html` e redireciona rotas desconhecidas para `pages/cadastro.html`.

## Observacoes

A central de suporte antiga foi substituida por `pages/suporte.html`, uma pagina publica focada apenas no preenchimento da ficha. Ela nao divulga rotas restritas.

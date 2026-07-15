# AD Bela-Vista - Guia de Deploy

**Versao do documento:** 1.2

---

## 1. Estrutura

- `public/pages/`: HTML.
- `public/js/`: JavaScript.
- `public/css/`: CSS.
- `public/db/`: SQLs do Supabase.
- `public/assets/`: imagens.
- `public/vercel.json`: headers e rewrites.

---

## 2. Rotas principais

- `/cadastro.html` -> ficha publica.
- `/membro-login.html` -> login do membro.
- `/membro.html` -> portal do membro.
- `/admin.html` -> painel admin/pastor.
- `/secretario.html` -> painel secretaria.
- `/relatorios.html` -> relatorios.
- `/indicadores.html` -> indicadores.
- `/configuracoes.html` -> configuracoes.
- `/privacidade.html` -> privacidade.
- `/suporte.html` ou `/manual.html` -> manual/ajuda.

---

## 3. Supabase

Antes de publicar:

1. Configure `public/js/config.js` com URL e chave anon.
2. Rode os SQLs em `public/db/`.
3. Crie usuarios no Supabase Auth.
4. Cadastre roles em `public.profiles`.
5. Confirme RLS.
6. Confirme bucket `membros-docs` privado.

Roles:

- `admin`
- `pastor`
- `secretario`

---

## 4. Vercel

O `vercel.json` deve:

- aplicar headers de seguranca;
- bloquear cache em paginas restritas;
- mapear rotas `.html` para `public/pages`;
- direcionar rotas desconhecidas para a ficha publica.

---

## 5. Checklist Pos-Deploy

- [ ] `/cadastro.html` abre.
- [ ] `/membro-login.html` cria/acessa conta.
- [ ] `/membro.html` lista fichas do membro.
- [ ] `/admin.html` entra com admin/pastor.
- [ ] Pastor nao exclui cadastro.
- [ ] Admin exclui cadastro.
- [ ] `/secretario.html` entra com secretario.
- [ ] `/suporte.html` abre o manual.
- [ ] PDF e Excel funcionam.
- [ ] RLS bloqueia usuario indevido.
- [ ] Bucket `membros-docs` esta privado.

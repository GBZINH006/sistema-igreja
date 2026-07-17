# AD Bela-Vista - Requisitos do Sistema

**Versao do documento:** 1.2

---

## 1. Ambiente

- Aplicacao estatica servida a partir de `public/`.
- Paginas em `public/pages/`.
- Scripts em `public/js/`.
- Estilos em `public/css/`.
- SQLs em `public/db/`.
- Deploy previsto em Vercel ou hospedagem estatica equivalente.

---

## 2. Dependencias

O navegador precisa acessar:

- Supabase JS;
- Supabase Auth/Postgres/Storage/Realtime;
- Font Awesome;
- Google Fonts;
- jsPDF;
- jsPDF AutoTable;
- Chart.js;
- XLSX;
- ViaCEP;
- API de localidades do IBGE.

---

## 3. Banco e Storage

Obrigatorio:

- tabela `membros`;
- tabela `profiles`;
- roles `admin`, `pastor`, `secretario`;
- RLS ativo;
- bucket privado `membros-docs`;
- SQLs em `public/db/` aplicados no Supabase.

---

## 4. Funcionalidades

- Ficha publica de membro/congregado.
- Portal do membro.
- Painel administrativo unificado.
- Cadastro e controle de usuarios administrativos.
- Fluxo de status: `Pendente`, `Em análise`, `Correção`, `Aprovado`.
- Exportacao PDF/Excel.
- PDF completo da ficha.
- Assinatura digital do membro.
- Assinatura do pastor nos PDFs.
- Manual publico da ficha em `public/pages/suporte.html`.

---

## 5. Seguranca

- Usar somente chave anonima no front-end.
- Nunca expor `service_role`.
- Manter headers de seguranca no `vercel.json`.
- Manter `membros-docs` privado.
- Usar contas individuais.
- Restringir exclusao a `admin` e `secretario`.
- Testar RLS apos qualquer alteracao.

---

## 6. Compatibilidade

Navegadores recomendados:

- Chrome atualizado;
- Edge atualizado;
- Firefox atualizado.

O navegador precisa suportar JavaScript moderno, `canvas`, upload de arquivos, `localStorage` e HTTPS.

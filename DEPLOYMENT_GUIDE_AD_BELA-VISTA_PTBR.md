# AD Bela-Vista — Deployment Guide

**Versão do documento:** 1.0  
**Público:** equipe técnica.

---

## 1. Visão Geral

Este guia descreve como publicar e manter o sistema web para uso pela igreja.

---

## 2. Estrutura do Projeto (pasta `public/`)

- `admin.html`, `admin.js`, `admin.css`: painel administrativo
- `cadastro.html`, `cadastro.js`, `cadastro.css`: formulário de cadastro
- `config.js`: configurações do ambiente (ex.: chaves/URLs)
- `images*`, demais assets

> **Dica:** Mantenha `public/` como diretório estático.

---

## 3. Requisitos para Funcionamento

- Navegador moderno (recomendado: Chrome/Edge atual)
- Permissão para leitura de mídia anexada no upload
- Acesso ao backend/serviços usados pelo projeto (ex.: banco/armazenamento)

---

## 4. Passo a Passo de Deploy

1. Garanta que os arquivos estáticos estejam disponíveis no servidor.
2. Ajuste `public/config.js` para apontar para o ambiente correto.
3. Publicar:
   - `public/admin.html`
   - `public/cadastro.html`
4. Testar:
   - login no admin
   - cadastro completo com assinatura
   - edição e exclusão
   - exportação PDF e Excel
   - visualização de fotos/documentos

---

## 5. Validação Pós-Deploy

Checklist rápido:

- [ ] Admin abre sem erro
- [ ] Cadastro envia e aparece no admin
- [ ] “Último cadastro” atualiza no painel
- [ ] Sino/notificações funcionam
- [ ] PDF e Excel geram arquivos com dados

---

## 6. Boas Práticas de Operação

- Faça backup do ambiente (dados e anexos) antes de mudanças.
- Registre versões do front-end.


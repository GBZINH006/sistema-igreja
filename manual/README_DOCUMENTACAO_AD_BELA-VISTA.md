# Documentacao do Sistema - AD Bela-Vista

Este diretorio contem a documentacao operacional e tecnica do sistema **AD Bela-Vista**.

## Arquivos disponiveis

| Arquivo | Conteudo |
|---|---|
| `USER_MANUAL_AD_BELA-VISTA_PTBR.md` | Manual de uso para pastor, administrador e secretaria. |
| `ADMINISTRATOR_MANUAL_AD_BELA-VISTA_PTBR.md` | Procedimentos administrativos, permissoes e troubleshooting. |
| `DEPLOYMENT_GUIDE_AD_BELA-VISTA_PTBR.md` | Guia de deploy conforme estrutura atual em `public/pages`, `public/js`, `public/css` e `public/db`. |
| `SYSTEM_REQUIREMENTS_AD_BELA-VISTA_PTBR.md` | Requisitos tecnicos, dependencias e seguranca. |
| `DATABASE_DOCUMENTATION_AD_BELA-VISTA_PTBR.md` | Documentacao descritiva do banco, Storage, roles e realtime. |

## Estrutura atual do sistema

- Paginas: `public/pages/`
- Scripts: `public/js/`
- Estilos: `public/css/`
- SQLs: `public/db/`
- Assets: `public/assets/`

## Paineis principais

- Admin/pastor: `public/pages/admin.html`
- Secretaria: `public/pages/secretario.html`
- Cadastro publico: `public/pages/cadastro.html`
- Portal do membro: `public/pages/membro-login.html` e `public/pages/membro.html`

## Como exportar para PDF

1. Abra cada arquivo `.md` em um editor compativel, como VS Code.
2. Use impressao/exportacao do editor ou uma extensao de Markdown para PDF.
3. Revise o PDF gerado antes de distribuir.

> **Observacao:** estes manuais foram alinhados com a organizacao atual do projeto e com as permissoes observadas no codigo.

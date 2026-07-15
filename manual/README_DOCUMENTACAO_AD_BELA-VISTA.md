# Documentacao do Sistema - AD Bela-Vista

Este diretorio contem a documentacao operacional e tecnica do sistema.

## Arquivos

| Arquivo | Conteudo |
|---|---|
| `USER_MANUAL_AD_BELA-VISTA_PTBR.md` | Uso diario: ficha, portal, painel, secretaria e manual/ajuda. |
| `ADMINISTRATOR_MANUAL_AD_BELA-VISTA_PTBR.md` | Rotinas administrativas, roles, aprovacao e troubleshooting. |
| `DATABASE_DOCUMENTATION_AD_BELA-VISTA_PTBR.md` | Banco, Storage, roles, status, auditoria e RPCs. |
| `DEPLOYMENT_GUIDE_AD_BELA-VISTA_PTBR.md` | Deploy em Vercel e checklist de publicacao. |
| `SYSTEM_REQUIREMENTS_AD_BELA-VISTA_PTBR.md` | Requisitos tecnicos, dependencias e seguranca. |

## Estrutura atual

- Paginas: `public/pages/`
- Scripts: `public/js/`
- Estilos: `public/css/`
- SQLs: `public/db/`
- Assets: `public/assets/`

## Paineis e rotas

- Ficha publica: `public/pages/cadastro.html`
- Portal do membro: `public/pages/membro-login.html` e `public/pages/membro.html`
- Admin/pastor: `public/pages/admin.html`
- Secretaria: `public/pages/secretario.html`
- Manual publico da ficha: `public/pages/suporte.html`

> A antiga central de suporte foi substituida pelo manual navegavel do sistema.

## Imagens de apoio

- `public/assets/manual/manual-ficha-publica.svg`
- `public/assets/manual/manual-portal-membro.svg`
- `public/assets/manual/manual-painel-admin.svg`
- `public/assets/manual/manual-secretaria.svg`

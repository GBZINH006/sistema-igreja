# AD Bela-Vista - Requisitos do Sistema

**Versao do documento:** 1.1

---

## 1. Ambiente de Execucao

### 1.1 Hospedagem
- Aplicacao estatica servida a partir da pasta `public/`.
- Paginas principais localizadas em `public/pages/`.
- Deploy previsto em ambiente compativel com arquivos estaticos, como Vercel.

### 1.2 Navegadores suportados
- Chrome atualizado.
- Microsoft Edge atualizado.
- Firefox atualizado.

### 1.3 Recursos do navegador
O navegador precisa suportar:
- JavaScript moderno (ES6+);
- `canvas` para assinatura digital;
- upload de arquivos;
- camera/dispositivo de midia quando o usuario usar captura pela interface;
- `localStorage`;
- conexao HTTPS;
- requisicoes para APIs externas e Supabase.

---

## 2. Dependencias Externas

O sistema depende de acesso aos seguintes servicos/bibliotecas:

- Supabase JS.
- Supabase Auth.
- Supabase Postgres.
- Supabase Realtime.
- Supabase Storage.
- jsPDF.
- jsPDF AutoTable.
- Chart.js.
- XLSX.
- Font Awesome.
- Google Fonts.
- ViaCEP.
- API de localidades do IBGE.

> **Atencao:** se a rede bloquear CDNs externos, as bibliotecas devem ser servidas localmente.

---

## 3. Requisitos de Banco e Storage

- Tabela `membros` configurada.
- Tabela `profiles` configurada.
- Roles aplicadas: `admin`, `pastor`, `secretario` e `suporte`.
- RLS configurado conforme SQLs em `public/db/`.
- Bucket privado `membros-docs`.
- Politicas de Storage para envio, leitura, atualizacao e remocao conforme perfil.

---

## 4. Requisitos de Acesso

### 4.1 Painel admin/pastor
Roles permitidas:
- `admin`
- `pastor`

Permissao de exclusao:
- somente `admin`

### 4.2 Painel da secretaria
Role permitida:
- `secretario`

### 4.3 Portal do membro
Usa fluxo proprio de conta/sessao do membro, conforme SQLs e scripts do portal.

---

## 5. Requisitos Funcionais

- Cadastro de Membro e Congregado.
- Validacao de campos obrigatorios.
- Assinatura digital obrigatoria no cadastro.
- Aceite de privacidade/LGPD.
- Upload de fotos e documentos.
- Consulta e edicao por perfis autorizados.
- Busca da secretaria por nome ou documento.
- Exportacao PDF e Excel no painel admin/pastor.
- PDF completo da ficha.
- Indicador **Ultimo cadastro**.
- Notificacoes de novos cadastros via realtime.
- Graficos e aniversariantes.
- Assinatura do pastor para fichas.

---

## 6. Requisitos de Seguranca

- Usar apenas chave anonima do Supabase no front-end.
- Nunca expor `service_role` em arquivos publicos.
- Manter `membros-docs` privado.
- Usar roles individuais por usuario.
- Revogar acessos antigos.
- Evitar credenciais compartilhadas.
- Manter headers de seguranca do `vercel.json` ou equivalente no provedor.

---

## 7. Compatibilidade de Exportacoes

- PDF: usa `jsPDF` e `autoTable`.
- Excel: usa `xlsx`.
- Graficos: usa `Chart.js`.

Se alguma biblioteca nao carregar, a funcionalidade correspondente pode ficar indisponivel.

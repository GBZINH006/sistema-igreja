# AD Bela-Vista - Documentacao de Banco de Dados

**Versao do documento:** 1.1  
**Observacao:** este documento descreve o uso do banco conforme o front-end e os SQLs do projeto.

---

## 1. Backend

O sistema usa Supabase para:
- autenticacao;
- banco Postgres;
- realtime;
- Storage de anexos;
- funcoes RPC;
- politicas RLS.

Os scripts SQL ficam em `public/db/`.

---

## 2. Entidade Principal: `membros`

O front-end trata membros e congregados como registros da tabela `membros`.

### Campos usados com frequencia
- `id`
- `created_at`
- `updated_at`
- `tipo_cadastro` (`Membro` ou `Congregado`)
- `status` (`Ativo`, `Inativo`, `Transferido`, `Falecido`, `Pendente`, `Em analise`, conforme fluxo)
- `nome`
- `rg`
- `cpf`
- `tipo_cpf`
- `data_nasc`
- `idade`
- `sexo`
- `tipo_sanguineo`
- `escolaridade`
- `estado_civil`
- `celular`
- `email`
- `cep`
- `bairro`
- `endereco`
- `cidade_estado`
- `setor_igreja`
- `congregacao_igreja`
- `cargo_principal`
- `forma_recebimento`
- `data_batismo_aguas`
- `data_batismo_es`
- `data_aprovacao`
- `member_account_id`

### Campos de anexos e midia
- `foto_url`
- `doc_url`
- `foto_certidao_nasc`
- `foto_certidao_casamento`
- `foto_diploma`
- `foto_comprovante_end`
- `assinatura_url`

---

## 3. Perfis e Roles

A tabela `profiles` vincula usuario autenticado a uma role.

Roles usadas:
- `admin`
- `pastor`
- `secretario`
- `suporte`

Uso esperado:
- `admin`: administra e pode excluir cadastros.
- `pastor`: acessa painel admin/pastor, sem exclusao.
- `secretario`: acessa painel da secretaria.
- `suporte`: previsto para apoio tecnico conforme politicas.

---

## 4. Storage

O bucket principal e:

- `membros-docs`

Ele deve ser privado.

O sistema salva arquivos e usa URLs assinadas para exibir:
- foto do cadastro;
- documento principal;
- certidoes;
- diploma;
- comprovante de endereco;
- assinatura do membro/congregado.

Ao excluir ou substituir arquivos, o painel admin tenta remover arquivos antigos do Storage quando aplicavel.

---

## 5. Carimbo de Data

O indicador **Ultimo cadastro** usa:

1. `created_at`, quando existir;
2. `commit_timestamp`, quando existir como fallback;
3. horario local atual apenas como fallback visual se nenhum carimbo valido estiver disponivel.

Para boa ordenacao, todo registro deve ter `created_at` valido.

---

## 6. Realtime

O painel admin/pastor escuta eventos:

- tabela: `membros`
- evento: `INSERT`
- schema: `public`

Quando um cadastro e inserido, o painel atualiza:
- lista local;
- cards;
- graficos;
- aniversariantes;
- notificacoes;
- indicador **Ultimo cadastro**.

---

## 7. Funcoes RPC Observadas

O sistema usa funcoes RPC para fluxos especificos, incluindo:

- busca da secretaria;
- salvamento/consulta de assinatura do pastor;
- fluxos do portal do membro.

Os nomes e definicoes devem ser conferidos nos SQLs em `public/db/`.

---

## 8. Boas Praticas

- Manter `created_at` preenchido.
- Nao expor chave `service_role` no front-end.
- Manter o bucket `membros-docs` privado.
- Validar RLS apos alteracoes em SQL.
- Padronizar `tipo_cadastro`, `status`, `setor_igreja` e `cargo_principal`.
- Fazer backup do banco e do Storage antes de mudancas grandes.

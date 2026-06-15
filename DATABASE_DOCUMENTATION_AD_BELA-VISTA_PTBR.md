# AD Bela-Vista — Database Documentation

**Versão do documento:** 1.0  
**Observação:** este documento é descritivo do modelo de dados conforme o front-end.

---

## 1. Entidades principais

O front-end trata os cadastros de membros/congregados como uma entidade (ex.: “membros”) com campos de perfil.

### Campos usados no admin (exemplos)
- `id`
- `nome`
- `tipo_cadastro` (Membro/Congregado)
- `status` (Ativo/Inativo/Transferido/Falecido)
- `cpf` e `rg`
- `tipo_cpf` (br/estrangeiro)
- `data_nasc` e `idade`
- `celular` e `email`
- `setor_igreja`, `congregacao_igreja`
- `cargo_principal`
- Datas de batismo/aprovação (`data_batismo_aguas`, `data_batismo_es`, `data_aprovacao`)
- Links de mídia:
  - `foto_url`, `doc_url`

### Campos de mídia (observado no comportamento)
- O sistema usa upload de arquivos (fotos/documentos) e salva URLs para renderizar anexos.

---

## 2. Carimbo de data do cadastro

O indicador **“Último cadastro”** depende de um campo de data/hora do registro.

- Caso `created_at` exista, ele é usado.
- Caso contrário, o sistema pode usar outro carimbo (`commit_timestamp`) como fallback.

---

## 3. Boas práticas para o administrador de dados

- Garantir consistência de campos obrigatórios.
- Garantir que registros possuam carimbo de data válido para melhor ordenação.
- Manter integridade entre URLs de mídia e anexos correspondentes.


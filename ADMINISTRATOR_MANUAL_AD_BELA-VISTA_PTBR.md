# AD Bela-Vista — Manual do Administrador

**Versão do documento:** 1.0  
**Público:** responsável técnico/administrador do sistema.

---

## 1. Objetivo

Definir procedimentos para:
- manter o acesso ao painel,
- acompanhar cadastros recém-criados,
- validar integrações (backend/armazenamento),
- e garantir funcionamento contínuo da gestão de membros.

> **Importante:** Este documento descreve o comportamento observado na interface e no código do projeto.

---

## 2. Visão do Sistema (componentes)

### 2.1 Telas principais
- `cadastro.html` / `cadastro.js`: captura e envio de dados do novo cadastro.
- `admin.html` / `admin.js`: painel administrativo (listagem, edições, relatórios, notificações).

### 2.2 Funcionalidades-chave do admin
- Cards de status e estatísticas
- Filtros e busca dinâmica
- Modais de detalhes e edição
- Exportação PDF e Excel
- Notificações de novos cadastros
- **Indicador “📌 Último cadastro” no painel principal**

---

## 3. Operação do Indicador “Último cadastro” (controle interno)

### 3.1 Comportamento esperado
- Ao abrir o admin, o sistema identifica o cadastro mais recente (por carimbo de data do registro) e mostra:
  - Nome
  - Data/hora
- Quando um novo cadastro é criado, o indicador é atualizado imediatamente.

### 3.2 Onde verificar
- No painel principal, seção **“📌 Último cadastro”**.

### 3.3 Casos de falha comuns
- Se cadastros antigos não tiverem data preenchida, pode ocorrer fallback para hora atual.
- Se a página estiver aberta muito tempo sem recarregar, o realtime pode não refletir novos eventos (dependendo do ambiente/infra).

---

## 4. Manutenção de Login e Permissões

### 4.1 Procedimento recomendado
1. Garanta que somente perfis autorizados acessem o admin.
2. Padronize contas por função (pastor/secretaria).
3. Revogue acessos quando houver troca de equipe.

> **Atenção:** Não é recomendado deixar credenciais compartilhadas.

---

## 5. Checklist Operacional (rotina diária)

- [ ] Abrir `admin.html`
- [ ] Conferir card **“Último cadastro”**
- [ ] Consultar notificação (sino) se houver novos cadastros
- [ ] Atualizar lista (botão ↻) se necessário
- [ ] Exportar PDF/Excel se a secretaria fizer backup

---

## 6. Checklist Operacional (rotina mensal)

- [ ] Validar integridade dos anexos (fotos/documentos) em registros.
- [ ] Conferir que exportações (PDF/Excel) incluem dados esperados.
- [ ] Revisar padrões de setor/cargo para melhorar filtros.

---

## 7. Troubleshooting do Administrador

### Problema: indicador não atualiza
- Recarregue o painel
- Verifique logs no console do navegador
- Confirme se o cadastro foi enviado com sucesso

### Problema: exportação vazia
- Confirme se `admin.js` carregou a lista corretamente
- Recarregue (↻)

---

## 8. Conclusão

O sistema foi construído para facilitar o acompanhamento de novos membros. O administrador deve garantir:
- acesso restrito ao painel,
- integridade dos cadastros e anexos,
- e atualização consistente do painel.


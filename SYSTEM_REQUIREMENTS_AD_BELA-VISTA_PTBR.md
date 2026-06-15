# AD Bela-Vista — System Requirements Document

**Versão do documento:** 1.0

---

## 1. Requisitos do Sistema

### 1.1 Ambiente de Execução
- Sistema operacional: Windows (compatível com o projeto atual), também deve funcionar em outros OS modernos.
- Navegadores suportados: Chrome / Edge / Firefox (últimas versões).

### 1.2 Recursos do Navegador
- Suporte a:
  - `canvas` para assinatura
  - upload de arquivos (fotos e documentos)
  - JavaScript moderno (ES6+)

### 1.3 Recursos Humanos
- Acesso ao painel admin restrito ao pastor/secretaria.

---

## 2. Requisitos de Segurança

- Controle de acesso (usuários autorizados)
- Boas práticas contra compartilhamento de credenciais

---

## 3. Compatibilidade com Exportações

- PDF: usa biblioteca `jsPDF` e `autoTable`
- Excel: usa `xlsx`

> **Atenção:** Certifique-se de que os CDNs estão acessíveis (internet) ou disponibilize as libs localmente.


# todo.md — Central de Suporte (conversa/decisões)

## Decisão de arquitetura
- Páginas separadas:
  - `public/suporte.html` : Central do **Membro**
  - `public/admin-suporte.html` : Painel do **Admin/ Suporte**

## Banco (SQL)
- Criado: `public/supabase-suporte.sql`
  - `support_tickets`, `support_messages`, `support_notifications`
  - Storage: buckets sugeridos `support-attachments` e `support-attachments-public`
  - RLS/Policies para acesso por `profiles.role` (admin/secretario/suporte)

## Próximos passos (implementação)
- Criar front-end usuário (ticket + chat + notificações + avaliação)
- Criar front-end admin (dashboard + lista + visualização + ações)

## Protocolo
- Protocolo gerado no banco: `SUP-YYYY-NNNN`.



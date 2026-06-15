# TODO - Sistema Igreja

## Agora (feito)
- ✅ Liberar indexação (robots.txt)
- ✅ Congregado: valida apenas campos mínimos (Nome, CPF/CRNM, Celular, Estado Civil + assinatura obrigatória)
- ✅ Congregado: tenta esconder/limpar campos extras ao alternar
- ✅ Bloqueio UX: overlay até escolher Membro/Congregado
- ✅ Cadastro.js: corrigido para usar window.CONFIG (sem process.env / SB_URL / SB_KEY)

## Próximo (necessário para não “misturar” preenchimentos)
- ⏳ Garantir que ao voltar pra trocar o tipo, limpar TODOS os campos do formulário (já há resetarCampos, mas revisar fluxo completo)

## PDF (ficha)
- ⏳ Implementar geração da ficha PDF com layout retangular e campos completos conforme modelo.
- ⏳ Atualizar Supabase/SQL somente com campos necessários.

## Supabase Admin (IMPORTANTE)
- ✅ Admin login: falha por credenciais inválidas (AuthApiError: Invalid login credentials)
- ⏳ Para destravar admin/secretaria: garantir que exista `public.profiles` no banco (admin.js e secretario.js usam `db.from('profiles')`).
- ⏳ Rodar SQL do arquivo `supabase-secretario.sql` para criar `public.profiles` e policies.

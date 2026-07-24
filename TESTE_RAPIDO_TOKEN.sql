-- ============================================================================
-- TESTE RÁPIDO DO SISTEMA DE TOKENS
-- ============================================================================
-- Execute este script depois de executar GERAR_TOKEN_CADASTRO.sql
-- ============================================================================

-- 1. GERAR UM TOKEN DE TESTE
-- Execute esta query e copie o "registration_url" retornado
SELECT * FROM generate_registration_token(2, 'TESTE - Primeiro token do sistema');

-- Resultado esperado:
-- token: (um código longo tipo "abc123XYZ...")
-- expires_at: (data/hora daqui a 2 horas)
-- registration_url: https://seu-dominio.vercel.app/pages/cadastro.html?token=abc123...


-- ============================================================================
-- 2. VALIDAR O TOKEN GERADO
-- Substitua 'SEU_TOKEN_AQUI' pelo token que você recebeu acima
-- ============================================================================
SELECT * FROM validate_registration_token('SEU_TOKEN_AQUI');

-- Resultado esperado:
-- valid: true
-- expired: false
-- used: false
-- expires_at: (mesma data de expiração)
-- time_remaining_seconds: (aprox. 7200 segundos = 2 horas)
-- created_by_name: (seu nome ou email)


-- ============================================================================
-- 3. LISTAR TODOS OS TOKENS ATIVOS
-- ============================================================================
SELECT * FROM list_active_tokens();

-- Você verá uma lista com todos os tokens criados recentemente


-- ============================================================================
-- 4. SIMULAR USO DO TOKEN (MARCAR COMO USADO)
-- Substitua 'SEU_TOKEN_AQUI' pelo token de teste
-- ============================================================================
SELECT mark_token_as_used('SEU_TOKEN_AQUI', 'teste@exemplo.com');

-- Resultado esperado: true


-- ============================================================================
-- 5. VERIFICAR QUE O TOKEN FOI MARCADO COMO USADO
-- ============================================================================
SELECT * FROM validate_registration_token('SEU_TOKEN_AQUI');

-- Resultado esperado:
-- valid: false
-- expired: false
-- used: true


-- ============================================================================
-- 6. GERAR MAIS TOKENS COM DIFERENTES DURAÇÕES
-- ============================================================================

-- Token de 1 hora
SELECT * FROM generate_registration_token(1, 'Token urgente - 1 hora');

-- Token de 4 horas  
SELECT * FROM generate_registration_token(4, 'Token estendido - 4 horas');

-- Token de 24 horas (para casos especiais)
SELECT * FROM generate_registration_token(24, 'Token especial - 24 horas');


-- ============================================================================
-- 7. REVOGAR UM TOKEN
-- Gere um novo token e depois revogue-o
-- ============================================================================
-- Primeiro gere:
SELECT * FROM generate_registration_token(2, 'Token para revogar');

-- Depois revogue (substitua o token):
SELECT revoke_registration_token('SEU_TOKEN_AQUI');

-- Verifique que foi revogado:
SELECT * FROM validate_registration_token('SEU_TOKEN_AQUI');
-- expired deve ser true


-- ============================================================================
-- 8. LIMPAR TOKENS EXPIRADOS
-- ============================================================================
SELECT cleanup_expired_tokens();

-- Retorna: número de tokens deletados


-- ============================================================================
-- 9. ESTATÍSTICAS RÁPIDAS
-- ============================================================================

-- Total de tokens por status
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE used) as usados,
  COUNT(*) FILTER (WHERE NOT used AND expires_at > NOW()) as ativos,
  COUNT(*) FILTER (WHERE NOT used AND expires_at < NOW()) as expirados
FROM registration_tokens;


-- Tokens criados hoje
SELECT 
  token,
  created_by_name,
  expires_at,
  used,
  notes
FROM registration_tokens
WHERE created_at::date = CURRENT_DATE
ORDER BY created_at DESC;


-- ============================================================================
-- 10. APAGAR TODOS OS TOKENS DE TESTE (OPCIONAL)
-- CUIDADO: Use apenas em ambiente de teste!
-- ============================================================================
-- DELETE FROM registration_tokens WHERE notes LIKE '%TESTE%';


-- ============================================================================
-- ✅ CHECKLIST DE VALIDAÇÃO
-- ============================================================================
-- [ ] Token foi gerado com sucesso
-- [ ] URL de cadastro foi retornada corretamente  
-- [ ] Token válido retorna valid = true
-- [ ] Token pode ser marcado como usado
-- [ ] Token usado retorna used = true e valid = false
-- [ ] Lista de tokens ativos funciona
-- [ ] Revogação de token funciona
-- [ ] Limpeza de tokens expirados funciona
-- [ ] Estatísticas são calculadas corretamente
-- [ ] Apenas admins conseguem gerar tokens (RLS)

-- ============================================================================
-- 🎯 PRÓXIMO PASSO
-- ============================================================================
-- Agora teste o link completo:
-- 1. Gere um token novo
-- 2. Copie o "registration_url" 
-- 3. Cole no navegador
-- 4. Veja se a página de cadastro carrega e valida o token
-- 5. Preencha o cadastro e envie
-- 6. Verifique se o token foi marcado como usado automaticamente

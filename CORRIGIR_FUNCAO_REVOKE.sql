-- ============================================================================
-- CORRIGIR FUNÇÃO revoke_registration_token
-- ============================================================================
-- Este script corrige a função de revogar tokens para aceitar o token STRING
-- ao invés de UUID do token
-- ============================================================================

-- Remove as versões antigas da função (todas as assinaturas)
DROP FUNCTION IF EXISTS revoke_registration_token(UUID, UUID);
DROP FUNCTION IF EXISTS revoke_registration_token(TEXT);

-- Recria a função correta que aceita p_token TEXT
CREATE OR REPLACE FUNCTION revoke_registration_token(
  p_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token_record RECORD;
BEGIN
  -- Busca o token
  SELECT id, used, expires_at, created_by
  INTO v_token_record
  FROM registration_tokens
  WHERE token = p_token;

  -- Valida se token existe
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Token não encontrado';
  END IF;

  -- Valida se já foi usado
  IF v_token_record.used THEN
    RAISE EXCEPTION 'Token já foi utilizado';
  END IF;

  -- Valida se já expirou
  IF v_token_record.expires_at < NOW() THEN
    RAISE EXCEPTION 'Token já expirou';
  END IF;

  -- Marca como expirado (revogado) alterando a data de expiração para o passado
  UPDATE registration_tokens
  SET expires_at = NOW() - INTERVAL '1 second'
  WHERE token = p_token;

  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao revogar token: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Permissões
GRANT EXECUTE ON FUNCTION revoke_registration_token TO authenticated;

-- Comentário
COMMENT ON FUNCTION revoke_registration_token IS 'Revoga/invalida um token específico através da string do token';

-- ============================================================================
-- TESTE (opcional)
-- ============================================================================
-- SELECT revoke_registration_token('seu_token_aqui');

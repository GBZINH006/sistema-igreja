-- ============================================================================
-- INSTALAÇÃO COMPLETA DO SISTEMA DE TOKENS
-- ============================================================================
-- Execute este script inteiro de uma vez no SQL Editor do Supabase
-- ============================================================================

-- 1. LIMPEZA (remove tudo se já existir)
-- ============================================================================
DROP TABLE IF EXISTS registration_tokens CASCADE;
DROP FUNCTION IF EXISTS generate_registration_token CASCADE;
DROP FUNCTION IF EXISTS validate_registration_token CASCADE;
DROP FUNCTION IF EXISTS mark_token_as_used CASCADE;
DROP FUNCTION IF EXISTS list_active_tokens CASCADE;
DROP FUNCTION IF EXISTS revoke_registration_token CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_tokens CASCADE;

-- 2. CRIAR TABELA
-- ============================================================================
CREATE TABLE registration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  used_by_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  notes TEXT
);

-- 3. CRIAR ÍNDICES
-- ============================================================================
CREATE INDEX idx_registration_tokens_token ON registration_tokens(token);
CREATE INDEX idx_registration_tokens_expires ON registration_tokens(expires_at);
CREATE INDEX idx_registration_tokens_used ON registration_tokens(used);
CREATE INDEX idx_registration_tokens_created_by ON registration_tokens(created_by);

-- 4. HABILITAR RLS
-- ============================================================================
ALTER TABLE registration_tokens ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLÍTICAS
-- ============================================================================
CREATE POLICY "Admins podem ver tokens" ON registration_tokens
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'secretario', 'pastor')
    )
  );

CREATE POLICY "Admins podem criar tokens" ON registration_tokens
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'secretario', 'pastor')
    )
  );

CREATE POLICY "Admins podem atualizar tokens" ON registration_tokens
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'secretario', 'pastor')
    )
  );

-- 6. FUNÇÃO: GERAR TOKEN
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_registration_token(
  p_duration_hours INTEGER DEFAULT 2,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  token TEXT,
  expires_at TIMESTAMPTZ,
  registration_url TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
  v_expires_at TIMESTAMPTZ;
  v_creator_name TEXT;
  v_base_url TEXT := 'https://seu-dominio.vercel.app'; -- ⚠️ ALTERE AQUI
BEGIN
  -- Buscar nome do criador (se estiver autenticado)
  SELECT 
    COALESCE(
      raw_user_meta_data->>'full_name',
      raw_user_meta_data->>'name',
      email,
      'Sistema'
    )
  INTO v_creator_name
  FROM auth.users
  WHERE id = auth.uid();

  -- Se não encontrou usuário, usa 'Sistema'
  v_creator_name := COALESCE(v_creator_name, 'Sistema');

  -- Gerar token único
  v_token := encode(gen_random_bytes(24), 'base64');
  v_token := REPLACE(REPLACE(REPLACE(v_token, '/', '_'), '+', '-'), '=', '');
  
  -- Calcular expiração
  v_expires_at := NOW() + (p_duration_hours || ' hours')::INTERVAL;

  -- Inserir token
  INSERT INTO registration_tokens (
    token, created_by, created_by_name, expires_at, notes
  ) VALUES (
    v_token, auth.uid(), v_creator_name, v_expires_at, p_notes
  );

  -- Retornar
  RETURN QUERY
  SELECT 
    v_token,
    v_expires_at,
    v_base_url || '/pages/cadastro.html?token=' || v_token;
END;
$$;

-- 7. FUNÇÃO: VALIDAR TOKEN
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_registration_token(
  p_token TEXT
)
RETURNS TABLE (
  valid BOOLEAN,
  expired BOOLEAN,
  used BOOLEAN,
  expires_at TIMESTAMPTZ,
  time_remaining_seconds INTEGER,
  created_by_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
BEGIN
  SELECT * INTO v_record
  FROM registration_tokens
  WHERE token = p_token;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, FALSE, FALSE, NULL::TIMESTAMPTZ, 0, NULL::TEXT;
    RETURN;
  END IF;

  IF v_record.used THEN
    RETURN QUERY SELECT FALSE, FALSE, TRUE, v_record.expires_at, 0, v_record.created_by_name;
    RETURN;
  END IF;

  IF v_record.expires_at < NOW() THEN
    RETURN QUERY SELECT FALSE, TRUE, FALSE, v_record.expires_at, 0, v_record.created_by_name;
    RETURN;
  END IF;

  RETURN QUERY SELECT 
    TRUE, 
    FALSE, 
    FALSE, 
    v_record.expires_at,
    EXTRACT(EPOCH FROM (v_record.expires_at - NOW()))::INTEGER,
    v_record.created_by_name;
END;
$$;

-- 8. FUNÇÃO: MARCAR COMO USADO
-- ============================================================================
CREATE OR REPLACE FUNCTION mark_token_as_used(
  p_token TEXT,
  p_email TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated BOOLEAN;
BEGIN
  UPDATE registration_tokens
  SET used = TRUE, used_at = NOW(), used_by_email = p_email
  WHERE token = p_token AND NOT used AND expires_at > NOW()
  RETURNING TRUE INTO v_updated;

  RETURN COALESCE(v_updated, FALSE);
END;
$$;

-- 9. FUNÇÃO: LISTAR TOKENS ATIVOS
-- ============================================================================
CREATE OR REPLACE FUNCTION list_active_tokens()
RETURNS TABLE (
  token TEXT,
  created_by_name TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  time_remaining TEXT,
  used BOOLEAN,
  used_at TIMESTAMPTZ,
  used_by_email TEXT,
  notes TEXT,
  registration_url TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_base_url TEXT := 'https://seu-dominio.vercel.app'; -- ⚠️ ALTERE AQUI
BEGIN
  RETURN QUERY
  SELECT 
    rt.token,
    rt.created_by_name,
    rt.created_at,
    rt.expires_at,
    CASE 
      WHEN rt.expires_at < NOW() THEN 'Expirado'
      WHEN rt.used THEN 'Usado'
      ELSE TO_CHAR(EXTRACT(EPOCH FROM (rt.expires_at - NOW())) / 60, 'FM999') || ' minutos'
    END,
    rt.used,
    rt.used_at,
    rt.used_by_email,
    rt.notes,
    v_base_url || '/pages/cadastro.html?token=' || rt.token
  FROM registration_tokens rt
  WHERE rt.created_at > NOW() - INTERVAL '7 days'
  ORDER BY rt.created_at DESC;
END;
$$;

-- 10. FUNÇÃO: REVOGAR TOKEN
-- ============================================================================
CREATE OR REPLACE FUNCTION revoke_registration_token(
  p_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_revoked BOOLEAN;
BEGIN
  UPDATE registration_tokens
  SET expires_at = NOW() - INTERVAL '1 second'
  WHERE token = p_token AND NOT used
  RETURNING TRUE INTO v_revoked;

  RETURN COALESCE(v_revoked, FALSE);
END;
$$;

-- 11. FUNÇÃO: LIMPAR TOKENS EXPIRADOS
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM registration_tokens
  WHERE NOT used AND expires_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- 12. COMENTÁRIOS
-- ============================================================================
COMMENT ON TABLE registration_tokens IS 'Tokens temporários para cadastro';
COMMENT ON FUNCTION generate_registration_token IS 'Gera token de cadastro';
COMMENT ON FUNCTION validate_registration_token IS 'Valida token';
COMMENT ON FUNCTION mark_token_as_used IS 'Marca token como usado';
COMMENT ON FUNCTION list_active_tokens IS 'Lista tokens ativos';
COMMENT ON FUNCTION revoke_registration_token IS 'Revoga token';
COMMENT ON FUNCTION cleanup_expired_tokens IS 'Limpa tokens expirados';

-- ============================================================================
-- TESTE RÁPIDO
-- ============================================================================
-- Descomente e execute para testar:
-- SELECT * FROM generate_registration_token(2, 'Token de teste');

-- ============================================================================
-- ⚠️ IMPORTANTE: Altere a URL base em duas funções acima (linhas marcadas)
-- ============================================================================

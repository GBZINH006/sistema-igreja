-- ============================================================================
-- SISTEMA DE TOKENS - VERSÃO SIMPLIFICADA SEM VERIFICAÇÃO DE PERMISSÃO
-- ============================================================================
-- Execute este script completo no SQL Editor do Supabase
-- Não precisa estar logado como admin para testar
-- ============================================================================

-- 1. LIMPEZA
DROP TABLE IF EXISTS registration_tokens CASCADE;
DROP FUNCTION IF EXISTS generate_registration_token CASCADE;
DROP FUNCTION IF EXISTS validate_registration_token CASCADE;
DROP FUNCTION IF EXISTS mark_token_as_used CASCADE;
DROP FUNCTION IF EXISTS list_active_tokens CASCADE;
DROP FUNCTION IF EXISTS revoke_registration_token CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_tokens CASCADE;

-- 2. CRIAR TABELA
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
  notes TEXT
);

-- 3. CRIAR ÍNDICES
CREATE INDEX idx_registration_tokens_token ON registration_tokens(token);
CREATE INDEX idx_registration_tokens_expires ON registration_tokens(expires_at);
CREATE INDEX idx_registration_tokens_used ON registration_tokens(used);

-- 4. HABILITAR RLS
ALTER TABLE registration_tokens ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS (permissivas para teste)
CREATE POLICY "Qualquer um pode ver tokens" ON registration_tokens FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode criar tokens" ON registration_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar tokens" ON registration_tokens FOR UPDATE USING (true);

-- 6. FUNÇÃO: GERAR TOKEN
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
  v_base_url TEXT := 'https://sistema-igreja-git-main-gbzinh006s-projects.vercel.app'; -- Domínio do projeto
BEGIN
  -- Buscar nome do criador (se autenticado)
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
  RETURN QUERY SELECT v_token, v_expires_at, v_base_url || '/pages/cadastro.html?token=' || v_token;
END;
$$;

-- 7. FUNÇÃO: VALIDAR TOKEN
CREATE OR REPLACE FUNCTION validate_registration_token(p_token TEXT)
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
  SELECT * INTO v_record FROM registration_tokens WHERE token = p_token;

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
    TRUE, FALSE, FALSE, v_record.expires_at,
    EXTRACT(EPOCH FROM (v_record.expires_at - NOW()))::INTEGER,
    v_record.created_by_name;
END;
$$;

-- 8. FUNÇÃO: MARCAR COMO USADO
CREATE OR REPLACE FUNCTION mark_token_as_used(p_token TEXT, p_email TEXT DEFAULT NULL)
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

-- 9. FUNÇÃO: LISTAR TOKENS
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
  v_base_url TEXT := 'https://sistema-igreja-git-main-gbzinh006s-projects.vercel.app'; -- Domínio do projeto
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
      ELSE TO_CHAR(EXTRACT(EPOCH FROM (rt.expires_at - NOW())) / 60, 'FM999') || ' min'
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
CREATE OR REPLACE FUNCTION revoke_registration_token(p_token TEXT)
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

-- 11. FUNÇÃO: LIMPAR EXPIRADOS
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

-- ============================================================================
-- ✅ TESTE IMEDIATO
-- ============================================================================
-- Execute esta linha para testar:
SELECT * FROM generate_registration_token(2, 'Teste do sistema');

-- ⚠️ IMPORTANTE:
-- Altere as URLs base (linhas marcadas com ⚠️) para seu domínio Vercel
-- Exemplo: 'https://igreja-bela-vista.vercel.app'
-- ============================================================================

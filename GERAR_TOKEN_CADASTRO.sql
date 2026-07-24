-- ============================================================================
-- SISTEMA DE TOKENS DE CADASTRO TEMPORÁRIOS
-- ============================================================================
-- Este script cria a infraestrutura para gerar links temporários e seguros
-- para cadastro de novos membros. Os tokens expiram em 2 horas e são de uso único.
-- ============================================================================

-- 1. Remover tabela antiga se existir (para evitar conflitos)
DROP TABLE IF EXISTS registration_tokens CASCADE;

-- 2. Criar tabela de tokens de cadastro
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

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_registration_tokens_token ON registration_tokens(token);
CREATE INDEX IF NOT EXISTS idx_registration_tokens_expires ON registration_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_registration_tokens_used ON registration_tokens(used);
CREATE INDEX IF NOT EXISTS idx_registration_tokens_created_by ON registration_tokens(created_by);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE registration_tokens ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Admins podem ver tokens" ON registration_tokens;
DROP POLICY IF EXISTS "Admins podem criar tokens" ON registration_tokens;
DROP POLICY IF EXISTS "Admins podem atualizar tokens" ON registration_tokens;

-- 6. Políticas de acesso
-- Admins podem ver todos os tokens
CREATE POLICY "Admins podem ver tokens" ON registration_tokens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'secretario', 'pastor')
    )
  );

-- Admins podem criar tokens
CREATE POLICY "Admins podem criar tokens" ON registration_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'secretario', 'pastor')
    )
  );

-- Admins podem invalidar tokens
CREATE POLICY "Admins podem atualizar tokens" ON registration_tokens
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'secretario', 'pastor')
    )
  );

-- ============================================================================
-- FUNÇÃO: Gerar novo token de cadastro
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
  v_base_url TEXT := 'https://seu-dominio.vercel.app'; -- ALTERE PARA SEU DOMÍNIO
BEGIN
  -- Verificar permissões
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'secretario', 'pastor')
  ) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem gerar tokens de cadastro.';
  END IF;

  -- Buscar nome do criador
  SELECT 
    COALESCE(
      raw_user_meta_data->>'full_name',
      raw_user_meta_data->>'name',
      email
    )
  INTO v_creator_name
  FROM auth.users
  WHERE id = auth.uid();

  -- Gerar token único e seguro (32 caracteres)
  v_token := encode(gen_random_bytes(24), 'base64');
  v_token := REPLACE(REPLACE(REPLACE(v_token, '/', '_'), '+', '-'), '=', '');
  
  -- Calcular expiração
  v_expires_at := NOW() + (p_duration_hours || ' hours')::INTERVAL;

  -- Inserir token no banco
  INSERT INTO registration_tokens (
    token,
    created_by,
    created_by_name,
    expires_at,
    notes
  ) VALUES (
    v_token,
    auth.uid(),
    v_creator_name,
    v_expires_at,
    p_notes
  );

  -- Retornar informações do token
  RETURN QUERY
  SELECT 
    v_token,
    v_expires_at,
    v_base_url || '/pages/cadastro.html?token=' || v_token AS registration_url;
END;
$$;

-- ============================================================================
-- FUNÇÃO: Validar token de cadastro
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
  v_token_record RECORD;
BEGIN
  -- Buscar token
  SELECT *
  INTO v_token_record
  FROM registration_tokens
  WHERE token = p_token;

  -- Token não encontrado
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT FALSE, FALSE, FALSE, NULL::TIMESTAMPTZ, 0, NULL::TEXT;
    RETURN;
  END IF;

  -- Token já usado
  IF v_token_record.used THEN
    RETURN QUERY
    SELECT 
      FALSE,
      FALSE,
      TRUE,
      v_token_record.expires_at,
      0,
      v_token_record.created_by_name;
    RETURN;
  END IF;

  -- Token expirado
  IF v_token_record.expires_at < NOW() THEN
    RETURN QUERY
    SELECT 
      FALSE,
      TRUE,
      FALSE,
      v_token_record.expires_at,
      0,
      v_token_record.created_by_name;
    RETURN;
  END IF;

  -- Token válido
  RETURN QUERY
  SELECT 
    TRUE,
    FALSE,
    FALSE,
    v_token_record.expires_at,
    EXTRACT(EPOCH FROM (v_token_record.expires_at - NOW()))::INTEGER,
    v_token_record.created_by_name;
END;
$$;

-- ============================================================================
-- FUNÇÃO: Marcar token como usado
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
  SET 
    used = TRUE,
    used_at = NOW(),
    used_by_email = p_email
  WHERE token = p_token
    AND NOT used
    AND expires_at > NOW()
  RETURNING TRUE INTO v_updated;

  RETURN COALESCE(v_updated, FALSE);
END;
$$;

-- ============================================================================
-- FUNÇÃO: Listar tokens ativos
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
  v_base_url TEXT := 'https://seu-dominio.vercel.app'; -- ALTERE PARA SEU DOMÍNIO
BEGIN
  -- Verificar permissões
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'secretario', 'pastor')
  ) THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

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
    END AS time_remaining,
    rt.used,
    rt.used_at,
    rt.used_by_email,
    rt.notes,
    v_base_url || '/pages/cadastro.html?token=' || rt.token AS registration_url
  FROM registration_tokens rt
  WHERE rt.created_at > NOW() - INTERVAL '7 days' -- Últimos 7 dias
  ORDER BY rt.created_at DESC;
END;
$$;

-- ============================================================================
-- FUNÇÃO: Revogar token
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
  -- Verificar permissões
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'secretario', 'pastor')
  ) THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  -- Marcar como expirado (definir expires_at para o passado)
  UPDATE registration_tokens
  SET expires_at = NOW() - INTERVAL '1 second'
  WHERE token = p_token
    AND NOT used
  RETURNING TRUE INTO v_revoked;

  RETURN COALESCE(v_revoked, FALSE);
END;
$$;

-- ============================================================================
-- JOB: Limpar tokens expirados (executar diariamente)
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Deletar tokens não usados e expirados há mais de 30 dias
  DELETE FROM registration_tokens
  WHERE NOT used
    AND expires_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- ============================================================================
-- EXEMPLOS DE USO
-- ============================================================================

-- 1. GERAR UM TOKEN (padrão: 2 horas)
-- SELECT * FROM generate_registration_token();

-- 2. GERAR TOKEN COM DURAÇÃO CUSTOMIZADA E NOTA
-- SELECT * FROM generate_registration_token(4, 'Token para João Silva - Novo membro');

-- 3. VALIDAR UM TOKEN
-- SELECT * FROM validate_registration_token('SEU_TOKEN_AQUI');

-- 4. LISTAR TOKENS ATIVOS
-- SELECT * FROM list_active_tokens();

-- 5. REVOGAR UM TOKEN
-- SELECT revoke_registration_token('SEU_TOKEN_AQUI');

-- 6. LIMPAR TOKENS EXPIRADOS
-- SELECT cleanup_expired_tokens();

-- ============================================================================
-- IMPORTANTE: CONFIGURAÇÃO FINAL
-- ============================================================================
-- 1. Altere 'seu-dominio.vercel.app' nas funções para seu domínio real
-- 2. Configure um cron job para executar cleanup_expired_tokens() diariamente
-- 3. Teste a geração de token antes de ir para produção

COMMENT ON TABLE registration_tokens IS 'Armazena tokens temporários para cadastro de novos membros';
COMMENT ON FUNCTION generate_registration_token IS 'Gera um novo token de cadastro válido por X horas';
COMMENT ON FUNCTION validate_registration_token IS 'Valida se um token é válido, expirado ou usado';
COMMENT ON FUNCTION mark_token_as_used IS 'Marca um token como usado após cadastro bem-sucedido';
COMMENT ON FUNCTION list_active_tokens IS 'Lista todos os tokens recentes para administração';
COMMENT ON FUNCTION revoke_registration_token IS 'Revoga/invalida um token específico';
COMMENT ON FUNCTION cleanup_expired_tokens IS 'Remove tokens expirados antigos do banco de dados';

-- =====================================
-- PARTE 1: DROPS (Limpar versões antigas)
-- =====================================

-- Drop políticas antigas
DROP POLICY IF EXISTS "Admins podem ver todos os logs" ON access_logs;
DROP POLICY IF EXISTS "Sistema pode gerenciar rate limits" ON rate_limit_tracker;

-- Drop funções antigas
DROP FUNCTION IF EXISTS member_validate_session(TEXT);
DROP FUNCTION IF EXISTS admin_check_permissions(UUID, TEXT[]);
DROP FUNCTION IF EXISTS log_access_attempt(TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS check_rate_limit(TEXT, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS cleanup_old_access_logs();
DROP FUNCTION IF EXISTS cleanup_old_rate_limits();

-- =====================================
-- PARTE 2: TABELAS
-- =====================================

-- Tabela de logs de acesso
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_type TEXT NOT NULL,
  user_id UUID,
  email TEXT,
  ip_address INET,
  user_agent TEXT,
  page_accessed TEXT,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_email ON access_logs(email);
CREATE INDEX IF NOT EXISTS idx_access_logs_event_type ON access_logs(event_type);

-- Tabela de rate limiting
CREATE TABLE IF NOT EXISTS rate_limit_tracker (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  action_type TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adiciona constraint UNIQUE se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'rate_limit_tracker_identifier_action_type_window_start_key'
  ) THEN
    ALTER TABLE rate_limit_tracker 
    ADD CONSTRAINT rate_limit_tracker_identifier_action_type_window_start_key 
    UNIQUE(identifier, action_type, window_start);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier ON rate_limit_tracker(identifier, action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON rate_limit_tracker(window_start);

-- =====================================
-- PARTE 3: FUNÇÕES
-- =====================================

-- Validação de sessão de membro
CREATE OR REPLACE FUNCTION member_validate_session(p_session_token TEXT)
RETURNS TABLE(
  valid BOOLEAN,
  account_id UUID,
  email TEXT,
  full_name TEXT,
  expired BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account RECORD;
BEGIN
  SELECT 
    id,
    email,
    first_name || ' ' || last_name AS full_name,
    session_token,
    session_created_at,
    EXTRACT(EPOCH FROM (NOW() - session_created_at)) / 3600 AS hours_since_session
  INTO v_account
  FROM member_accounts
  WHERE session_token = p_session_token
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT, TRUE;
    RETURN;
  END IF;

  IF v_account.hours_since_session > 24 THEN
    UPDATE member_accounts
    SET session_token = NULL, session_created_at = NULL
    WHERE id = v_account.id;
    RETURN QUERY SELECT FALSE, v_account.id, v_account.email, v_account.full_name, TRUE;
    RETURN;
  END IF;

  UPDATE member_accounts SET updated_at = NOW() WHERE id = v_account.id;
  RETURN QUERY SELECT TRUE, v_account.id, v_account.email, v_account.full_name, FALSE;
END;
$$;

-- Verificação de permissões admin
CREATE OR REPLACE FUNCTION admin_check_permissions(
  p_user_id UUID,
  p_required_roles TEXT[]
)
RETURNS TABLE(
  has_permission BOOLEAN,
  user_role TEXT,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT role INTO v_profile FROM profiles WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, 'Perfil não encontrado'::TEXT;
    RETURN;
  END IF;

  IF v_profile.role = ANY(p_required_roles) THEN
    RETURN QUERY SELECT TRUE, v_profile.role, 'Permissão concedida'::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, v_profile.role, 'Permissão insuficiente'::TEXT;
  END IF;
END;
$$;

-- Log de acessos
CREATE OR REPLACE FUNCTION log_access_attempt(
  p_event_type TEXT,
  p_user_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_page_accessed TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO access_logs (
    event_type, user_type, user_id, email, ip_address,
    user_agent, page_accessed, reason, metadata
  ) VALUES (
    p_event_type, p_user_type, p_user_id, p_email, p_ip_address::INET,
    p_user_agent, p_page_accessed, p_reason, p_metadata
  )
  RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$;

-- Rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_action_type TEXT,
  p_max_requests INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS TABLE(
  allowed BOOLEAN,
  requests_remaining INTEGER,
  reset_at TIMESTAMPTZ,
  blocked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tracker RECORD;
  v_window_start TIMESTAMPTZ;
  v_requests_count INTEGER;
BEGIN
  v_window_start := DATE_TRUNC('minute', NOW()) - (EXTRACT(MINUTE FROM NOW())::INTEGER % p_window_minutes || ' minutes')::INTERVAL;

  SELECT * INTO v_tracker FROM rate_limit_tracker
  WHERE identifier = p_identifier AND action_type = p_action_type AND window_start = v_window_start
  FOR UPDATE;

  IF FOUND AND v_tracker.blocked_until IS NOT NULL AND NOW() < v_tracker.blocked_until THEN
    RETURN QUERY SELECT FALSE, 0, v_tracker.blocked_until, TRUE;
    RETURN;
  END IF;

  IF FOUND THEN
    UPDATE rate_limit_tracker SET request_count = request_count + 1, updated_at = NOW()
    WHERE id = v_tracker.id RETURNING request_count INTO v_requests_count;
  ELSE
    INSERT INTO rate_limit_tracker (identifier, action_type, request_count, window_start)
    VALUES (p_identifier, p_action_type, 1, v_window_start)
    RETURNING request_count INTO v_requests_count;
  END IF;

  IF v_requests_count > p_max_requests THEN
    UPDATE rate_limit_tracker SET blocked_until = NOW() + (p_window_minutes || ' minutes')::INTERVAL
    WHERE identifier = p_identifier AND action_type = p_action_type AND window_start = v_window_start;
    RETURN QUERY SELECT FALSE, 0, NOW() + (p_window_minutes || ' minutes')::INTERVAL, TRUE;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, p_max_requests - v_requests_count,
    v_window_start + (p_window_minutes || ' minutes')::INTERVAL, FALSE;
END;
$$;

-- Limpeza de logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_access_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM access_logs WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- Limpeza de rate limits
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM rate_limit_tracker WHERE window_start < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- =====================================
-- PARTE 4: PERMISSÕES E POLÍTICAS
-- =====================================

GRANT EXECUTE ON FUNCTION member_validate_session TO authenticated, anon;
GRANT EXECUTE ON FUNCTION admin_check_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION log_access_attempt TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_old_access_logs TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_rate_limits TO authenticated;

ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver todos os logs" ON access_logs FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'pastor', 'secretario')));

CREATE POLICY "Sistema pode gerenciar rate limits" ON rate_limit_tracker FOR ALL USING (TRUE);

-- =====================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================

DO $$
BEGIN
  RAISE NOTICE '✅ Funções de segurança criadas com sucesso!';
END $$;

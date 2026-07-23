-- =====================================
-- SQL COMPLETO - EXECUTE ESTE ARQUIVO
-- =====================================
-- Este arquivo contém TUDO em um só lugar
-- Execute apenas este arquivo no Supabase SQL Editor
-- =====================================

-- =====================================
-- PARTE 1: LIMPEZA (DROP)
-- =====================================

-- Drop funções de segurança
DROP FUNCTION IF EXISTS member_validate_session(TEXT);
DROP FUNCTION IF EXISTS admin_check_permissions(UUID, TEXT[]);
DROP FUNCTION IF EXISTS log_access_attempt(TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS check_rate_limit(TEXT, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS cleanup_old_access_logs();
DROP FUNCTION IF EXISTS cleanup_old_rate_limits();

-- Drop funções de tokens
DROP FUNCTION IF EXISTS generate_registration_token(UUID, TEXT, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS validate_registration_token(TEXT);
DROP FUNCTION IF EXISTS mark_token_as_used(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS list_registration_tokens(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS revoke_registration_token(UUID, UUID);
DROP FUNCTION IF EXISTS cleanup_expired_tokens();

-- Drop funções admin
DROP FUNCTION IF EXISTS admin_list_auth_users();
DROP FUNCTION IF EXISTS admin_upsert_user_role(TEXT, TEXT);
DROP FUNCTION IF EXISTS admin_remove_user(UUID);

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

-- Tabela de tokens de cadastro temporário
CREATE TABLE IF NOT EXISTS registration_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_by_email TEXT NOT NULL,
  created_by_role TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by_email TEXT,
  member_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  recipient_info JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registration_tokens_token ON registration_tokens(token);
CREATE INDEX IF NOT EXISTS idx_registration_tokens_expires ON registration_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_registration_tokens_created_by ON registration_tokens(created_by);
CREATE INDEX IF NOT EXISTS idx_registration_tokens_active ON registration_tokens(is_active, expires_at);

-- =====================================
-- PARTE 3: FUNÇÕES DE SEGURANÇA
-- =====================================

-- Validação de sessão de membro
CREATE OR REPLACE FUNCTION member_validate_session(p_session_token TEXT)
RETURNS TABLE(valid BOOLEAN, account_id UUID, email TEXT, full_name TEXT, expired BOOLEAN) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_account RECORD;
BEGIN
  SELECT id, email, first_name || ' ' || last_name AS full_name, session_token, session_created_at,
    EXTRACT(EPOCH FROM (NOW() - session_created_at)) / 3600 AS hours_since_session
  INTO v_account FROM member_accounts
  WHERE session_token = p_session_token AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT, TRUE;
    RETURN;
  END IF;

  IF v_account.hours_since_session > 24 THEN
    UPDATE member_accounts SET session_token = NULL, session_created_at = NULL WHERE id = v_account.id;
    RETURN QUERY SELECT FALSE, v_account.id, v_account.email, v_account.full_name, TRUE;
    RETURN;
  END IF;

  UPDATE member_accounts SET updated_at = NOW() WHERE id = v_account.id;
  RETURN QUERY SELECT TRUE, v_account.id, v_account.email, v_account.full_name, FALSE;
END;
$$;

-- Verificação de permissões admin
CREATE OR REPLACE FUNCTION admin_check_permissions(p_user_id UUID, p_required_roles TEXT[])
RETURNS TABLE(has_permission BOOLEAN, user_role TEXT, reason TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_profile RECORD;
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
  p_event_type TEXT, p_user_type TEXT, p_user_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL, p_ip_address TEXT DEFAULT NULL, p_user_agent TEXT DEFAULT NULL,
  p_page_accessed TEXT DEFAULT NULL, p_reason TEXT DEFAULT NULL, p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_log_id UUID;
BEGIN
  INSERT INTO access_logs (event_type, user_type, user_id, email, ip_address, user_agent, page_accessed, reason, metadata)
  VALUES (p_event_type, p_user_type, p_user_id, p_email, p_ip_address::INET, p_user_agent, p_page_accessed, p_reason, p_metadata)
  RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$;

-- Rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT, p_action_type TEXT, p_max_requests INTEGER DEFAULT 10, p_window_minutes INTEGER DEFAULT 15
)
RETURNS TABLE(allowed BOOLEAN, requests_remaining INTEGER, reset_at TIMESTAMPTZ, blocked BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_tracker RECORD;
  v_window_start TIMESTAMPTZ;
  v_requests_count INTEGER;
BEGIN
  v_window_start := DATE_TRUNC('minute', NOW()) - (EXTRACT(MINUTE FROM NOW())::INTEGER % p_window_minutes || ' minutes')::INTERVAL;
  SELECT * INTO v_tracker FROM rate_limit_tracker
  WHERE identifier = p_identifier AND action_type = p_action_type AND window_start = v_window_start FOR UPDATE;

  IF FOUND AND v_tracker.blocked_until IS NOT NULL AND NOW() < v_tracker.blocked_until THEN
    RETURN QUERY SELECT FALSE, 0, v_tracker.blocked_until, TRUE;
    RETURN;
  END IF;

  IF FOUND THEN
    UPDATE rate_limit_tracker SET request_count = request_count + 1, updated_at = NOW()
    WHERE id = v_tracker.id RETURNING request_count INTO v_requests_count;
  ELSE
    INSERT INTO rate_limit_tracker (identifier, action_type, request_count, window_start)
    VALUES (p_identifier, p_action_type, 1, v_window_start) RETURNING request_count INTO v_requests_count;
  END IF;

  IF v_requests_count > p_max_requests THEN
    UPDATE rate_limit_tracker SET blocked_until = NOW() + (p_window_minutes || ' minutes')::INTERVAL
    WHERE identifier = p_identifier AND action_type = p_action_type AND window_start = v_window_start;
    RETURN QUERY SELECT FALSE, 0, NOW() + (p_window_minutes || ' minutes')::INTERVAL, TRUE;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, p_max_requests - v_requests_count, v_window_start + (p_window_minutes || ' minutes')::INTERVAL, FALSE;
END;
$$;

-- Limpeza de logs
CREATE OR REPLACE FUNCTION cleanup_old_access_logs()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_deleted_count INTEGER;
BEGIN
  DELETE FROM access_logs WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- Limpeza de rate limits
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_deleted_count INTEGER;
BEGIN
  DELETE FROM rate_limit_tracker WHERE window_start < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- =====================================
-- PARTE 4: FUNÇÕES DE TOKENS
-- =====================================

-- Gerar token
CREATE OR REPLACE FUNCTION generate_registration_token(
  p_user_id UUID, p_notes TEXT DEFAULT NULL, p_recipient_name TEXT DEFAULT NULL,
  p_recipient_contact TEXT DEFAULT NULL, p_duration_hours INTEGER DEFAULT 2
)
RETURNS TABLE(token TEXT, expires_at TIMESTAMPTZ, registration_url TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_profile RECORD;
  v_token TEXT;
  v_expires TIMESTAMPTZ;
  v_base_url TEXT;
BEGIN
  SELECT p.role, u.email INTO v_profile FROM profiles p JOIN auth.users u ON u.id = p.id WHERE p.id = p_user_id;
  IF NOT FOUND OR v_profile.role NOT IN ('admin', 'pastor', 'secretario') THEN
    RAISE EXCEPTION 'Usuário não tem permissão para gerar links de cadastro';
  END IF;

  v_token := encode(gen_random_bytes(48), 'base64');
  v_token := regexp_replace(v_token, '[^a-zA-Z0-9]', '', 'g');
  v_token := substring(v_token, 1, 64);
  v_expires := NOW() + (p_duration_hours || ' hours')::INTERVAL;

  INSERT INTO registration_tokens (token, created_by, created_by_email, created_by_role, expires_at, notes, recipient_info)
  VALUES (v_token, p_user_id, v_profile.email, v_profile.role, v_expires, p_notes,
    jsonb_build_object('name', p_recipient_name, 'contact', p_recipient_contact));

  v_base_url := 'https://project-8i1w1.vercel.app/pages';
  RETURN QUERY SELECT v_token, v_expires, v_base_url || '/cadastro.html?token=' || v_token AS registration_url;
END;
$$;

-- Validar token
CREATE OR REPLACE FUNCTION validate_registration_token(p_token TEXT)
RETURNS TABLE(
  valid BOOLEAN, expired BOOLEAN, used BOOLEAN, expires_at TIMESTAMPTZ,
  time_remaining_seconds INTEGER, created_by_email TEXT, notes TEXT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_token RECORD;
BEGIN
  SELECT * INTO v_token FROM registration_tokens WHERE token = p_token;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, FALSE, FALSE, NULL::TIMESTAMPTZ, 0, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  IF v_token.used_at IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, FALSE, TRUE, v_token.expires_at, 0, v_token.created_by_email, v_token.notes;
    RETURN;
  END IF;

  IF NOW() > v_token.expires_at THEN
    UPDATE registration_tokens SET is_active = FALSE WHERE id = v_token.id;
    RETURN QUERY SELECT FALSE, TRUE, FALSE, v_token.expires_at, 0, v_token.created_by_email, v_token.notes;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, FALSE, FALSE, v_token.expires_at,
    EXTRACT(EPOCH FROM (v_token.expires_at - NOW()))::INTEGER, v_token.created_by_email, v_token.notes;
END;
$$;

-- Marcar como usado
CREATE OR REPLACE FUNCTION mark_token_as_used(p_token TEXT, p_member_id UUID, p_email TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_row_count INTEGER;
BEGIN
  UPDATE registration_tokens
  SET used_at = NOW(), used_by_email = p_email, member_id = p_member_id, is_active = FALSE, updated_at = NOW()
  WHERE token = p_token AND used_at IS NULL AND NOW() < expires_at;
  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  RETURN v_row_count > 0;
END;
$$;

-- Listar tokens
CREATE OR REPLACE FUNCTION list_registration_tokens(p_user_id UUID, p_show_all BOOLEAN DEFAULT FALSE)
RETURNS TABLE(
  id UUID, token TEXT, created_by_email TEXT, created_by_role TEXT, expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ, used_by_email TEXT, is_active BOOLEAN, is_expired BOOLEAN,
  time_remaining_seconds INTEGER, notes TEXT, recipient_name TEXT, recipient_contact TEXT, created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_profile RECORD;
BEGIN
  SELECT role INTO v_profile FROM profiles WHERE profiles.id = p_user_id;
  IF NOT FOUND OR v_profile.role NOT IN ('admin', 'pastor', 'secretario') THEN
    RAISE EXCEPTION 'Sem permissão para listar tokens';
  END IF;

  RETURN QUERY
  SELECT rt.id, rt.token, rt.created_by_email, rt.created_by_role, rt.expires_at, rt.used_at, rt.used_by_email,
    rt.is_active, (NOW() > rt.expires_at) AS is_expired,
    CASE WHEN NOW() < rt.expires_at THEN EXTRACT(EPOCH FROM (rt.expires_at - NOW()))::INTEGER ELSE 0 END,
    rt.notes, rt.recipient_info->>'name', rt.recipient_info->>'contact', rt.created_at
  FROM registration_tokens rt
  WHERE (p_show_all = TRUE OR rt.created_by = p_user_id)
    AND (p_show_all = TRUE OR rt.created_at > NOW() - INTERVAL '7 days')
  ORDER BY rt.created_at DESC;
END;
$$;

-- Revogar token
CREATE OR REPLACE FUNCTION revoke_registration_token(p_user_id UUID, p_token_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_profile RECORD;
  v_row_count INTEGER;
BEGIN
  SELECT role INTO v_profile FROM profiles WHERE profiles.id = p_user_id;
  IF NOT FOUND OR v_profile.role NOT IN ('admin', 'pastor', 'secretario') THEN
    RAISE EXCEPTION 'Sem permissão para revogar tokens';
  END IF;

  UPDATE registration_tokens SET is_active = FALSE, updated_at = NOW()
  WHERE id = p_token_id AND (v_profile.role = 'admin' OR created_by = p_user_id);
  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  RETURN v_row_count > 0;
END;
$$;

-- Limpeza de tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE registration_tokens SET is_active = FALSE
  WHERE is_active = TRUE AND expires_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  DELETE FROM registration_tokens WHERE expires_at < NOW() - INTERVAL '30 days';
  RETURN v_count;
END;
$$;

-- =====================================
-- PARTE 5: FUNÇÕES ADMIN
-- =====================================

-- Listar usuários
CREATE OR REPLACE FUNCTION admin_list_auth_users()
RETURNS TABLE(id UUID, email TEXT, role TEXT, created_at TIMESTAMPTZ, last_sign_in_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'pastor', 'secretario')) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem listar usuários';
  END IF;

  RETURN QUERY
  SELECT au.id, au.email, COALESCE(p.role, 'sem perfil') AS role, au.created_at, au.last_sign_in_at
  FROM auth.users au LEFT JOIN profiles p ON p.id = au.id
  WHERE au.deleted_at IS NULL ORDER BY au.created_at DESC;
END;
$$;

-- Atribuir perfil
CREATE OR REPLACE FUNCTION admin_upsert_user_role(p_email TEXT, p_role TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID;
  v_current_user_role TEXT;
BEGIN
  SELECT role INTO v_current_user_role FROM profiles WHERE id = auth.uid();
  IF v_current_user_role NOT IN ('admin', 'pastor') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem gerenciar usuários';
  END IF;

  IF p_role NOT IN ('admin', 'pastor', 'secretario') THEN
    RAISE EXCEPTION 'Perfil inválido: use admin, pastor ou secretario';
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email AND deleted_at IS NULL;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', p_email;
  END IF;

  INSERT INTO profiles (id, role, updated_at) VALUES (v_user_id, p_role, NOW())
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, updated_at = NOW();

  PERFORM log_access_attempt('user_role_updated', 'admin', auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()), NULL, NULL, 'admin_upsert_user_role',
    format('Atribuiu perfil %s para %s', p_role, p_email),
    jsonb_build_object('target_user_id', v_user_id, 'target_email', p_email, 'assigned_role', p_role));

  RETURN jsonb_build_object('success', true, 'user_id', v_user_id, 'email', p_email, 'role', p_role);
END;
$$;

-- Remover usuário
CREATE OR REPLACE FUNCTION admin_remove_user(p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_current_user_role TEXT;
  v_target_email TEXT;
BEGIN
  SELECT role INTO v_current_user_role FROM profiles WHERE id = auth.uid();
  IF v_current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem remover usuários';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode remover sua própria conta';
  END IF;

  SELECT email INTO v_target_email FROM auth.users WHERE id = p_user_id;
  IF v_target_email IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  DELETE FROM profiles WHERE id = p_user_id;

  PERFORM log_access_attempt('user_removed', 'admin', auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()), NULL, NULL, 'admin_remove_user',
    format('Removeu usuário %s', v_target_email),
    jsonb_build_object('target_user_id', p_user_id, 'target_email', v_target_email));

  RETURN jsonb_build_object('success', true, 'message', 'Usuário removido com sucesso');
END;
$$;

-- =====================================
-- PARTE 6: PERMISSÕES
-- =====================================

GRANT EXECUTE ON FUNCTION member_validate_session TO authenticated, anon;
GRANT EXECUTE ON FUNCTION admin_check_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION log_access_attempt TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_old_access_logs TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_rate_limits TO authenticated;
GRANT EXECUTE ON FUNCTION generate_registration_token TO authenticated;
GRANT EXECUTE ON FUNCTION validate_registration_token TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mark_token_as_used TO anon, authenticated;
GRANT EXECUTE ON FUNCTION list_registration_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_registration_token TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION admin_list_auth_users TO authenticated;
GRANT EXECUTE ON FUNCTION admin_upsert_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION admin_remove_user TO authenticated;

-- =====================================
-- PARTE 7: POLÍTICAS RLS
-- =====================================

-- Habilita RLS
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_tokens ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "Admins podem ver todos os logs" ON access_logs;
DROP POLICY IF EXISTS "Sistema pode gerenciar rate limits" ON rate_limit_tracker;
DROP POLICY IF EXISTS "Admins podem gerenciar tokens" ON registration_tokens;

-- Cria políticas novas
CREATE POLICY "Admins podem ver todos os logs" ON access_logs FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'pastor', 'secretario')));

CREATE POLICY "Sistema pode gerenciar rate limits" ON rate_limit_tracker FOR ALL USING (TRUE);

CREATE POLICY "Admins podem gerenciar tokens" ON registration_tokens FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'pastor', 'secretario')));

-- =====================================
-- CONCLUSÃO
-- =====================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SUCESSO! Tudo foi criado!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tabelas criadas:';
  RAISE NOTICE '   ✓ access_logs';
  RAISE NOTICE '   ✓ rate_limit_tracker';
  RAISE NOTICE '   ✓ registration_tokens';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Funções criadas (11 funções):';
  RAISE NOTICE '   Segurança:';
  RAISE NOTICE '   ✓ member_validate_session()';
  RAISE NOTICE '   ✓ admin_check_permissions()';
  RAISE NOTICE '   ✓ log_access_attempt()';
  RAISE NOTICE '   ✓ check_rate_limit()';
  RAISE NOTICE '   ✓ cleanup_old_access_logs()';
  RAISE NOTICE '   ✓ cleanup_old_rate_limits()';
  RAISE NOTICE '';
  RAISE NOTICE '   Tokens:';
  RAISE NOTICE '   ✓ generate_registration_token()';
  RAISE NOTICE '   ✓ validate_registration_token()';
  RAISE NOTICE '   ✓ mark_token_as_used()';
  RAISE NOTICE '   ✓ list_registration_tokens()';
  RAISE NOTICE '   ✓ revoke_registration_token()';
  RAISE NOTICE '   ✓ cleanup_expired_tokens()';
  RAISE NOTICE '';
  RAISE NOTICE '   Admin:';
  RAISE NOTICE '   ✓ admin_list_auth_users()';
  RAISE NOTICE '   ✓ admin_upsert_user_role()';
  RAISE NOTICE '   ✓ admin_remove_user()';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Políticas RLS configuradas!';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Agora você pode:';
  RAISE NOTICE '   1. Fazer login no admin.html';
  RAISE NOTICE '   2. Clicar em "Gerar Link"';
  RAISE NOTICE '   3. Copiar e enviar links temporários!';
  RAISE NOTICE '========================================';
END $$;

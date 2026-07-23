-- =====================================
-- PARTE 1: DROPS (Limpar versões antigas)
-- =====================================

-- Drop políticas antigas
DROP POLICY IF EXISTS "Admins podem gerenciar tokens" ON registration_tokens;

-- Drop funções antigas
DROP FUNCTION IF EXISTS generate_registration_token(UUID, TEXT, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS validate_registration_token(TEXT);
DROP FUNCTION IF EXISTS mark_token_as_used(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS list_registration_tokens(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS revoke_registration_token(UUID, UUID);
DROP FUNCTION IF EXISTS cleanup_expired_tokens();

-- =====================================
-- PARTE 2: TABELA
-- =====================================

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
-- PARTE 3: FUNÇÕES
-- =====================================

-- Gerar token
CREATE OR REPLACE FUNCTION generate_registration_token(
  p_user_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_recipient_name TEXT DEFAULT NULL,
  p_recipient_contact TEXT DEFAULT NULL,
  p_duration_hours INTEGER DEFAULT 2
)
RETURNS TABLE(token TEXT, expires_at TIMESTAMPTZ, registration_url TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
  v_token TEXT;
  v_expires TIMESTAMPTZ;
  v_base_url TEXT;
BEGIN
  SELECT p.role, u.email INTO v_profile
  FROM profiles p JOIN auth.users u ON u.id = p.id
  WHERE p.id = p_user_id;

  IF NOT FOUND OR v_profile.role NOT IN ('admin', 'pastor', 'secretario') THEN
    RAISE EXCEPTION 'Usuário não tem permissão para gerar links de cadastro';
  END IF;

  v_token := encode(gen_random_bytes(48), 'base64');
  v_token := regexp_replace(v_token, '[^a-zA-Z0-9]', '', 'g');
  v_token := substring(v_token, 1, 64);
  v_expires := NOW() + (p_duration_hours || ' hours')::INTERVAL;

  INSERT INTO registration_tokens (
    token, created_by, created_by_email, created_by_role, expires_at, notes, recipient_info
  ) VALUES (
    v_token, p_user_id, v_profile.email, v_profile.role, v_expires, p_notes,
    jsonb_build_object('name', p_recipient_name, 'contact', p_recipient_contact)
  );

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
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token RECORD;
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
    EXTRACT(EPOCH FROM (v_token.expires_at - NOW()))::INTEGER,
    v_token.created_by_email, v_token.notes;
END;
$$;

-- Marcar como usado
CREATE OR REPLACE FUNCTION mark_token_as_used(p_token TEXT, p_member_id UUID, p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row_count INTEGER;
BEGIN
  UPDATE registration_tokens
  SET used_at = NOW(), used_by_email = p_email, member_id = p_member_id,
      is_active = FALSE, updated_at = NOW()
  WHERE token = p_token AND used_at IS NULL AND NOW() < expires_at;
  
  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  RETURN v_row_count > 0;
END;
$$;

-- Listar tokens
CREATE OR REPLACE FUNCTION list_registration_tokens(p_user_id UUID, p_show_all BOOLEAN DEFAULT FALSE)
RETURNS TABLE(
  id UUID, token TEXT, created_by_email TEXT, created_by_role TEXT,
  expires_at TIMESTAMPTZ, used_at TIMESTAMPTZ, used_by_email TEXT,
  is_active BOOLEAN, is_expired BOOLEAN, time_remaining_seconds INTEGER,
  notes TEXT, recipient_name TEXT, recipient_contact TEXT, created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT role INTO v_profile FROM profiles WHERE profiles.id = p_user_id;

  IF NOT FOUND OR v_profile.role NOT IN ('admin', 'pastor', 'secretario') THEN
    RAISE EXCEPTION 'Sem permissão para listar tokens';
  END IF;

  RETURN QUERY
  SELECT 
    rt.id, rt.token, rt.created_by_email, rt.created_by_role, rt.expires_at,
    rt.used_at, rt.used_by_email, rt.is_active, (NOW() > rt.expires_at) AS is_expired,
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
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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

-- Limpeza
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE registration_tokens SET is_active = FALSE
  WHERE is_active = TRUE AND expires_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;

  DELETE FROM registration_tokens WHERE expires_at < NOW() - INTERVAL '30 days';
  RETURN v_count;
END;
$$;

-- =====================================
-- PARTE 4: PERMISSÕES E POLÍTICAS
-- =====================================

GRANT EXECUTE ON FUNCTION generate_registration_token TO authenticated;
GRANT EXECUTE ON FUNCTION validate_registration_token TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mark_token_as_used TO anon, authenticated;
GRANT EXECUTE ON FUNCTION list_registration_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_registration_token TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_tokens TO authenticated;

ALTER TABLE registration_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar tokens" ON registration_tokens FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'pastor', 'secretario')));

-- =====================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================

DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de tokens temporários criado!';
END $$;

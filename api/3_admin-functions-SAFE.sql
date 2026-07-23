-- =====================================
-- PARTE 1: DROPS (Limpar versões antigas)
-- =====================================

DROP FUNCTION IF EXISTS admin_list_auth_users();
DROP FUNCTION IF EXISTS admin_upsert_user_role(TEXT, TEXT);
DROP FUNCTION IF EXISTS admin_remove_user(UUID);

-- =====================================
-- PARTE 2: FUNÇÕES
-- =====================================

-- Listar usuários autenticados
CREATE OR REPLACE FUNCTION admin_list_auth_users()
RETURNS TABLE(
  id UUID,
  email TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'pastor', 'secretario')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem listar usuários';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    COALESCE(p.role, 'sem perfil') AS role,
    au.created_at,
    au.last_sign_in_at
  FROM auth.users au
  LEFT JOIN profiles p ON p.id = au.id
  WHERE au.deleted_at IS NULL
  ORDER BY au.created_at DESC;
END;
$$;

-- Criar ou atualizar perfil de usuário
CREATE OR REPLACE FUNCTION admin_upsert_user_role(p_email TEXT, p_role TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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

  INSERT INTO profiles (id, role, updated_at)
  VALUES (v_user_id, p_role, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET role = EXCLUDED.role, updated_at = NOW();

  PERFORM log_access_attempt(
    'user_role_updated', 'admin', auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    NULL, NULL, 'admin_upsert_user_role',
    format('Atribuiu perfil %s para %s', p_role, p_email),
    jsonb_build_object('target_user_id', v_user_id, 'target_email', p_email, 'assigned_role', p_role)
  );

  RETURN jsonb_build_object('success', true, 'user_id', v_user_id, 'email', p_email, 'role', p_role);
END;
$$;

-- Remover usuário administrativo
CREATE OR REPLACE FUNCTION admin_remove_user(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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

  PERFORM log_access_attempt(
    'user_removed', 'admin', auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    NULL, NULL, 'admin_remove_user',
    format('Removeu usuário %s', v_target_email),
    jsonb_build_object('target_user_id', p_user_id, 'target_email', v_target_email)
  );

  RETURN jsonb_build_object('success', true, 'message', 'Usuário removido com sucesso');
END;
$$;

-- =====================================
-- PARTE 3: PERMISSÕES
-- =====================================

GRANT EXECUTE ON FUNCTION admin_list_auth_users TO authenticated;
GRANT EXECUTE ON FUNCTION admin_upsert_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION admin_remove_user TO authenticated;

-- =====================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================

DO $$
BEGIN
  RAISE NOTICE '✅ Funções administrativas criadas com sucesso!';
  RAISE NOTICE '📋 Funções disponíveis:';
  RAISE NOTICE '   - admin_list_auth_users()';
  RAISE NOTICE '   - admin_upsert_user_role(email, role)';
  RAISE NOTICE '   - admin_remove_user(user_id)';
END $$;

-- Funções administrativas para gerenciamento de usuários
-- Execute este arquivo no SQL Editor do Supabase APÓS security-functions.sql

-- =====================================
-- Listar usuários autenticados
-- =====================================

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
  -- Verifica se usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'pastor', 'secretario')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem listar usuários';
  END IF;

  -- Retorna usuários com seus perfis
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

-- =====================================
-- Criar ou atualizar perfil de usuário
-- =====================================

CREATE OR REPLACE FUNCTION admin_upsert_user_role(
  p_email TEXT,
  p_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_current_user_role TEXT;
BEGIN
  -- Verifica se usuário atual é admin
  SELECT role INTO v_current_user_role
  FROM profiles
  WHERE id = auth.uid();

  IF v_current_user_role NOT IN ('admin', 'pastor') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem gerenciar usuários';
  END IF;

  -- Valida o role
  IF p_role NOT IN ('admin', 'pastor', 'secretario') THEN
    RAISE EXCEPTION 'Perfil inválido: use admin, pastor ou secretario';
  END IF;

  -- Busca usuário pelo email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', p_email;
  END IF;

  -- Insere ou atualiza perfil
  INSERT INTO profiles (id, role, updated_at)
  VALUES (v_user_id, p_role, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = EXCLUDED.role,
    updated_at = NOW();

  -- Log da operação
  PERFORM log_access_attempt(
    'user_role_updated',
    'admin',
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    NULL,
    NULL,
    'admin_upsert_user_role',
    format('Atribuiu perfil %s para %s', p_role, p_email),
    jsonb_build_object(
      'target_user_id', v_user_id,
      'target_email', p_email,
      'assigned_role', p_role
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'role', p_role
  );
END;
$$;

-- =====================================
-- Remover usuário administrativo
-- =====================================

CREATE OR REPLACE FUNCTION admin_remove_user(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_role TEXT;
  v_target_email TEXT;
BEGIN
  -- Verifica se usuário atual é admin
  SELECT role INTO v_current_user_role
  FROM profiles
  WHERE id = auth.uid();

  IF v_current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem remover usuários';
  END IF;

  -- Não pode remover a si mesmo
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode remover sua própria conta';
  END IF;

  -- Busca email do usuário
  SELECT email INTO v_target_email
  FROM auth.users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Remove perfil
  DELETE FROM profiles WHERE id = p_user_id;

  -- Log da operação
  PERFORM log_access_attempt(
    'user_removed',
    'admin',
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    NULL,
    NULL,
    'admin_remove_user',
    format('Removeu usuário %s', v_target_email),
    jsonb_build_object(
      'target_user_id', p_user_id,
      'target_email', v_target_email
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Usuário removido com sucesso'
  );
END;
$$;

-- =====================================
-- Permissões
-- =====================================

GRANT EXECUTE ON FUNCTION admin_list_auth_users TO authenticated;
GRANT EXECUTE ON FUNCTION admin_upsert_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION admin_remove_user TO authenticated;

-- =====================================
-- Comentários
-- =====================================

COMMENT ON FUNCTION admin_list_auth_users IS 'Lista todos os usuários autenticados com seus perfis (apenas para admins)';
COMMENT ON FUNCTION admin_upsert_user_role IS 'Atribui ou atualiza o perfil de um usuário (apenas para admins)';
COMMENT ON FUNCTION admin_remove_user IS 'Remove um usuário administrativo (apenas para admins)';

-- =====================================
-- Mensagem de conclusão
-- =====================================

DO $$
BEGIN
  RAISE NOTICE '✅ Funções administrativas criadas com sucesso!';
  RAISE NOTICE '📋 Funções disponíveis:';
  RAISE NOTICE '   - admin_list_auth_users()';
  RAISE NOTICE '   - admin_upsert_user_role(email, role)';
  RAISE NOTICE '   - admin_remove_user(user_id)';
END $$;

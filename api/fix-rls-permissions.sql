-- ============================================
-- FIX: Permissões RLS para corrigir erro 401
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para permitir que admins acessem membros e tokens

-- 1. Garantir que a tabela membros tenha RLS habilitado
ALTER TABLE membros ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Admins podem ver todos os membros" ON membros;
DROP POLICY IF EXISTS "Admins podem inserir membros" ON membros;
DROP POLICY IF EXISTS "Admins podem atualizar membros" ON membros;
DROP POLICY IF EXISTS "Admins podem deletar membros" ON membros;
DROP POLICY IF EXISTS "Qualquer um pode inserir membro" ON membros;

-- 3. Criar políticas para ADMINS terem acesso total
CREATE POLICY "Admins podem ver todos os membros"
ON membros FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin', 'pastor', 'secretario')
  )
);

CREATE POLICY "Admins podem inserir membros"
ON membros FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin', 'pastor', 'secretario')
  )
);

CREATE POLICY "Admins podem atualizar membros"
ON membros FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin', 'pastor', 'secretario')
  )
);

CREATE POLICY "Admins podem deletar membros"
ON membros FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin', 'secretario')
  )
);

-- 4. Permitir inserção pública de membros (via cadastro público)
CREATE POLICY "Cadastro público pode inserir"
ON membros FOR INSERT
TO anon
WITH CHECK (true);

-- 5. Garantir que profiles tenha políticas básicas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins podem ver todos perfis" ON profiles;

CREATE POLICY "Usuários podem ver próprio perfil"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos perfis"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin', 'pastor', 'secretario')
  )
);

-- 6. Permissões para a tabela registration_tokens
ALTER TABLE registration_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem gerenciar tokens" ON registration_tokens;
DROP POLICY IF EXISTS "Público pode validar token" ON registration_tokens;

CREATE POLICY "Admins podem gerenciar tokens"
ON registration_tokens FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin', 'pastor', 'secretario')
  )
);

CREATE POLICY "Público pode validar token"
ON registration_tokens FOR SELECT
TO anon
USING (
  expires_at > NOW()
  AND used = false
);

-- 7. Garantir que as funções RPC tenham permissões corretas
-- Verificar se generate_registration_token existe e ajustar
CREATE OR REPLACE FUNCTION generate_registration_token(
  p_created_by UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  token TEXT,
  expires_at TIMESTAMPTZ,
  registration_url TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_token TEXT;
  v_expires_at TIMESTAMPTZ;
  v_creator_id UUID;
BEGIN
  -- Verificar se usuário é admin
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Pegar role do usuário
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'pastor', 'secretario')
  ) THEN
    RAISE EXCEPTION 'Permissão negada. Apenas admins podem gerar tokens.';
  END IF;

  -- Usar o ID do usuário logado se não foi especificado
  v_creator_id := COALESCE(p_created_by, auth.uid());
  
  -- Gerar token único
  v_token := encode(gen_random_bytes(32), 'base64');
  v_token := regexp_replace(v_token, '[^a-zA-Z0-9]', '', 'g');
  v_token := substring(v_token, 1, 32);
  
  -- Token válido por 2 horas
  v_expires_at := NOW() + INTERVAL '2 hours';
  
  -- Inserir na tabela
  INSERT INTO registration_tokens (
    token,
    expires_at,
    created_by,
    notes
  ) VALUES (
    v_token,
    v_expires_at,
    v_creator_id,
    p_notes
  );
  
  -- Retornar dados
  RETURN QUERY
  SELECT 
    v_token,
    v_expires_at,
    (current_setting('request.headers')::json->>'origin' || '/pages/cadastro.html?token=' || v_token)::TEXT;
    
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao gerar token: %', SQLERRM;
END;
$$;

-- 8. Função para listar tokens ativos
CREATE OR REPLACE FUNCTION list_active_tokens()
RETURNS TABLE(
  id UUID,
  token TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  used BOOLEAN,
  used_at TIMESTAMPTZ,
  notes TEXT,
  creator_email TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar se usuário é admin
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND role IN ('admin', 'pastor', 'secretario')
  ) THEN
    RAISE EXCEPTION 'Permissão negada. Apenas admins podem listar tokens.';
  END IF;

  -- Retornar tokens
  RETURN QUERY
  SELECT 
    rt.id,
    rt.token,
    rt.created_at,
    rt.expires_at,
    rt.used,
    rt.used_at,
    rt.notes,
    u.email as creator_email
  FROM registration_tokens rt
  LEFT JOIN auth.users u ON u.id = rt.created_by
  ORDER BY rt.created_at DESC;
END;
$$;

-- 9. Verificar se tudo está correto
SELECT 'Permissões RLS configuradas com sucesso!' as status;

-- 10. Mostrar políticas ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('membros', 'profiles', 'registration_tokens')
ORDER BY tablename, policyname;

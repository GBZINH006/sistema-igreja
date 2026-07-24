-- ============================================
-- FIX RLS: Script SEGURO sem conflitos
-- ============================================
-- Este script só configura as permissões RLS
-- NÃO modifica funções existentes
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Garantir que a tabela membros tenha RLS habilitado
ALTER TABLE IF EXISTS membros ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas da tabela membros (se existirem)
DROP POLICY IF EXISTS "Admins podem ver todos os membros" ON membros;
DROP POLICY IF EXISTS "Admins podem inserir membros" ON membros;
DROP POLICY IF EXISTS "Admins podem atualizar membros" ON membros;
DROP POLICY IF EXISTS "Admins podem deletar membros" ON membros;
DROP POLICY IF EXISTS "Qualquer um pode inserir membro" ON membros;
DROP POLICY IF EXISTS "Cadastro público pode inserir" ON membros;

-- 3. Criar políticas para ADMINS na tabela membros
CREATE POLICY "Admins podem ver todos os membros"
ON membros FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'pastor', 'secretario')
  )
);

CREATE POLICY "Admins podem inserir membros"
ON membros FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'pastor', 'secretario')
  )
);

CREATE POLICY "Admins podem atualizar membros"
ON membros FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'pastor', 'secretario')
  )
);

CREATE POLICY "Admins podem deletar membros"
ON membros FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'secretario')
  )
);

-- 4. Permitir inserção pública de membros (via cadastro)
CREATE POLICY "Cadastro público pode inserir"
ON membros FOR INSERT
TO anon
WITH CHECK (true);

-- 5. Configurar RLS na tabela profiles
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

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
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'pastor', 'secretario')
  )
);

-- 6. Configurar RLS na tabela registration_tokens
ALTER TABLE IF EXISTS registration_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem gerenciar tokens" ON registration_tokens;
DROP POLICY IF EXISTS "Público pode validar token" ON registration_tokens;
DROP POLICY IF EXISTS "Qualquer um pode ver tokens" ON registration_tokens;
DROP POLICY IF EXISTS "Qualquer um pode criar tokens" ON registration_tokens;
DROP POLICY IF EXISTS "Qualquer um pode atualizar tokens" ON registration_tokens;

-- Admins têm acesso total
CREATE POLICY "Admins podem gerenciar tokens"
ON registration_tokens FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'pastor', 'secretario')
  )
);

-- Público pode ler tokens válidos
CREATE POLICY "Público pode validar token"
ON registration_tokens FOR SELECT
TO anon
USING (
  expires_at > NOW()
  AND used = false
);

-- Público pode marcar token como usado
CREATE POLICY "Público pode atualizar token"
ON registration_tokens FOR UPDATE
TO anon
USING (
  expires_at > NOW()
  AND used = false
);

-- 7. Verificar configuração
DO $$
BEGIN
  RAISE NOTICE '✅ Permissões RLS configuradas com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Verificando políticas ativas:';
END $$;

-- 8. Listar políticas configuradas
SELECT 
  tablename as "Tabela",
  policyname as "Política",
  CASE 
    WHEN roles = '{authenticated}' THEN '🔐 Autenticado'
    WHEN roles = '{anon}' THEN '🌐 Público'
    ELSE roles::text
  END as "Quem",
  cmd as "Ação"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('membros', 'profiles', 'registration_tokens')
ORDER BY tablename, policyname;

-- ============================================================================
-- CORRIGIR ERRO 401 (Unauthorized) - Permissões RLS
-- ============================================================================
-- Este script configura as políticas RLS corretas para evitar erro 401
-- Execute no Supabase SQL Editor
-- ============================================================================

BEGIN;

-- 1. TABELA MEMBROS - Políticas para admins
-- ============================================================================

-- Remove políticas antigas
DROP POLICY IF EXISTS "Admins podem ver todos os membros" ON membros;
DROP POLICY IF EXISTS "Admins podem inserir membros" ON membros;
DROP POLICY IF EXISTS "Admins podem atualizar membros" ON membros;
DROP POLICY IF EXISTS "Admins podem deletar membros" ON membros;
DROP POLICY IF EXISTS "Cadastro público pode inserir" ON membros;
DROP POLICY IF EXISTS "Permitir SELECT para admins" ON membros;
DROP POLICY IF EXISTS "Permitir INSERT para todos" ON membros;
DROP POLICY IF EXISTS "Permitir UPDATE para admins" ON membros;
DROP POLICY IF EXISTS "Permitir DELETE para admins" ON membros;

-- Garante que RLS está habilitado
ALTER TABLE membros ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem VER todos os membros
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

-- Política: Admins podem INSERIR membros
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

-- Política: Admins podem ATUALIZAR membros
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

-- Política: Admins podem DELETAR membros
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

-- Política: Cadastro PÚBLICO pode inserir (via token ou página pública)
CREATE POLICY "Cadastro público pode inserir"
ON membros FOR INSERT
TO anon
WITH CHECK (true);


-- 2. TABELA REGISTRATION_TOKENS - Políticas para tokens
-- ============================================================================

-- Remove políticas antigas
DROP POLICY IF EXISTS "Admins podem gerenciar tokens" ON registration_tokens;
DROP POLICY IF EXISTS "Admins podem ver tokens" ON registration_tokens;
DROP POLICY IF EXISTS "Admins podem criar tokens" ON registration_tokens;
DROP POLICY IF EXISTS "Admins podem atualizar tokens" ON registration_tokens;
DROP POLICY IF EXISTS "Permitir SELECT para admins" ON registration_tokens;
DROP POLICY IF EXISTS "Permitir INSERT para admins" ON registration_tokens;
DROP POLICY IF EXISTS "Permitir UPDATE para admins" ON registration_tokens;

-- Garante que RLS está habilitado
ALTER TABLE registration_tokens ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem VER tokens
CREATE POLICY "Admins podem ver tokens"
ON registration_tokens FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'pastor', 'secretario')
  )
);

-- Política: Admins podem CRIAR tokens
CREATE POLICY "Admins podem criar tokens"
ON registration_tokens FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'pastor', 'secretario')
  )
);

-- Política: Admins podem ATUALIZAR tokens
CREATE POLICY "Admins podem atualizar tokens"
ON registration_tokens FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'pastor', 'secretario')
  )
);


-- 3. TABELA PROFILES - Políticas para perfis
-- ============================================================================

-- Remove políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Permitir SELECT próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Permitir SELECT para admins" ON profiles;

-- Garante que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuário pode ver SEU PRÓPRIO perfil
CREATE POLICY "Usuários podem ver próprio perfil"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Política: Admins podem ver TODOS os perfis
CREATE POLICY "Admins podem ver todos os perfis"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'secretario')
  )
);


-- 4. VERIFICAÇÃO FINAL
-- ============================================================================

-- Lista todas as políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('membros', 'registration_tokens', 'profiles')
ORDER BY tablename, policyname;

COMMIT;

-- ============================================================================
-- TESTE (OPCIONAL)
-- ============================================================================
-- Após executar, teste no SQL Editor:
-- SELECT * FROM membros LIMIT 5;
-- SELECT * FROM registration_tokens LIMIT 5;
-- SELECT * FROM profiles WHERE id = auth.uid();

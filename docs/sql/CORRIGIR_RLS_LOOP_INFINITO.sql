-- ============================================================================
-- CORRIGIR LOOP INFINITO NAS POLÍTICAS RLS
-- ============================================================================
-- Este script remove políticas recursivas e cria políticas corretas
-- Execute no Supabase SQL Editor
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSO 1: REMOVER TODAS AS POLÍTICAS ANTIGAS DA TABELA PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Secretários podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Permitir SELECT próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Permitir SELECT para admins" ON profiles;
DROP POLICY IF EXISTS "Permitir SELECT para secretarios" ON profiles;

-- ============================================================================
-- PASSO 2: DESABILITAR RLS TEMPORARIAMENTE (para evitar travamento)
-- ============================================================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASSO 3: CRIAR POLÍTICA SIMPLES SEM RECURSÃO
-- ============================================================================
-- Qualquer usuário AUTENTICADO pode ver qualquer perfil
-- (simples e sem recursão - não verifica a própria tabela profiles)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ler profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);  -- Permite leitura para qualquer usuário autenticado

-- ============================================================================
-- PASSO 4: VERIFICAR QUE FUNCIONOU
-- ============================================================================

-- Ver todas as políticas da tabela profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

COMMIT;

-- ============================================================================
-- RESULTADO ESPERADO:
-- Apenas 1 política simples sem recursão
-- ============================================================================

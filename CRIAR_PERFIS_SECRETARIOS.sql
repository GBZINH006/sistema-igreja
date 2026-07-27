-- =====================================
-- CRIAR PERFIS PARA SECRETÁRIOS E PASTORES
-- =====================================
-- Execute este SQL no Supabase SQL Editor
-- IMPORTANTE: Só existem 2 roles agora: 'secretario' e 'pastor'
-- =====================================

-- PASSO 1: Ver todos os usuários do Authentication
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- =====================================
-- PASSO 2: COLE OS UUIDs DOS USUÁRIOS ABAIXO
-- =====================================

-- EXEMPLO com 3 usuários (ajuste conforme necessário):
INSERT INTO profiles (id, role, created_at, updated_at)
VALUES 
  -- Cole o UUID do Gabriel (secretário):
  ('UUID-DO-GABRIEL-AQUI', 'secretario', NOW(), NOW()),
  
  -- Cole o UUID do Pastor:
  ('UUID-DO-PASTOR-AQUI', 'pastor', NOW(), NOW()),
  
  -- Cole o UUID de outro secretário (se tiver):
  ('UUID-DE-OUTRO-SECRETARIO', 'secretario', NOW(), NOW())
  
-- ATENÇÃO: Remova a vírgula da última linha!

ON CONFLICT (id)
DO UPDATE SET 
  role = EXCLUDED.role,
  updated_at = NOW();

-- =====================================
-- PASSO 3: Verificar que foram criados
-- =====================================
SELECT 
  p.id,
  u.email,
  p.role,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;

-- =====================================
-- ROLES DISPONÍVEIS:
-- - 'secretario' = Acesso total (gerencia tudo)
-- - 'pastor'     = Visualiza relatórios e indicadores
-- =====================================

-- =====================================
-- SE DER ERRO, EXECUTE ISSO PRIMEIRO:
-- =====================================
-- Cria a tabela profiles se não existir
/*
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('secretario', 'pastor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilita RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuário pode ver seu próprio perfil
CREATE POLICY "Usuários podem ver próprio perfil"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Política: Secretários podem ver todos os perfis
CREATE POLICY "Secretários podem ver todos os perfis"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'secretario'
  )
);
*/

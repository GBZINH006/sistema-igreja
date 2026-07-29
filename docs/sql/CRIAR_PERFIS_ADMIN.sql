-- =====================================
-- CRIAR PERFIS DE ADMINISTRADORES
-- =====================================
-- Execute este SQL no Supabase SQL Editor
-- =====================================

-- PASSO 1: Ver todos os usuários criados no Authentication
SELECT 
  id as user_id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- =====================================
-- PASSO 2: COPIE OS IDs (UUID) dos usuários acima
-- e cole abaixo substituindo os valores
-- =====================================

-- EXEMPLO: Criar perfil para gabriel@example.com
-- Substitua 'SEU-UUID-AQUI' pelo UUID real do usuário

INSERT INTO profiles (id, role, created_at, updated_at)
VALUES 
  -- Copie o UUID do usuário e cole aqui (ATENÇÃO: remova a vírgula se for só 1):
  ('SEU-UUID-AQUI', 'admin', NOW(), NOW())  -- <- SEM VÍRGULA no último
ON CONFLICT (id)
DO UPDATE SET 
  role = EXCLUDED.role,
  updated_at = NOW();

-- =====================================
-- TEMPLATE PARA MÚLTIPLOS USUÁRIOS:
-- =====================================
-- Descomente e preencha os UUIDs de cada usuário:

/*
INSERT INTO profiles (id, role, created_at, updated_at)
VALUES 
  ('UUID-DO-GABRIEL', 'admin', NOW(), NOW()),
  ('UUID-DO-SECRETARIO-1', 'secretario', NOW(), NOW()),
  ('UUID-DO-SECRETARIO-2', 'secretario', NOW(), NOW()),
  ('UUID-DO-PASTOR', 'pastor', NOW(), NOW())
ON CONFLICT (id)
DO UPDATE SET 
  role = EXCLUDED.role,
  updated_at = NOW();
*/

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
-- - 'admin'      = Acesso total
-- - 'secretario' = Gerencia membros e usuários
-- - 'pastor'     = Visualiza relatórios e indicadores
-- =====================================

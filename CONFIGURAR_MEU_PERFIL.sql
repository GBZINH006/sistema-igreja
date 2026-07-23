-- =====================================
-- CONFIGURAR SEU PERFIL DE ADMIN
-- =====================================
-- Execute este SQL no Supabase enquanto estiver logado
-- para configurar seu usuário como admin

-- 1. Ver seu usuário atual
SELECT 
  auth.uid() as meu_id,
  u.email as meu_email
FROM auth.users u
WHERE u.id = auth.uid();

-- 2. Inserir ou atualizar seu perfil como admin
INSERT INTO profiles (id, role, created_at, updated_at)
VALUES (
  auth.uid(),
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id)
DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- 3. Confirmar que foi criado
SELECT id, role, created_at
FROM profiles
WHERE id = auth.uid();

-- =====================================
-- PRONTO! Agora seu usuário é ADMIN
-- =====================================
-- Recarregue a página admin.html e tente novamente

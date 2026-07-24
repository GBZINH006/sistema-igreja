-- =====================================
-- CONFIGURAÇÃO DE ACESSO URGENTE
-- =====================================
-- Execute este script se estiver bloqueado
-- =====================================

-- 1. Ver seu usuário atual
SELECT 
  auth.uid() as meu_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as meu_email,
  'Este é o seu ID de usuário' as info;

-- 2. Verificar se você tem perfil
SELECT 
  id,
  role,
  created_at,
  CASE 
    WHEN role = 'secretario' THEN '✅ Você já é secretário!'
    WHEN role IN ('admin', 'pastor') THEN '✅ Você já tem acesso!'
    ELSE '❌ Seu role atual não tem permissão'
  END as status
FROM profiles 
WHERE id = auth.uid();

-- 3. CONFIGURAR SEU USUÁRIO COMO SECRETÁRIO
-- (agora secretário tem todos os poderes)
INSERT INTO profiles (id, role, created_at, updated_at)
VALUES (auth.uid(), 'secretario', NOW(), NOW())
ON CONFLICT (id)
DO UPDATE SET 
  role = 'secretario',
  updated_at = NOW();

-- 4. Confirmar que foi configurado
SELECT 
  id,
  role,
  created_at,
  updated_at,
  '✅ Agora você é secretário e tem acesso total!' as resultado
FROM profiles 
WHERE id = auth.uid();

-- 5. ALTERNATIVA: Se você quiser ser ADMIN
-- Descomente as linhas abaixo e execute apenas esta parte:

/*
UPDATE profiles 
SET role = 'admin', updated_at = NOW()
WHERE id = auth.uid();

SELECT 
  role,
  '✅ Agora você é admin!' as resultado
FROM profiles 
WHERE id = auth.uid();
*/

-- =====================================
-- APÓS EXECUTAR:
-- 1. Limpe o cache do navegador (Ctrl+Shift+R)
-- 2. Faça login novamente na página admin
-- 3. Você deve conseguir acessar normalmente
-- =====================================

-- =====================================
-- CONFIGURAÇÃO DE ACESSO URGENTE
-- =====================================
-- ⚠️ SUBSTITUA 'SEU_EMAIL@AQUI.COM' pelo seu email de login
-- =====================================

-- 1. Ver todos os usuários cadastrados
SELECT 
  id,
  email,
  created_at,
  '👆 Encontre seu email nesta lista' as info
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Ver quem já tem perfil
SELECT 
  p.id,
  u.email,
  p.role,
  CASE 
    WHEN p.role = 'secretario' THEN '✅ Já é secretário!'
    WHEN p.role IN ('admin', 'pastor') THEN '✅ Já tem acesso!'
    ELSE '❌ Role sem permissão'
  END as status
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;

-- =====================================
-- 3. CONFIGURAR ACESSO POR EMAIL
-- ⚠️ TROQUE 'SEU_EMAIL@AQUI.COM' pelo seu email!
-- =====================================

DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'SEU_EMAIL@AQUI.COM'; -- 👈 TROQUE AQUI!
BEGIN
  -- Buscar ID do usuário pelo email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  -- Verificar se encontrou
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '❌ Email % não encontrado! Verifique se está correto.', v_email;
  END IF;

  -- Inserir ou atualizar perfil
  INSERT INTO profiles (id, role, created_at, updated_at)
  VALUES (v_user_id, 'secretario', NOW(), NOW())
  ON CONFLICT (id)
  DO UPDATE SET 
    role = 'secretario',
    updated_at = NOW();

  RAISE NOTICE '✅ Usuário % configurado como secretario!', v_email;
END $$;

-- 4. Confirmar que foi configurado
-- ⚠️ TROQUE 'SEU_EMAIL@AQUI.COM' aqui também!
SELECT 
  p.id,
  u.email,
  p.role,
  p.updated_at,
  '✅ Perfil configurado com sucesso!' as resultado
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'SEU_EMAIL@AQUI.COM'; -- 👈 TROQUE AQUI!

-- =====================================
-- ALTERNATIVA: Configurar TODOS os usuários como secretario
-- (use apenas se tiver certeza!)
-- =====================================
/*
INSERT INTO profiles (id, role, created_at, updated_at)
SELECT 
  id,
  'secretario',
  NOW(),
  NOW()
FROM auth.users
ON CONFLICT (id)
DO UPDATE SET 
  role = 'secretario',
  updated_at = NOW();

SELECT 
  COUNT(*) as total_usuarios,
  '✅ Todos configurados como secretario!' as resultado
FROM profiles
WHERE role = 'secretario';
*/

-- =====================================
-- APÓS EXECUTAR:
-- 1. Limpe o cache do navegador (Ctrl+Shift+R)
-- 2. Faça login novamente na página admin
-- 3. Você deve conseguir acessar normalmente
-- =====================================

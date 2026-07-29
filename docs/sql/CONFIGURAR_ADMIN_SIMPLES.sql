-- =====================================
-- MODO SUPER SIMPLES - CONFIGURAR ADMIN
-- =====================================
-- Execute este SQL completo de uma vez

-- 1. Adiciona coluna updated_at se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 2. Adiciona coluna created_at se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 3. Insere seu perfil como admin
INSERT INTO profiles (id, role, created_at, updated_at)
VALUES (auth.uid(), 'admin', NOW(), NOW())
ON CONFLICT (id)
DO UPDATE SET role = 'admin', updated_at = NOW();

-- 4. Confirma que funcionou
SELECT 
  id,
  role,
  (SELECT email FROM auth.users WHERE id = profiles.id) as email,
  created_at,
  updated_at
FROM profiles 
WHERE id = auth.uid();

-- =====================================
-- MENSAGEM DE SUCESSO
-- =====================================
DO $$
BEGIN
  RAISE NOTICE '✅ Perfil configurado com sucesso!';
  RAISE NOTICE '📧 Email: %', (SELECT email FROM auth.users WHERE id = auth.uid());
  RAISE NOTICE '👤 Role: admin';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Agora você pode:';
  RAISE NOTICE '   1. Recarregar a página admin.html';
  RAISE NOTICE '   2. Fazer login';
  RAISE NOTICE '   3. Clicar em "Gerar Link"';
END $$;

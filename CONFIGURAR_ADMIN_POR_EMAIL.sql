-- =====================================
-- CONFIGURAR ADMIN POR EMAIL
-- =====================================
-- Use este SQL se auth.uid() retornar NULL

-- PASSO 1: Adiciona colunas se não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- =====================================
-- PASSO 2: SUBSTITUA O EMAIL ABAIXO
-- =====================================
-- Troque 'SEU_EMAIL@AQUI.COM' pelo seu email real
-- e execute o bloco DO abaixo

DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'SEU_EMAIL@AQUI.COM'; -- ⚠️ MUDE AQUI!
BEGIN
  -- Busca o ID do usuário pelo email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  -- Se não encontrou, mostra erro
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado!', v_email;
  END IF;

  -- Insere ou atualiza o perfil
  INSERT INTO profiles (id, role, created_at, updated_at)
  VALUES (v_user_id, 'admin', NOW(), NOW())
  ON CONFLICT (id)
  DO UPDATE SET role = 'admin', updated_at = NOW();

  -- Mensagem de sucesso
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ PERFIL ADMIN CONFIGURADO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Email: %', v_email;
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Role: admin';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Agora você pode:';
  RAISE NOTICE '   1. Recarregar a página admin.html';
  RAISE NOTICE '   2. Fazer login com este email';
  RAISE NOTICE '   3. Ver o botão "Gerar Link"';
  RAISE NOTICE '========================================';
END $$;

-- =====================================
-- PASSO 3: Confirma que funcionou
-- =====================================
-- Troque 'SEU_EMAIL@AQUI.COM' pelo mesmo email usado acima
SELECT 
  p.id,
  u.email,
  p.role,
  p.created_at,
  p.updated_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'SEU_EMAIL@AQUI.COM'; -- ⚠️ MUDE AQUI!

-- =====================================
-- ALTERNATIVA: Ver todos os usuários
-- =====================================
-- Se não souber seu email exato, execute isto:
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

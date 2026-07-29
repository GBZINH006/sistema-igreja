-- ============================================================
-- CONFIGURAR PERFIL ADMIN
-- ============================================================
-- 1. Primeiro execute esta linha para ver seus usuários:
--    SELECT id, email FROM auth.users ORDER BY created_at DESC;
--
-- 2. Copie o email que apareceu
-- 3. Substitua 'SEU_EMAIL@AQUI.COM' pelo seu email
-- 4. Execute o bloco abaixo
-- ============================================================

-- PASSO 1: Adiciona colunas que podem faltar na tabela profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='created_at') THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- PASSO 2: Configura o perfil admin (substitua o email abaixo)
DO $$
DECLARE
  v_id UUID;
  v_email TEXT := 'SEU_EMAIL@AQUI.COM'; -- ⚠️ TROQUE AQUI
BEGIN
  SELECT id INTO v_id FROM auth.users WHERE email = v_email;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Email "%" não encontrado. Execute: SELECT id, email FROM auth.users;', v_email;
  END IF;

  INSERT INTO profiles (id, role, created_at, updated_at)
  VALUES (v_id, 'admin', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = NOW();

  RAISE NOTICE '✅ Perfil admin configurado para: % (ID: %)', v_email, v_id;
END $$;

-- PASSO 3: Confirma o resultado
SELECT p.id, u.email, p.role
FROM profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;

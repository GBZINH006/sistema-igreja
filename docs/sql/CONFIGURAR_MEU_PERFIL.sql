-- =====================================
-- CONFIGURAR SEU PERFIL DE ADMIN
-- =====================================
-- Execute este SQL no Supabase SQL Editor
-- =====================================

-- PASSO 1: Ver seu usuário atual (para confirmar que você está logado)
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Você não está logado! Faça login primeiro no Supabase.';
  END IF;
  
  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
  
  RAISE NOTICE '✅ Você está logado como: % (ID: %)', v_email, v_user_id;
END $$;

-- PASSO 2: Inserir seu perfil como admin (com proteção contra erros)
DO $$
DECLARE
  v_user_id UUID;
  v_exists BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Você não está logado! Faça login primeiro.';
  END IF;
  
  -- Verifica se já existe
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = v_user_id) INTO v_exists;
  
  IF v_exists THEN
    -- Atualiza se já existe
    UPDATE profiles SET role = 'admin', updated_at = NOW() WHERE id = v_user_id;
    RAISE NOTICE '✅ Perfil atualizado para admin';
  ELSE
    -- Insere se não existe
    INSERT INTO profiles (id, role, created_at, updated_at)
    VALUES (v_user_id, 'admin', NOW(), NOW());
    RAISE NOTICE '✅ Perfil criado como admin';
  END IF;
END $$;

-- PASSO 3: Confirmar que funcionou
SELECT 
  id,
  role,
  created_at,
  updated_at
FROM profiles 
WHERE id = auth.uid();

-- =====================================
-- RESULTADO ESPERADO:
-- Você deve ver uma linha com seu ID e role = 'admin'
-- =====================================

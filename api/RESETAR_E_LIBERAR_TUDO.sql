-- ============================================
-- RESETAR TUDO E LIBERAR ACESSO COMPLETO
-- ============================================
-- Este script REMOVE todas as restrições
-- e configura gabrieldossantosdutra06@gmail.com
-- como admin com acesso total
-- ============================================

BEGIN;

-- 1. DESABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE IF EXISTS membros DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS registration_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS member_accounts DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 3. CONFIGURAR SEU USUÁRIO COMO ADMIN
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Buscar seu ID
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'gabrieldossantosdutra06@gmail.com';

    IF v_user_id IS NOT NULL THEN
        -- Inserir ou atualizar perfil
        INSERT INTO profiles (id, role, created_at, updated_at)
        VALUES (v_user_id, 'admin', NOW(), NOW())
        ON CONFLICT (id)
        DO UPDATE SET 
            role = 'admin',
            updated_at = NOW();
            
        RAISE NOTICE '✅ Usuário gabrieldossantosdutra06@gmail.com configurado como ADMIN';
    ELSE
        RAISE NOTICE '⚠️ Email não encontrado. Verifique se está correto.';
    END IF;
END $$;

COMMIT;

-- 4. VERIFICAR RESULTADO
SELECT 
    u.email,
    p.role,
    '✅ Configurado!' as status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'gabrieldossantosdutra06@gmail.com';

-- 5. MOSTRAR TODOS OS USUÁRIOS
SELECT 
    u.email,
    COALESCE(p.role, '❌ SEM PERFIL') as role,
    u.created_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC
LIMIT 20;

-- ============================================
-- ✅ PRONTO! RLS DESABILITADO
-- Agora o sistema funciona SEM restrições
-- Limpe o cache e faça login novamente
-- ============================================

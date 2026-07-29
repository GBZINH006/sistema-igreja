-- Execute este SQL no Supabase para testar se as funções estão corretas

-- 1. Verificar se as funções existem
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE 'admin%'
ORDER BY routine_name;

-- 2. Testar a função admin_list_auth_users
-- (vai dar erro se o perfil não estiver configurado)
SELECT * FROM admin_list_auth_users();

-- 3. Verificar se o perfil do usuário atual existe
SELECT id, role FROM profiles WHERE id = auth.uid();

-- 4. Verificar se auth.uid() funciona
SELECT auth.uid() as meu_user_id;

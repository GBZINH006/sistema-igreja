-- =====================================
-- CONFIGURAR SEU PERFIL DE ADMIN
-- =====================================
-- Execute PASSO A PASSO no Supabase SQL Editor

-- PASSO 1: Ver a estrutura da tabela profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- PASSO 2: Ver seu usuário atual
SELECT 
  auth.uid() as meu_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as meu_email;

-- PASSO 3: Ver se você já tem perfil
SELECT * FROM profiles WHERE id = auth.uid();

-- PASSO 4: Inserir seu perfil como admin
-- (ajuste conforme as colunas que existem na sua tabela)

-- OPÇÃO A: Se a tabela tem apenas id e role
INSERT INTO profiles (id, role)
VALUES (auth.uid(), 'admin')
ON CONFLICT (id)
DO UPDATE SET role = 'admin';

-- OPÇÃO B: Se a tabela tem created_at mas NÃO tem updated_at
-- INSERT INTO profiles (id, role, created_at)
-- VALUES (auth.uid(), 'admin', NOW())
-- ON CONFLICT (id)
-- DO UPDATE SET role = 'admin';

-- OPÇÃO C: Se a tabela tem updated_at
-- INSERT INTO profiles (id, role, created_at, updated_at)
-- VALUES (auth.uid(), 'admin', NOW(), NOW())
-- ON CONFLICT (id)
-- DO UPDATE SET role = 'admin', updated_at = NOW();

-- PASSO 5: Confirmar que foi criado
SELECT * FROM profiles WHERE id = auth.uid();

-- =====================================
-- IMPORTANTE: 
-- Execute apenas a OPÇÃO que corresponde
-- às colunas que existem na sua tabela
-- =====================================

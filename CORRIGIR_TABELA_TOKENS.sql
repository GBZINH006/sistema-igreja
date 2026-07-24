-- ============================================================================
-- CORREÇÃO DA TABELA DE TOKENS
-- ============================================================================
-- Execute este script se você já tinha criado a tabela antes e está com erro
-- ============================================================================

-- OPÇÃO 1: Se você NÃO tem dados importantes na tabela
-- (Execute esta se for a primeira vez ou se pode perder os dados de teste)
-- ============================================================================

DROP TABLE IF EXISTS registration_tokens CASCADE;

CREATE TABLE registration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  used_by_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  notes TEXT
);

-- Criar índices
CREATE INDEX idx_registration_tokens_token ON registration_tokens(token);
CREATE INDEX idx_registration_tokens_expires ON registration_tokens(expires_at);
CREATE INDEX idx_registration_tokens_used ON registration_tokens(used);
CREATE INDEX idx_registration_tokens_created_by ON registration_tokens(created_by);

-- Habilitar RLS
ALTER TABLE registration_tokens ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Admins podem ver tokens" ON registration_tokens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'secretario', 'pastor')
    )
  );

CREATE POLICY "Admins podem criar tokens" ON registration_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'secretario', 'pastor')
    )
  );

CREATE POLICY "Admins podem atualizar tokens" ON registration_tokens
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'secretario', 'pastor')
    )
  );

-- ============================================================================
-- OPÇÃO 2: Se você TEM dados importantes na tabela
-- (Use esta se quiser preservar tokens já criados)
-- ============================================================================

-- Descomente e execute APENAS se escolher esta opção:

-- -- Adicionar coluna 'used' se não existir
-- ALTER TABLE registration_tokens 
-- ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT FALSE;

-- -- Adicionar coluna 'used_at' se não existir
-- ALTER TABLE registration_tokens 
-- ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ;

-- -- Adicionar coluna 'used_by_email' se não existir
-- ALTER TABLE registration_tokens 
-- ADD COLUMN IF NOT EXISTS used_by_email TEXT;

-- -- Adicionar coluna 'ip_address' se não existir
-- ALTER TABLE registration_tokens 
-- ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- -- Adicionar coluna 'user_agent' se não existir
-- ALTER TABLE registration_tokens 
-- ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- -- Adicionar coluna 'notes' se não existir
-- ALTER TABLE registration_tokens 
-- ADD COLUMN IF NOT EXISTS notes TEXT;

-- -- Criar índices se não existirem
-- CREATE INDEX IF NOT EXISTS idx_registration_tokens_token ON registration_tokens(token);
-- CREATE INDEX IF NOT EXISTS idx_registration_tokens_expires ON registration_tokens(expires_at);
-- CREATE INDEX IF NOT EXISTS idx_registration_tokens_used ON registration_tokens(used);
-- CREATE INDEX IF NOT EXISTS idx_registration_tokens_created_by ON registration_tokens(created_by);

-- ============================================================================
-- Após executar a opção escolhida, execute o resto do script principal
-- GERAR_TOKEN_CADASTRO.sql a partir da linha que cria as funções
-- ============================================================================

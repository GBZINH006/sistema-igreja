-- ============================================================================
-- ATUALIZAR FUNÇÃO list_active_tokens PARA INCLUIR MAIS CAMPOS
-- ============================================================================
-- Execute este SQL no Supabase para corrigir a função
-- ============================================================================

CREATE OR REPLACE FUNCTION list_active_tokens()
RETURNS TABLE (
  id UUID,
  token TEXT,
  observacao TEXT,
  created_by_name TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  time_remaining_seconds INTEGER,
  used BOOLEAN,
  used_at TIMESTAMPTZ,
  used_by_email TEXT,
  expired BOOLEAN,
  revoked BOOLEAN,
  registration_url TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_base_url TEXT := 'https://sistema-igreja-git-main-gbzinh006s-projects.vercel.app';
BEGIN
  RETURN QUERY
  SELECT 
    rt.id,
    rt.token,
    rt.notes AS observacao,
    rt.created_by_name,
    rt.created_at,
    rt.expires_at,
    CASE 
      WHEN rt.expires_at < NOW() THEN 0
      ELSE EXTRACT(EPOCH FROM (rt.expires_at - NOW()))::INTEGER
    END AS time_remaining_seconds,
    rt.used,
    rt.used_at,
    rt.used_by_email,
    (rt.expires_at < NOW()) AS expired,
    FALSE AS revoked, -- placeholder, você pode adicionar coluna revoked na tabela se quiser
    v_base_url || '/pages/cadastro.html?token=' || rt.token AS registration_url
  FROM registration_tokens rt
  WHERE rt.created_at > NOW() - INTERVAL '7 days'
  ORDER BY rt.created_at DESC;
END;
$$;

-- ============================================================================
-- TESTE
-- ============================================================================
-- SELECT * FROM list_active_tokens();

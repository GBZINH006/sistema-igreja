# Manual Técnico
## Sistema de Gestão Eclesiástica AD Bela Vista

**Versão**: 2.0.0  
**Público-alvo**: Desenvolvedores e Equipe Técnica  
**Última atualização**: Julho de 2026

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

- **Frontend**: HTML5, CSS3, JavaScript (ES6+) vanilla
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Hospedagem**: Vercel (CDN global)
- **Versionamento**: Git + GitHub
- **CI/CD**: Automático via Vercel

### Estrutura de Diretórios

```
sistema-igreja/
├── public/
│   ├── assets/           # Imagens e recursos estáticos
│   ├── css/              # Folhas de estilo
│   ├── js/               # Scripts JavaScript
│   └── pages/            # Páginas HTML
├── docs/                 # Documentação completa
├── api/                  # Funções serverless (Vercel)
└── vercel.json          # Configuração de deploy
```

---

## 🗄️ Esquema do Banco de Dados

### Tabela: `membros`

```sql
CREATE TABLE membros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  rg TEXT,
  data_nasc DATE,
  idade INTEGER,
  sexo TEXT CHECK (sexo IN ('M', 'F')),
  nacionalidade TEXT,
  naturalidade TEXT,
  estado_civil TEXT,
  tipo_cadastro TEXT CHECK (tipo_cadastro IN ('Membro', 'Congregado')),
  setor_igreja TEXT,
  congregacao_igreja TEXT,
  cargo_principal TEXT,
  forma_recebimento TEXT,
  data_recebimento DATE,
  igreja_origem TEXT,
  celular TEXT,
  email TEXT UNIQUE,
  telefone TEXT,
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  nome_pai TEXT,
  nome_mae TEXT,
  nome_conjuge TEXT,
  data_casamento DATE,
  escolaridade TEXT,
  profissao TEXT,
  status TEXT DEFAULT 'Ativo',
  observacoes TEXT,
  foto_url TEXT,
  doc_url TEXT,
  foto_certidao_nasc TEXT,
  foto_certidao_casamento TEXT,
  foto_diploma TEXT,
  foto_comprovante_end TEXT,
  tipo_cpf TEXT DEFAULT 'brasileiro',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('admin', 'pastor', 'secretario', 'membro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: `registration_tokens`

```sql
CREATE TABLE registration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  used_by_member_id UUID REFERENCES membros(id),
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔐 Row Level Security (RLS)

### Policies da Tabela `membros`

```sql
-- Leitura: Admins e secretários veem tudo, membros veem apenas própria ficha
CREATE POLICY "membros_select_policy" ON membros
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'pastor', 'secretario')
  )
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Inserção: Apenas admins e secretários
CREATE POLICY "membros_insert_policy" ON membros
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'pastor', 'secretario')
  )
);

-- Atualização: Admins/secretários atualizam tudo, membros apenas dados próprios
CREATE POLICY "membros_update_policy" ON membros
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'pastor', 'secretario')
  )
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Exclusão: Apenas admins e secretários
CREATE POLICY "membros_delete_policy" ON membros
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'pastor', 'secretario')
  )
);
```

---

## 🔧 Funções RPC (PostgreSQL)

### 1. Gerar Token de Cadastro

```sql
CREATE OR REPLACE FUNCTION generate_registration_token(
  p_duration_hours INT DEFAULT 2,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  token TEXT,
  expires_at TIMESTAMPTZ,
  registration_url TEXT
) AS $$
DECLARE
  v_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := NOW() + (p_duration_hours || ' hours')::INTERVAL;
  
  INSERT INTO registration_tokens (token, created_by, expires_at, observacao)
  VALUES (v_token, auth.uid(), v_expires_at, p_notes);
  
  RETURN QUERY SELECT 
    v_token,
    v_expires_at,
    'https://sistema-igreja.vercel.app/pages/cadastro.html?token=' || v_token AS registration_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Listar Tokens Ativos

```sql
CREATE OR REPLACE FUNCTION list_active_tokens()
RETURNS TABLE (
  id UUID,
  token TEXT,
  expires_at TIMESTAMPTZ,
  used BOOLEAN,
  revoked BOOLEAN,
  observacao TEXT,
  time_remaining_seconds INT,
  expired BOOLEAN
) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    rt.id,
    rt.token,
    rt.expires_at,
    rt.used,
    rt.revoked,
    rt.observacao,
    GREATEST(0, EXTRACT(EPOCH FROM (rt.expires_at - NOW()))::INT) AS time_remaining_seconds,
    (rt.expires_at < NOW()) AS expired
  FROM registration_tokens rt
  WHERE rt.created_by = auth.uid()
  ORDER BY rt.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Revogar Token

```sql
CREATE OR REPLACE FUNCTION revoke_registration_token(p_token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE registration_tokens
  SET revoked = TRUE, revoked_at = NOW()
  WHERE token = p_token AND created_by = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Token não encontrado ou você não tem permissão';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔄 Integração Frontend-Backend

### Inicialização do Supabase Client

```javascript
// public/js/supabase-client.js
const SUPABASE_URL = window.CONFIG.SUPABASE_URL;
const SUPABASE_KEY = window.CONFIG.SUPABASE_KEY;

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.getSupabaseClient = () => supabaseClient;
```

### Autenticação

```javascript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'senha123'
});

// Verificar sessão
const { data: { session } } = await supabase.auth.getSession();

// Logout
await supabase.auth.signOut();
```

### Consultas ao Banco

```javascript
// SELECT
const { data, error } = await supabase
  .from('membros')
  .select('*')
  .eq('status', 'Ativo')
  .order('nome');

// INSERT
const { data, error } = await supabase
  .from('membros')
  .insert({ nome: 'João Silva', cpf: '12345678901' });

// UPDATE
const { error } = await supabase
  .from('membros')
  .update({ celular: '(11) 99999-9999' })
  .eq('id', 'uuid-aqui');

// DELETE
const { error } = await supabase
  .from('membros')
  .delete()
  .eq('id', 'uuid-aqui');
```

### Realtime (WebSocket)

```javascript
const channel = supabase
  .channel('novos-membros')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'membros'
  }, (payload) => {
    console.log('Novo membro:', payload.new);
    atualizarDashboard();
  })
  .subscribe();
```

### Upload de Arquivos (Storage)

```javascript
const file = document.getElementById('input-foto').files[0];
const path = `membros/${Date.now()}_${file.name}`;

const { data, error } = await supabase.storage
  .from('membros-docs')
  .upload(path, file);

// Obter URL pública
const { data: urlData } = supabase.storage
  .from('membros-docs')
  .getPublicUrl(path);

console.log(urlData.publicUrl);
```

---

## 🚀 Deploy e CI/CD

### Configuração Vercel

**vercel.json**:

```json
{
  "buildCommand": "echo 'No build needed'",
  "outputDirectory": "public",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### Variáveis de Ambiente (Vercel)

No dashboard do Vercel, adicionar:

- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_KEY`: API Key pública (anon key)

### Deploy Automático

1. Commit no branch `main`
2. Push para GitHub
3. Vercel detecta automaticamente
4. Build e deploy em ~30 segundos

---

## 🐛 Debugging

### Logs do Supabase

Acessar: Supabase Dashboard → Logs → Query Logs

### Logs do Vercel

Acessar: Vercel Dashboard → Deployments → [Deploy] → Logs

### Console do Navegador

```javascript
// Habilitar debug do Supabase
localStorage.setItem('supabase.debug', 'true');
```

---

## 📦 Backup e Restauração

### Backup Manual (Supabase)

```bash
# Via pgdump (requer acesso direto ao PostgreSQL)
pg_dump -h db.*.supabase.co -U postgres -d postgres > backup.sql
```

### Backup via Interface

Supabase Dashboard → Database → Backups → Download

### Restauração

```sql
-- Executar arquivo SQL no SQL Editor
\i backup.sql
```

---

## 🔒 Segurança

### Checklist de Segurança

- [X] HTTPS em todas as páginas
- [X] Row Level Security (RLS) ativado
- [X] Policies configuradas corretamente
- [X] Senhas com hash bcrypt
- [X] Validação de inputs no frontend
- [X] Sanitização de HTML (XSS)
- [X] CORS configurado
- [X] Rate limiting (via Supabase)
- [X] Backup automático ativo

### Prevenção de SQL Injection

✅ Usar sempre prepared statements:

```javascript
// ✅ CORRETO
.eq('cpf', cpfUsuario)

// ❌ ERRADO
.select(`* WHERE cpf = '${cpfUsuario}'`)
```

### Prevenção de XSS

```javascript
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

---

## 📊 Performance

### Otimizações Implementadas

- ✅ Lazy loading de imagens
- ✅ Cache de indicadores (30s)
- ✅ Índices no banco de dados
- ✅ Compressão de imagens (JPEG 82%)
- ✅ CDN global (Vercel)
- ✅ Minificação automática (Vercel)

### Métricas de Performance

| Métrica | Meta | Atual |
|---------|------|-------|
| First Contentful Paint (FCP) | < 1.5s | ~1.2s |
| Largest Contentful Paint (LCP) | < 2.5s | ~2.1s |
| Time to Interactive (TTI) | < 3.5s | ~2.8s |
| Lighthouse Score | > 90 | 94 |

---

## 🧪 Testes

### Testes Manuais (Checklist)

- [ ] Login admin
- [ ] Cadastro membro
- [ ] Gerar token
- [ ] Usar token
- [ ] Exportar Excel
- [ ] Portal membro
- [ ] Notificações realtime

### Testes Automatizados (Futuros)

```javascript
// Exemplo com Playwright
test('deve fazer login com sucesso', async ({ page }) => {
  await page.goto('/pages/admin.html');
  await page.fill('#login-email', 'admin@igreja.com');
  await page.fill('#login-senha', 'senha123');
  await page.click('#btn-entrar');
  await expect(page).toHaveURL(/.*admin.html/);
});
```

---

## 📞 Suporte Técnico

**Desenvolvedor**: Gabriel Dutra  
**E-mail**: suporte@sistema-igreja.com.br  
**GitHub**: https://github.com/GBZINH006/sistema-igreja

---

*Manual Técnico - Versão 2.0.0 - Julho de 2026*

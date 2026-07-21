// Configuração de build para produção
// Remove source maps e aplica ofuscação ao código

const fs = require('fs');
const path = require('path');

// Configuração
const config = {
  sourceDir: './public',
  outputDir: './dist',
  removeSourceMaps: true,
  removeComments: true,
  minifyHTML: true,
  obfuscateJS: false, // Requer terser ou uglify-js
  excludeFiles: [
    'node_modules/**',
    '**/*.map',
    '**/*.md',
    '.git/**'
  ]
};

/**
 * Remove comentários de source map do código JS
 */
function removeSourceMapComments(code) {
  // Remove //# sourceMappingURL=...
  code = code.replace(/\/\/# sourceMappingURL=.*/g, '');
  
  // Remove //@ sourceMappingURL=... (sintaxe antiga)
  code = code.replace(/\/\/@ sourceMappingURL=.*/g, '');
  
  // Remove /*# sourceMappingURL=... */
  code = code.replace(/\/\*# sourceMappingURL=.*\*\//g, '');
  
  return code;
}

/**
 * Remove comentários gerais (opcional)
 */
function removeComments(code, type = 'js') {
  if (type === 'js') {
    // Remove comentários de linha
    code = code.replace(/\/\/.*/g, '');
    
    // Remove comentários de bloco (mas preserva alguns importantes)
    code = code.replace(/\/\*(?!\*\/)[\s\S]*?\*\//g, '');
  } else if (type === 'html') {
    // Remove comentários HTML (mas preserva condicionais IE)
    code = code.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');
  }
  
  return code;
}

/**
 * Minifica HTML (básico)
 */
function minifyHTML(html) {
  // Remove espaços em branco extras
  html = html.replace(/\s+/g, ' ');
  
  // Remove espaços entre tags
  html = html.replace(/>\s+</g, '><');
  
  // Remove comentários
  html = removeComments(html, 'html');
  
  return html.trim();
}

/**
 * Processa arquivo JavaScript
 */
function processJSFile(filePath, content) {
  console.log(`📝 Processando JS: ${filePath}`);
  
  // Remove source maps
  if (config.removeSourceMaps) {
    content = removeSourceMapComments(content);
  }
  
  // Remove comentários (opcional)
  if (config.removeComments) {
    content = removeComments(content, 'js');
  }
  
  return content;
}

/**
 * Processa arquivo HTML
 */
function processHTMLFile(filePath, content) {
  console.log(`📝 Processando HTML: ${filePath}`);
  
  // Remove source maps de scripts inline
  if (config.removeSourceMaps) {
    content = removeSourceMapComments(content);
  }
  
  // Minifica (opcional)
  if (config.minifyHTML) {
    content = minifyHTML(content);
  }
  
  return content;
}

/**
 * Copia e processa arquivos
 */
function processDirectory(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const items = fs.readdirSync(srcDir);
  
  items.forEach(item => {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);
    
    // Pula arquivos/pastas excluídos
    if (config.excludeFiles.some(pattern => srcPath.includes(pattern.replace('**/', '')))) {
      return;
    }
    
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      processDirectory(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      const ext = path.extname(srcPath).toLowerCase();
      
      // Processa baseado na extensão
      if (ext === '.js') {
        content = processJSFile(srcPath, content);
      } else if (ext === '.html') {
        content = processHTMLFile(srcPath, content);
      }
      
      // Não copia arquivos .map
      if (ext === '.map') {
        console.log(`🚫 Removendo source map: ${srcPath}`);
        return;
      }
      
      fs.writeFileSync(destPath, content);
      console.log(`✅ Copiado: ${item}`);
    }
  });
}

/**
 * Cria arquivo .htaccess para bloquear source maps
 */
function createHtaccess(destDir) {
  const htaccess = `
# Bloqueia acesso a source maps
<FilesMatch "\\.map$">
  Order allow,deny
  Deny from all
</FilesMatch>

# Bloqueia acesso a arquivos de configuração
<FilesMatch "^\\.(env|git|htaccess)">
  Order allow,deny
  Deny from all
</FilesMatch>

# Headers de segurança
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "DENY"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>

# Desabilita listagem de diretórios
Options -Indexes
`;
  
  fs.writeFileSync(path.join(destDir, '.htaccess'), htaccess.trim());
  console.log('✅ Criado .htaccess com regras de segurança');
}

/**
 * Função principal
 */
function build() {
  console.log('🔨 Iniciando build de produção...\n');
  
  // Limpa diretório de saída
  if (fs.existsSync(config.outputDir)) {
    fs.rmSync(config.outputDir, { recursive: true });
    console.log('🗑️  Diretório dist limpo\n');
  }
  
  // Processa arquivos
  processDirectory(config.sourceDir, config.outputDir);
  
  // Cria .htaccess
  createHtaccess(config.outputDir);
  
  console.log('\n✅ Build concluído com sucesso!');
  console.log(`📦 Arquivos salvos em: ${config.outputDir}`);
  console.log('\n🔒 Proteções aplicadas:');
  console.log('   ✓ Source maps removidos');
  console.log('   ✓ Comentários removidos');
  console.log('   ✓ .htaccess criado');
}

// Executa build
if (require.main === module) {
  build();
}

module.exports = { build, config };

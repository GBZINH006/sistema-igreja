// Cadastro de Membros — lógica do cadastro
// Extraído do cadastro.html para arquivo separado.

(function () {
  const SB_URL = 'https://vclqdzvirnafwplivlfc.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbHFkenZpcm5hZndwbGl2bGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NjY1ODIsImV4cCI6MjA5NDU0MjU4Mn0.KFl1WiE4TU20YfD6SRI57HTDJbnaUNsCn3zww8Usdqc';

  const { createClient } = window.supabase;
  const db = createClient(SB_URL, SB_KEY);

  // ── Validações ───────────────────────────────
  function validarNome(input) {
    const hint = document.createElement('div');
    hint.id = 'hint-nome';
    hint.className = 'hint';

    if (!document.getElementById('hint-nome')) {
      input.parentNode.appendChild(hint);
    }

    const valor = input.value;
    const regex = /^[A-Za-zÀ-ÿ\s]+$/;

    if (!valor) {
      hint.textContent = '';
      input.classList.remove('valido', 'invalido');
      return;
    }

    if (!regex.test(valor)) {
      hint.textContent = '❌ Apenas letras são permitidas.';
      hint.className = 'hint erro';
      input.classList.add('invalido');
      input.classList.remove('valido');
    } else if (valor.trim().split(' ').length < 2) {
      hint.textContent = '⚠️ Digite nome completo.';
      hint.className = 'hint erro';
      input.classList.add('invalido');
      input.classList.remove('valido');
    } else {
      hint.textContent = '✓ Nome válido';
      hint.className = 'hint ok';
      input.classList.add('valido');
      input.classList.remove('invalido');
    }
  }
  window.validarNome = validarNome;

  function bloquearNumeros(input) {
    input.value = input.value.replace(/[0-9]/g, '');
  }
  window.bloquearNumeros = bloquearNumeros;

  // RG: não permitir letras (apenas números)
  function bloquearLetras(input) {
    input.value = input.value.replace(/\D/g, '');
  }
  window.bloquearLetras = bloquearLetras;

  // ── TIPO ────────────────────────────────
  function setTipo(tipo) {
    document.getElementById('tipo_cadastro').value = tipo;
    document.getElementById('btn-membro').classList.toggle('active', tipo === 'Membro');
    document.getElementById('btn-congregado').classList.toggle('active', tipo === 'Congregado');
  }
  window.setTipo = setTipo;

  // ── CÔNJUGE E DIPLOMA ─────────────────
  function toggleConjuge() {
    const ec = document.getElementById('estadoCivil').value;
    const casado = ['Casado(a)', 'União Estável'].includes(ec);
    document.getElementById('campo-conjuge').style.display = casado ? 'block' : 'none';
    document.getElementById('box-certidao-cas').style.display = casado ? 'block' : 'none';
  }
  window.toggleConjuge = toggleConjuge;

  function toggleDiploma() {
    const esc = document.getElementById('escolaridade').value;
    const temDiploma = ['Médio Completo', 'Superior Incompleto', 'Superior Completo', 'Pós-Graduação'].includes(esc);
    document.getElementById('box-diploma').style.display = temDiploma ? 'block' : 'none';
  }
  window.toggleDiploma = toggleDiploma;

  function calcIdade() {
    const val = document.getElementById('dataNasc').value;
    if (!val) { document.getElementById('idade').value = ''; return; }
    const hoje = new Date(), nasc = new Date(val);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    document.getElementById('idade').value = idade >= 0 ? idade : '';
  }
  window.calcIdade = calcIdade;

  // ── MÁSCARAS ─────────────────────────────
  function maskCPF(i) {
    let v = i.value.replace(/\D/g, '');
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    i.value = v;
  }
  window.maskCPF = maskCPF;

  function maskCEP(i) { i.value = i.value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2'); }
  window.maskCEP = maskCEP;

  function maskPhone(i) {
    let v = i.value.replace(/\D/g, '');
    v = v.slice(0, 11);
    if (v.length <= 10) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    else v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    i.value = v;
  }
  window.maskPhone = maskPhone;

  // ── TIPO CPF (BR / ESTRANGEIRO) ────────
  function toggleCPF() {
    const tipo = document.getElementById('tipo_cpf')?.value;
    const cpfInput = document.getElementById('cpf');
    const hint = document.getElementById('hint-cpf');
    const isBR = tipo === 'br';

    if (!cpfInput) return;

    cpfInput.disabled = !isBR;

    if (hint) {
      if (!isBR) {
        hint.textContent = 'Para estrangeiro, informe um documento numérico (sem validação de CPF).';
        hint.className = 'hint';
      } else {
        hint.textContent = '';
        hint.className = 'hint';
      }
    }

    cpfInput.classList.remove('valido', 'invalido');
    if (!isBR) cpfInput.value = '';
  }
  window.toggleCPF = toggleCPF;

  function validarCPF(input) {
    const tipo = document.getElementById('tipo_cpf')?.value;
    if (tipo !== 'br') {
      const hint = document.getElementById('hint-cpf');
      if (hint) {
        hint.textContent = 'Pessoa estrangeira: CPF não obrigatório.';
        hint.className = 'hint';
      }
      input.classList.remove('valido', 'invalido');
      return;
    }

    const hint = document.getElementById('hint-cpf');
    const cpf = input.value.replace(/\D/g, '');

    if (cpf.length < 11) {
      hint.textContent = '';
      input.classList.remove('valido', 'invalido');
      return;
    }

    if (/^(\d)\1+$/.test(cpf)) {
      hint.textContent = 'CPF inválido.';
      hint.className = 'hint erro';
      input.classList.add('invalido');
      input.classList.remove('valido');
      return;
    }

    let soma = 0, r;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    r = (soma * 10) % 11;
    if (r === 10 || r === 11) r = 0;

    if (r !== parseInt(cpf[9])) {
      hint.textContent = 'CPF inválido.';
      hint.className = 'hint erro';
      input.classList.add('invalido');
      input.classList.remove('valido');
      return;
    }

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    r = (soma * 10) % 11;
    if (r === 10 || r === 11) r = 0;

    if (r !== parseInt(cpf[10])) {
      hint.textContent = 'CPF inválido.';
      hint.className = 'hint erro';
      input.classList.add('invalido');
      input.classList.remove('valido');
      return;
    }

    hint.textContent = '✓ CPF válido';
    hint.className = 'hint ok';
    input.classList.add('valido');
    input.classList.remove('invalido');
  }
  window.validarCPF = validarCPF;

  function validarRG(input) {
    const hint = document.getElementById('hint-rg');
    const v = input.value.replace(/\D/g, '');

    if (!v) {
      if (hint) hint.textContent = '';
      input.classList.remove('valido', 'invalido');
      return;
    }

    // RG sem letras: aceitar apenas números com 7 a 9 dígitos
    if (v.length < 7 || v.length > 9) {
      if (hint) {
        hint.textContent = 'RG deve ter 7 a 9 dígitos.';
        hint.className = 'hint erro';
      }
      input.classList.add('invalido');
      input.classList.remove('valido');
      return;
    }

    // Algoritmo de DV (heurística) baseado em alguns modelos (ex: SP):
    // - último dígito é o DV
    // - calcula soma ponderada dos dígitos do número base
    // - DV = (soma % 11), convertendo 10/11 para 0
    const base = v.slice(0, -1);
    const dvInformado = parseInt(v[v.length - 1], 10);

    const baseNum = base.split('').map(d => parseInt(d, 10));
    if (baseNum.some(Number.isNaN)) {
      if (hint) {
        hint.textContent = 'RG inválido.';
        hint.className = 'hint erro';
      }
      input.classList.add('invalido');
      input.classList.remove('valido');
      return;
    }

    let soma = 0;
    for (let i = 0; i < baseNum.length; i++) {
      soma += baseNum[i] * (baseNum.length - i + 1);
    }

    let dvCalculado = soma % 11;
    if (dvCalculado === 10 || dvCalculado === 11) dvCalculado = 0;

    if (dvCalculado === dvInformado) {
      if (hint) {
        hint.textContent = '✓ RG válido';
        hint.className = 'hint ok';
      }
      input.classList.add('valido');
      input.classList.remove('invalido');
    } else {
      if (hint) {
        hint.textContent = 'RG inválido (DV incorreto).';
        hint.className = 'hint erro';
      }
      input.classList.add('invalido');
      input.classList.remove('valido');
    }
  }
  window.validarRG = validarRG;

  function validarTelefone(input, hintId, obrigatorio = false) {
    const hint = document.getElementById(hintId);
    if (!hint) return;
    const v = input.value.replace(/\D/g, '');

    if (!v && !obrigatorio) {
      hint.textContent = '';
      input.classList.remove('valido', 'invalido');
      return;
    }

    if (v.length < 10 || v.length > 11) {
      if (obrigatorio || v.length > 0) {
        hint.textContent = 'Número incompleto (DDD + número).';
        hint.className = 'hint erro';
        input.classList.add('invalido');
        input.classList.remove('valido');
      }
    } else {
      hint.textContent = '✓ Válido';
      hint.className = 'hint ok';
      input.classList.add('valido');
      input.classList.remove('invalido');
    }
  }
  window.validarTelefone = validarTelefone;

  // ── VIACEP ──────────────────────────────
  async function buscarCEP() {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    const hint = document.getElementById('hint-cep');
    const load = document.getElementById('cep-loading');
    if (cep.length !== 8) return;
    load.classList.add('ativo');
    hint.textContent = '';
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      load.classList.remove('ativo');
      if (data.erro) {
        hint.textContent = 'CEP não encontrado.';
        hint.className = 'hint erro';
        return;
      }
      if (data.logradouro) document.getElementById('endereco').value = data.logradouro;
      if (data.bairro) document.getElementById('bairro').value = data.bairro;
      if (data.localidade && data.uf) document.getElementById('cidade_estado').value = `${data.localidade} - ${data.uf}`;
      hint.textContent = `✓ ${data.localidade} - ${data.uf}`;
      hint.className = 'hint ok';
    } catch (e) {
      load.classList.remove('ativo');
      hint.textContent = 'Erro ao buscar CEP.';
      hint.className = 'hint erro';
    }
  }
  window.buscarCEP = buscarCEP;

  // ── PROGRESSO ─────────────────────────
  function calcProgress() {
    const campos = ['nome', 'cpf', 'celular', 'dataNasc', 'endereco', 'setor_igreja', 'forma_recebimento', 'talentos'];
    const filled = campos.filter(id => document.getElementById(id)?.value?.trim()).length;
    const pct = Math.round((filled / campos.length) * 100);
    document.getElementById('progress-fill').style.width = pct + '%';
    const label = document.getElementById('progress-label');
    const pctEl = document.getElementById('progress-pct');
    if (pct === 0) label.textContent = 'Preencha o formulário';
    else if (pct < 50) label.textContent = 'Continue preenchendo…';
    else if (pct < 100) label.textContent = 'Quase lá!';
    else label.textContent = 'Pronto para enviar!';
    pctEl.textContent = pct > 0 ? pct + '%' : '';
  }
  document.addEventListener('input', calcProgress);
  document.addEventListener('change', calcProgress);

  // ── TOAST ─────────────────────────────
  function toast(msg, tipo = '', dur = 3200) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = tipo ? `show ${tipo}` : 'show';
    setTimeout(() => t.className = '', dur);
  }
  window.toast = toast;

  // ── PREVIEW FOTO ─────────────────────
  function previewFoto(input, previewId, placeholderId, boxId) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const prev = document.getElementById(previewId);
      prev.src = e.target.result;
      prev.style.display = 'block';
      document.getElementById(placeholderId).style.display = 'none';
      document.getElementById(boxId).classList.add('tem-foto');
    };
    reader.readAsDataURL(file);
  }
  window.previewFoto = previewFoto;

  function previewFotoComprovante(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const prev = document.getElementById('prev-comprovante');
      prev.src = e.target.result;
      prev.style.display = 'block';
      document.getElementById('box-comprovante').classList.add('tem-foto');
    };
    reader.readAsDataURL(file);
  }
  window.previewFotoComprovante = previewFotoComprovante;

  async function comprimirImagem(file, maxDim = 1000) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.84);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function uploadArquivo(inputId, pasta, publico = false) {
    const input = document.getElementById(inputId);
    if (!input || !input.files[0]) return null;

    const file = input.files[0];

    try {
      let uploadFile;

      if (file.type.startsWith('image/')) {
        uploadFile = await comprimirImagem(file);
      } else {
        uploadFile = file;
      }

      const membroId = crypto.randomUUID();
      const path = `${membroId}/${pasta}/${nome}`;

      const bucket = publico ? 'membros-public' : 'membros-docs';

      const { error } = await db.storage
        .from(bucket)
        .upload(path, uploadFile, {
          contentType: file.type.startsWith('image/') ? 'image/jpeg' : 'application/pdf',
          upsert: true
        });

      if (error) {
        console.warn('Storage:', error.message);
        return null;
      }

      if (publico) {
        const { data } = db.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
      }

      const { data, error: signedError } = await db.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60 * 24 * 7);

      if (signedError) {
        console.warn('Signed URL:', signedError.message);
        return null;
      }

      return data.signedUrl;

    } catch (e) {
      console.warn(e);
      return null;
    }
  }
  window.uploadArquivo = uploadArquivo;

  // ── ASSINATURA DIGITAL ─────────────────
  const canvas = document.getElementById('canvas-assinatura');
  const ctx = canvas.getContext('2d');

  let desenhando = false;
  let assinadoPeloMenos = false;
  let ultimoPonto = null;

  ctx.strokeStyle = '#2c1f14';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function getPonto(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  canvas.addEventListener('mousedown', e => {
    desenhando = true;
    ultimoPonto = getPonto(e);
  });

  canvas.addEventListener('mousemove', e => {
    if (!desenhando) return;
    const p = getPonto(e);
    ctx.beginPath();
    ctx.moveTo(ultimoPonto.x, ultimoPonto.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ultimoPonto = p;

    assinadoPeloMenos = true;
    document.getElementById('assinatura-wrap').classList.add('assinado');
    document.getElementById('assinatura-hint').textContent = '✓ Assinatura registrada';
    document.getElementById('hint-assinatura').textContent = '';
  });

  canvas.addEventListener('mouseup', () => { desenhando = false; });
  canvas.addEventListener('mouseleave', () => { desenhando = false; });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    desenhando = true;
    ultimoPonto = getPonto(e);
  });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!desenhando) return;
    const p = getPonto(e);

    ctx.beginPath();
    ctx.moveTo(ultimoPonto.x, ultimoPonto.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    ultimoPonto = p;

    assinadoPeloMenos = true;
    document.getElementById('assinatura-wrap').classList.add('assinado');
    document.getElementById('assinatura-hint').textContent = '✓ Assinatura registrada';
  });

  canvas.addEventListener('touchend', () => { desenhando = false; });

  function limparAssinatura() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    assinadoPeloMenos = false;
    document.getElementById('assinatura-wrap').classList.remove('assinado');
    document.getElementById('assinatura-hint').textContent = '✍️ Assine no espaço acima';
  }
  window.limparAssinatura = limparAssinatura;

  async function uploadAssinatura() {
    if (!assinadoPeloMenos) return null;

    return new Promise(resolve => {
      canvas.toBlob(async blob => {
        if (!blob) { resolve(null); return; }

        const path = `assinaturas/${Date.now()}_${Math.random().toString(36).slice(2)}.png`;

        const { error } = await db.storage
          .from('membros-docs')
          .upload(path, blob, { contentType: 'image/png', upsert: true });

        if (error) {
          console.warn(error.message);
          resolve(null);
          return;
        }

        const { data, error: signedError } = await db.storage
          .from('membros-docs')
          .createSignedUrl(path, 60 * 60 * 24 * 7);

        if (signedError) {
          console.warn(signedError.message);
          resolve(null);
          return;
        }

        resolve(data.signedUrl);
      }, 'image/png');
    });
  }

  // ── Coleta dados ───────────────────────
  function coletarDados() {
    return {
      tipo_cadastro: document.getElementById('tipo_cadastro').value,
      nome: document.getElementById('nome').value.trim(),
      rg: document.getElementById('rg').value.trim(),
      cpf: document.getElementById('cpf')?.value.trim(),
      tipo_cpf: document.getElementById('tipo_cpf')?.value,
      data_nasc: document.getElementById('dataNasc').value || null,
      idade: parseInt(document.getElementById('idade').value) || null,
      sexo: document.querySelector('input[name="sexo"]:checked')?.value || 'M',
      tipo_sanguineo: document.getElementById('tipo_sanguineo').value,
      escolaridade: document.getElementById('escolaridade').value,
      estado_civil: document.getElementById('estadoCivil').value,
      conjuge_nome: document.getElementById('conjuge_nome').value?.trim() || '',
      data_casamento: document.getElementById('dataCasamento').value || null,
      cep: document.getElementById('cep').value.trim(),
      bairro: document.getElementById('bairro').value.trim(),
      endereco: document.getElementById('endereco').value.trim(),
      cidade_estado: document.getElementById('cidade_estado').value.trim(),
      fone_res: document.getElementById('fone_res').value.trim(),
      fone_com: document.getElementById('fone_com').value.trim(),
      celular: document.getElementById('celular').value.trim(),
      email: document.getElementById('email').value.trim(),
      ocupacao: document.getElementById('ocupacao').value.trim(),
      empresa: document.getElementById('empresa').value.trim(),
      forma_recebimento: document.getElementById('forma_recebimento').value,
      setor_igreja: document.getElementById('setor_igreja').value?.trim?.() || document.getElementById('setor_igreja')?.value?.trim?.() || document.getElementById('setor_igreja').value.trim(),
      congregacao_igreja: document.getElementById('congregacao_igreja').value.trim(),
      igreja_anterior: document.getElementById('igreja_anterior').value.trim(),
      igreja_cidade: document.getElementById('igreja_cidade').value.trim(),
      igreja_pastor: document.getElementById('igreja_pastor').value.trim(),
      data_batismo_aguas: document.getElementById('data_batismo_aguas').value || null,
      data_batismo_es: document.getElementById('data_batismo_es').value || null,
      data_aprovacao: document.getElementById('data_aprovacao').value || null,
      cargo_principal: document.getElementById('cargo_principal').value.trim(),
      outras_funcoes: document.getElementById('outras_funcoes').value.trim(),
      qtd_filhos: parseInt(document.getElementById('qtd_filhos').value) || 0,
      nome_dep1: document.getElementById('nome_dep1').value.trim(),
      parentesco_dep1: document.getElementById('parentesco_dep1').value.trim(),
      nome_dep2: document.getElementById('nome_dep2').value.trim(),
      parentesco_dep2: document.getElementById('parentesco_dep2').value.trim(),
      nome_dep3: document.getElementById('nome_dep3').value.trim(),
      parentesco_dep3: document.getElementById('parentesco_dep3').value.trim(),
      talentos: document.getElementById('talentos').value.trim(),
      tem_computador: document.querySelector('input[name="tem_computador"]:checked')?.value || 'Sim',
      tem_internet: document.querySelector('input[name="tem_internet"]:checked')?.value || 'Sim',
      status: 'Ativo'
    };
  }
  window.coletarDados = coletarDados;

  function validar(dados) {
    let ok = true;

    const required = {
      nome: document.getElementById('nome'),
      cpf: null,
      celular: document.getElementById('celular')
    };

    const tipo = document.getElementById('tipo_cpf')?.value;
    if (tipo === 'br') required.cpf = document.getElementById('cpf');

    Object.entries(required).forEach(([k, el]) => {
      if (!el) return;
      if (!dados[k]) { el.classList.add('invalid'); ok = false; }
      else el.classList.remove('invalid');
    });

    // CPF deve estar válido apenas para brasileiros
    if (dados.cpf && document.getElementById('hint-cpf')?.textContent?.includes('inválido')) {
      toast('⚠️ Verifique o CPF informado.', 'erro');
      ok = false;
    }

    const celDigits = dados.celular.replace(/\D/g, '');
    if (celDigits.length > 0 && celDigits.length < 10) {
      document.getElementById('celular').classList.add('invalid');
      ok = false;
    }

    if (!assinadoPeloMenos) {
      document.getElementById('hint-assinatura').textContent = '⚠️ Assinatura obrigatória.';
      document.getElementById('hint-assinatura').className = 'hint erro';
      ok = false;
    }

    return ok;
  }
  window.validar = validar;

  async function salvarMembro() {
    const dados = coletarDados();

    if (!validar(dados)) {
      toast('⚠️ Preencha os campos obrigatórios.', 'erro');
      document.querySelector('.invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (!assinadoPeloMenos) document.getElementById('canvas-assinatura').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const btn = document.getElementById('btn-salvar');
    btn.innerHTML = '<span class="spin"></span> Enviando…';
    btn.disabled = true;

    try {
      toast('📤 Enviando fotos e documentos…');

      const [foto_url, doc_url, foto_certidao_nasc, foto_certidao_casamento, foto_diploma, foto_comprovante_end, assinatura_url] = await Promise.all([
        uploadArquivo('inp-foto-membro', 'fotos'),
        uploadArquivo('inp-foto-doc', 'docs'),
        uploadArquivo('inp-certidao-nasc', 'certidoes'),
        uploadArquivo('inp-certidao-cas', 'certidoes'),
        uploadArquivo('inp-diploma', 'diplomas'),
        uploadArquivo('inp-comprovante', 'comprovantes'),
        uploadAssinatura(),
      ]);

      if (foto_url) dados.foto_url = foto_url;
      if (doc_url) dados.doc_url = doc_url;
      if (foto_certidao_nasc) dados.foto_certidao_nasc = foto_certidao_nasc;
      if (foto_certidao_casamento) dados.foto_certidao_casamento = foto_certidao_casamento;
      if (foto_diploma) dados.foto_diploma = foto_diploma;
      if (foto_comprovante_end) dados.foto_comprovante_end = foto_comprovante_end;
      if (assinatura_url) dados.assinatura_url = assinatura_url;

      const { error } = await db.from('membros').insert([dados]);
      if (error) throw error;

      document.getElementById('app').style.display = 'none';
      document.getElementById('tela-sucesso').classList.add('show');
      window.scrollTo(0, 0);
    } catch (e) {
      console.error(e);
      toast('❌ Erro ao enviar. Tente novamente.', 'erro');
      btn.innerHTML = '✝ Enviar Cadastro';
      btn.disabled = false;
    }
  }

  window.salvarMembro = salvarMembro;

  function novoCadastro() {
    document.getElementById('tela-sucesso').classList.remove('show');
    document.getElementById('app').style.display = 'block';
    document.querySelectorAll('input[type=text],input[type=email],input[type=number],input[type=date],textarea,select').forEach(el => el.value = '');
    document.getElementById('tipo_cadastro').value = 'Membro';
    document.getElementById('btn-membro').classList.add('active');
    document.getElementById('btn-congregado').classList.remove('active');
    document.querySelector('input[name="sexo"][value="M"]').checked = true;
    document.querySelector('input[name="tem_computador"][value="Sim"]').checked = true;
    document.querySelector('input[name="tem_internet"][value="Sim"]').checked = true;
    document.getElementById('campo-conjuge').style.display = 'none';
    document.getElementById('box-certidao-cas').style.display = 'none';
    document.getElementById('box-diploma').style.display = 'none';

    ['foto-membro', 'foto-doc', 'certidao-nasc', 'certidao-cas', 'diploma'].forEach(t => {
      const prev = document.getElementById('prev-' + t);
      const ph = document.getElementById('ph-' + t);
      const box = document.getElementById('box-' + t);
      if (prev) prev.style.display = 'none';
      if (ph) ph.style.display = '';
      if (box) box.classList.remove('tem-foto');
      const inp = document.getElementById('inp-' + t);
      if (inp) inp.value = '';
      const cam = document.getElementById('inp-cam-' + t);
      if (cam) cam.value = '';
    });

    document.getElementById('prev-comprovante').style.display = 'none';
    document.getElementById('box-comprovante').classList.remove('tem-foto');

    limparAssinatura();
    document.getElementById('btn-salvar').innerHTML = '✝ Enviar Cadastro';
    document.getElementById('btn-salvar').disabled = false;
    calcProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.novoCadastro = novoCadastro;

})();


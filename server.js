import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// ============================================
// OPEN-WA (WA-AUTOMATE) PROXY ENDPOINTS
// Permite conectar a um servidor open-wa / wa-automate local ou remoto
// ============================================
app.post('/api/openwa/test', async (req, res) => {
  const { serverUrl, apiKey, sessionId } = req.body;
  if (!serverUrl) {
    return res.status(400).json({ success: false, error: 'URL do servidor open-wa não informada.' });
  }

  const cleanUrl = serverUrl.replace(/\/+$/, '');
  const targetUrl = `${cleanUrl}/checkHost`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const headers = {};
    if (apiKey) headers['api_key'] = apiKey;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    res.json({
      success: response.ok,
      status: response.status,
      data: data || 'Host ativo'
    });
  } catch (err) {
    clearTimeout(timeoutId);
    res.status(502).json({
      success: false,
      error: `Não foi possível conectar ao servidor Open-WA em ${serverUrl}: ${err.message}`
    });
  }
});

app.post('/api/openwa/send-text', async (req, res) => {
  const { serverUrl, apiKey, to, content, pass_filter } = req.body;
  if (!serverUrl || !to || !content) {
    return res.status(400).json({ success: false, error: 'Parâmetros serverUrl, to e content são obrigatórios.' });
  }

  const cleanUrl = serverUrl.replace(/\/+$/, '');
  const targetUrl = `${cleanUrl}/sendText`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    // Formatar destinatário para WhatsApp ID (ex.: 5511999999999@c.us)
    let chatId = String(to).replace(/\D/g, '');
    if (!chatId.includes('@c.us') && !chatId.includes('@g.us')) {
      chatId = `${chatId}@c.us`;
    }

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['api_key'] = apiKey;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        args: {
          to: chatId,
          content: content,
          pass_filter: pass_filter ?? true
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: typeof data === 'string' ? data : JSON.stringify(data)
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (err) {
    clearTimeout(timeoutId);
    res.status(502).json({
      success: false,
      error: `Erro ao enviar via Open-WA: ${err.message}`
    });
  }
});

app.post('/api/openwa/send-image', async (req, res) => {
  const { serverUrl, apiKey, to, file, filename, caption } = req.body;
  if (!serverUrl || !to || !file) {
    return res.status(400).json({ success: false, error: 'Parâmetros serverUrl, to e file (base64) são obrigatórios.' });
  }

  const cleanUrl = serverUrl.replace(/\/+$/, '');
  const targetUrl = `${cleanUrl}/sendImage`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    let chatId = String(to).replace(/\D/g, '');
    if (!chatId.includes('@c.us') && !chatId.includes('@g.us')) {
      chatId = `${chatId}@c.us`;
    }

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['api_key'] = apiKey;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        args: {
          to: chatId,
          file: file,
          filename: filename || 'imagem.jpg',
          caption: caption || ''
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: typeof data === 'string' ? data : JSON.stringify(data)
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (err) {
    clearTimeout(timeoutId);
    res.status(502).json({
      success: false,
      error: `Erro ao enviar imagem via Open-WA: ${err.message}`
    });
  }
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Feitosa CRM' });
});

// ============================================
// DIAGNÓSTICO TÉCNICO PÚBLICO & SEGURO
// Permite que o cliente externo responda ao questionário sem qualquer acesso ao CRM
// e armazena os dados vinculados diretamente ao lead.
// ============================================
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}
const DIAGNOSTICOS_FILE = path.join(DATA_DIR, 'diagnosticos.json');

function lerDiagnosticosArquivo() {
  try {
    if (fs.existsSync(DIAGNOSTICOS_FILE)) {
      const conteudo = fs.readFileSync(DIAGNOSTICOS_FILE, 'utf-8');
      return JSON.parse(conteudo || '{}');
    }
  } catch (err) {
    console.error('Erro ao ler diagnosticos.json:', err.message);
  }
  return {};
}

function salvarDiagnosticosArquivo(dados) {
  try {
    fs.writeFileSync(DIAGNOSTICOS_FILE, JSON.stringify(dados, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar diagnosticos.json:', err.message);
  }
}

// Obter dados básicos públicos do lead (apenas nome/empresa, protegendo todo o resto)
app.get('/api/diagnostico/:id', async (req, res) => {
  const leadId = req.params.id;
  if (!leadId) {
    return res.status(400).json({ success: false, error: 'ID do lead não informado' });
  }

  // Tenta consultar o nome da empresa via Supabase (com anon key)
  let empresaNome = '';
  try {
    const supabaseUrl = 'https://gewoitwpwlizavmmcrll.supabase.co/rest/v1/leads?id=eq.' + encodeURIComponent(leadId) + '&select=id,empresa';
    const sResp = await fetch(supabaseUrl, {
      headers: {
        'apikey': 'sb_publishable_i6tZP_a2Ebrk6nKNvOWWXQ_BPG0LGvk',
        'Authorization': 'Bearer sb_publishable_i6tZP_a2Ebrk6nKNvOWWXQ_BPG0LGvk'
      }
    });
    if (sResp.ok) {
      const items = await sResp.json();
      if (items && items.length > 0) {
        empresaNome = items[0].empresa || '';
      }
    }
  } catch (e) {
    // Continua mesmo se supabase falhar
  }

  // Se não achou no Supabase, verifica se já existe diagnóstico salvo com o nome
  const diagnosticos = lerDiagnosticosArquivo();
  if (!empresaNome && diagnosticos[leadId] && diagnosticos[leadId].empresa) {
    empresaNome = diagnosticos[leadId].empresa;
  }

  res.json({
    success: true,
    lead: {
      id: leadId,
      empresa: empresaNome || ''
    },
    respondido: !!(diagnosticos[leadId] && diagnosticos[leadId].respondido)
  });
});

// Registrar resposta pública do questionário enviada pelo cliente
app.post('/api/diagnostico/:id', async (req, res) => {
  const leadId = req.params.id;
  const { respostas, empresa, contatoNome, contatoTel, contatoEmail } = req.body;

  if (!leadId || !respostas) {
    return res.status(400).json({ success: false, error: 'Dados incompletos do diagnóstico.' });
  }

  const timestamp = new Date().toISOString();
  const diagnosticos = lerDiagnosticosArquivo();

  const registro = {
    leadId,
    empresa: empresa || (diagnosticos[leadId]?.empresa || ''),
    contatoNome: contatoNome || '',
    contatoTel: contatoTel || '',
    contatoEmail: contatoEmail || '',
    respostas,
    respondido: true,
    respondidoEm: timestamp,
    respondidoPor: 'cliente',
    sincronizadoNoCrm: false
  };

  diagnosticos[leadId] = registro;
  salvarDiagnosticosArquivo(diagnosticos);

  // Tenta registrar atividade no histórico do lead no Supabase
  try {
    const supabaseUrl = 'https://gewoitwpwlizavmmcrll.supabase.co/rest/v1/leads?id=eq.' + encodeURIComponent(leadId) + '&select=id,historico';
    const sResp = await fetch(supabaseUrl, {
      headers: {
        'apikey': 'sb_publishable_i6tZP_a2Ebrk6nKNvOWWXQ_BPG0LGvk',
        'Authorization': 'Bearer sb_publishable_i6tZP_a2Ebrk6nKNvOWWXQ_BPG0LGvk'
      }
    });
    if (sResp.ok) {
      const items = await sResp.json();
      if (items && items.length > 0) {
        const lead = items[0];
        let historico = Array.isArray(lead.historico) ? lead.historico : [];
        const hojeStr = new Date().toISOString().split('T')[0];
        const horaStr = new Date().toTimeString().slice(0, 5);
        historico.unshift({
          data: hojeStr,
          hora: horaStr,
          tipo: 'Diagnóstico',
          descricao: `Diagnóstico Técnico preenchido pelo cliente via link exclusivo (${contatoNome || 'Contato da Empresa'}).`
        });

        await fetch(supabaseUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'sb_publishable_i6tZP_a2Ebrk6nKNvOWWXQ_BPG0LGvk',
            'Authorization': 'Bearer sb_publishable_i6tZP_a2Ebrk6nKNvOWWXQ_BPG0LGvk',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ historico })
        });
      }
    }
  } catch (e) {
    console.warn('Erro ao atualizar historico no Supabase:', e.message);
  }

  res.json({
    success: true,
    message: 'Diagnóstico técnico registrado com sucesso e vinculado ao lead.'
  });
});

// Endpoint exclusivo para o CRM ler todos os diagnósticos preenchidos
app.get('/api/diagnosticos', (req, res) => {
  const diagnosticos = lerDiagnosticosArquivo();
  res.json({
    success: true,
    diagnosticos
  });
});

// Endpoint para marcar como sincronizado
app.post('/api/diagnosticos/sync-ack', (req, res) => {
  const { leadIds } = req.body;
  if (Array.isArray(leadIds) && leadIds.length > 0) {
    const diagnosticos = lerDiagnosticosArquivo();
    leadIds.forEach(id => {
      if (diagnosticos[id]) {
        diagnosticos[id].sincronizadoNoCrm = true;
      }
    });
    salvarDiagnosticosArquivo(diagnosticos);
  }
  res.json({ success: true });
});

// Serve static assets from project root
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Route handler for clean URLs and fallback
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  const htmlPath = filePath + '.html';
  if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
    return res.sendFile(htmlPath);
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Feitosa CRM running at http://0.0.0.0:${PORT}`);
});

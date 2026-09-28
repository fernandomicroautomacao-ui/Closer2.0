// ============================================
// WHATSAPP - MODELOS DE MENSAGEM
// ============================================
let wmImagemAtual = null; // base64 (JPEG) da imagem do modelo em edição

function abrirModalModeloWhatsapp(modeloId = null) {
    const form = document.getElementById('whatsappModeloForm');
    form.reset();
    wmImagemAtual = null;

    if (modeloId) {
        const modelo = modelosWhatsapp.find(m => m.id === modeloId);
        if (!modelo) return;
        document.getElementById('whatsappModeloModalTitle').textContent = 'Editar Modelo';
        document.getElementById('wmId').value = modeloId;
        document.getElementById('wmNome').value = modelo.nome || '';
        document.getElementById('wmConteudo').value = modelo.conteudo || '';
        wmImagemAtual = modelo.imagem || null;
    } else {
        document.getElementById('whatsappModeloModalTitle').textContent = 'Novo Modelo de WhatsApp';
        document.getElementById('wmId').value = '';
    }

    atualizarPreviewImagemModeloWhatsapp();
    abrirModal('whatsappModeloModal');
}

// ---------- Imagem do modelo (upload por arquivo ou colar do clipboard) ----------
function atualizarPreviewImagemModeloWhatsapp() {
    const wrap = document.getElementById('wmImagemPreviewWrap');
    const placeholder = document.getElementById('wmImagemPlaceholder');
    const img = document.getElementById('wmImagemPreview');
    if (wmImagemAtual) {
        img.src = wmImagemAtual;
        wrap.style.display = 'block';
        placeholder.style.display = 'none';
    } else {
        wrap.style.display = 'none';
        placeholder.style.display = 'block';
    }
}

function redimensionarImagem(file, maxLado, qualidade) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let largura = img.width;
                let altura = img.height;
                if (largura > maxLado || altura > maxLado) {
                    if (largura > altura) {
                        altura = Math.round(altura * maxLado / largura);
                        largura = maxLado;
                    } else {
                        largura = Math.round(largura * maxLado / altura);
                        altura = maxLado;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = largura;
                canvas.height = altura;
                canvas.getContext('2d').drawImage(img, 0, 0, largura, altura);
                resolve(canvas.toDataURL('image/jpeg', qualidade));
            };
            img.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
        reader.readAsDataURL(file);
    });
}

async function processarImagemModeloWhatsapp(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) {
        showToast('Selecione um arquivo de imagem.', 'error');
        return;
    }
    try {
        wmImagemAtual = await redimensionarImagem(file, 1280, 0.82);
        atualizarPreviewImagemModeloWhatsapp();
    } catch (e) {
        showToast('Não foi possível carregar essa imagem.', 'error');
    }
    document.getElementById('wmImagemInput').value = '';
}

function handlePasteImagemModeloWhatsapp(event) {
    const itens = event.clipboardData && event.clipboardData.items;
    if (!itens) return;
    for (const item of itens) {
        if (item.type && item.type.startsWith('image/')) {
            event.preventDefault();
            processarImagemModeloWhatsapp(item.getAsFile());
            return;
        }
    }
}

function removerImagemModeloWhatsapp() {
    wmImagemAtual = null;
    atualizarPreviewImagemModeloWhatsapp();
}

function salvarModeloWhatsapp(event) {
    event.preventDefault();
    const id = document.getElementById('wmId').value;
    const nome = document.getElementById('wmNome').value.trim();
    const conteudo = document.getElementById('wmConteudo').value.trim();

    if (!nome || !conteudo) {
        showToast('Preencha todos os campos!', 'error');
        return;
    }

    if (id) {
        const index = modelosWhatsapp.findIndex(m => m.id === id);
        if (index !== -1) {
            modelosWhatsapp[index] = { ...modelosWhatsapp[index], nome, conteudo, imagem: wmImagemAtual };
            showToast('Modelo atualizado!');
        }
    } else {
        modelosWhatsapp.push({ id: gerarId(), nome, conteudo, imagem: wmImagemAtual });
        showToast('Modelo criado!');
    }

    salvarDados();
    fecharModal('whatsappModeloModal');
    renderizarWhatsapp();
}

function excluirModeloWhatsapp(id) {
    if (!confirm('Remover este modelo?')) return;
    modelosWhatsapp = modelosWhatsapp.filter(m => m.id !== id);
    salvarDados();
    renderizarWhatsapp();
    showToast('Modelo removido!');
}

function inserirTagWhatsapp(tag) {
    const textarea = document.getElementById('wmConteudo');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    textarea.value = text.substring(0, start) + tag + text.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + tag.length;
}

// ============================================
// WHATSAPP - ENVIO (via link wa.me)
// ============================================
let wEnvioImagemAtual = null; // base64 (JPEG) da imagem do modelo selecionado no envio

function abrirEnvioWhatsApp(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    if (usuarioAtual.papel !== 'admin' && lead.usuarioId !== usuarioAtual.id) {
        showToast('Você não tem permissão para enviar WhatsApp deste lead.', 'error');
        return;
    }

    document.getElementById('wEnvioLeadId').value = leadId;
    document.getElementById('wEnvioEmpresa').textContent = lead.empresa;
    document.getElementById('wEnvioTelefone').value = lead.whatsapp || lead.telefone || '';

    const select = document.getElementById('wEnvioModelo');
    select.innerHTML = '<option value="">Selecionar modelo</option>' +
        modelosWhatsapp.map(m => `<option value="${m.id}">${m.nome}</option>`).join('');

    document.getElementById('wEnvioConteudo').value = '';
    wEnvioImagemAtual = null;
    document.getElementById('wEnvioImagemWrap').style.display = 'none';

    abrirModal('whatsappModal');
}

function previsualizarEnvioWhatsApp() {
    const modeloId = document.getElementById('wEnvioModelo').value;
    const leadId = document.getElementById('wEnvioLeadId').value;
    const lead = leads.find(l => l.id === leadId);

    if (!modeloId || !lead) return;

    const modelo = modelosWhatsapp.find(m => m.id === modeloId);
    if (!modelo) return;

    const conteudo = typeof whatsappFilaVariaveis === 'function'
        ? whatsappFilaVariaveis(modelo.conteudo, lead)
        : modelo.conteudo
            .replace(/\{\{empresa\}\}/g, lead.empresa || '')
            .replace(/\{\{decisor\}\}/g, lead.decisor || '')
            .replace(/\{\{valor\}\}/g, formatarMoeda(lead.valor || 0))
            .replace(/\{\{telefone\}\}/g, lead.telefone || '');

    document.getElementById('wEnvioConteudo').value = conteudo;

    wEnvioImagemAtual = modelo.imagem || null;
    const wrap = document.getElementById('wEnvioImagemWrap');
    if (wEnvioImagemAtual) {
        document.getElementById('wEnvioImagemPreview').src = wEnvioImagemAtual;
        wrap.style.display = 'block';
    } else {
        wrap.style.display = 'none';
    }
}

function baixarImagemModeloWhatsapp() {
    if (!wEnvioImagemAtual) return;
    const a = document.createElement('a');
    a.href = wEnvioImagemAtual;
    a.download = 'imagem-whatsapp.jpg';
    a.click();
}

// Converte a imagem (JPEG) pra PNG e copia pra área de transferência do sistema,
// pra colar (Ctrl+V) direto na conversa do WhatsApp Web que abrir.
async function copiarImagemParaAreaTransferencia(dataUrlJpeg) {
    if (!navigator.clipboard || !window.ClipboardItem) return false;
    try {
        const pngBlob = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Falha ao converter imagem.')), 'image/png');
            };
            img.onerror = () => reject(new Error('Falha ao carregar imagem.'));
            img.src = dataUrlJpeg;
        });
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
        return true;
    } catch (e) {
        console.error('Falha ao copiar imagem para a área de transferência:', e);
        return false;
    }
}

function alternarCanalEnvioModal(canal) {
    const btn = document.getElementById('btnWhatsAppModalEnviar');
    const instrucao = document.getElementById('wEnvioImagemInstrucao');
    if (canal === 'openwa') {
        if (btn) btn.innerHTML = '🚀 Enviar Agora (Open-WA)';
        if (instrucao) instrucao.innerHTML = 'No modo Open-WA, ela é enviada automaticamente pela API junto com a legenda.<br><button type="button" class="btn btn-outline btn-xs mt-4" onclick="baixarImagemModeloWhatsapp()">Baixar imagem</button>';
    } else {
        if (btn) btn.innerHTML = 'Abrir no WhatsApp (wa.me)';
        if (instrucao) instrucao.innerHTML = 'Ela será copiada pra área de transferência ao clicar em "Abrir no WhatsApp" — cole (Ctrl+V) direto na conversa.<br><button type="button" class="btn btn-outline btn-xs mt-4" onclick="baixarImagemModeloWhatsapp()">Baixar imagem</button>';
    }
}

async function enviarWhatsApp(event) {
    event.preventDefault();

    const leadId = document.getElementById('wEnvioLeadId').value;
    const telefone = document.getElementById('wEnvioTelefone').value.trim();
    const conteudo = document.getElementById('wEnvioConteudo').value.trim();
    const salvarHist = document.getElementById('wEnvioSalvarHistorico').checked;
    const canal = document.getElementById('wEnvioCanal')?.value || 'openwa';

    const lead = leads.find(l => l.id === leadId);
    if (!lead) {
        showToast('Lead não encontrado!', 'error');
        return;
    }

    if (usuarioAtual.papel !== 'admin' && lead.usuarioId !== usuarioAtual.id) {
        showToast('Você não tem permissão para enviar WhatsApp deste lead.', 'error');
        return;
    }

    if (!telefone || !conteudo) {
        showToast('Preencha telefone e mensagem!', 'error');
        return;
    }

    const digitos = telefone.replace(/\D/g, '');
    const imagemParaEnviar = wEnvioImagemAtual;

    if (canal === 'openwa') {
        const btn = document.getElementById('btnWhatsAppModalEnviar');
        const textoOriginal = btn ? btn.innerHTML : '';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = 'Enviando via Open-WA...';
        }

        try {
            const numeroDestino = `${CONFIG.WHATSAPP_COUNTRY_CODE}${digitos}`;
            if (imagemParaEnviar) {
                await OpenWAService.enviarImagem(numeroDestino, imagemParaEnviar, conteudo);
            } else {
                await OpenWAService.enviarTexto(numeroDestino, conteudo);
            }

            const log = {
                id: gerarId(),
                data: hoje(),
                hora: new Date().toTimeString().slice(0, 5),
                leadId: lead.id,
                empresa: lead.empresa,
                telefone: telefone,
                mensagem: conteudo,
                status: 'enviado_openwa',
                usuarioId: usuarioAtual.id
            };
            whatsappLog.unshift(log);

            if (salvarHist) {
                if (!lead.historico) lead.historico = [];
                lead.historico.push({
                    data: hoje(),
                    hora: new Date().toTimeString().slice(0, 5),
                    tipo: 'WhatsApp',
                    descricao: `Mensagem enviada com sucesso via Open-WA API para ${telefone}: "${conteudo.substring(0, 80)}${conteudo.length > 80 ? '...' : ''}"`
                });
            }

            salvarDados();
            fecharModal('whatsappModal');
            renderizarAll();
            showToast(`Mensagem enviada com sucesso via Open-WA para ${lead.empresa}!`, 'success');
        } catch (err) {
            console.error('Erro ao enviar via Open-WA:', err);
            showToast(`Falha no envio via Open-WA: ${err.message}. Você pode usar o canal manual wa.me caso o servidor esteja offline.`, 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = textoOriginal;
            }
        }
        return;
    }

    // Modo Manual (wa.me)
    const url = `https://wa.me/${CONFIG.WHATSAPP_COUNTRY_CODE}${digitos}?text=${encodeURIComponent(conteudo)}`;
    window.open(url, '_blank');

    const imagemCopiada = imagemParaEnviar ? await copiarImagemParaAreaTransferencia(imagemParaEnviar) : false;

    const log = {
        id: gerarId(),
        data: hoje(),
        hora: new Date().toTimeString().slice(0, 5),
        leadId: lead.id,
        empresa: lead.empresa,
        telefone: telefone,
        mensagem: conteudo,
        status: 'aberto',
        usuarioId: usuarioAtual.id
    };
    whatsappLog.unshift(log);

    if (salvarHist) {
        if (!lead.historico) lead.historico = [];
        lead.historico.push({
            data: hoje(),
            hora: new Date().toTimeString().slice(0, 5),
            tipo: 'WhatsApp',
            descricao: `Mensagem preparada para ${telefone}: "${conteudo.substring(0, 80)}${conteudo.length > 80 ? '...' : ''}"`
        });
    }

    salvarDados();
    fecharModal('whatsappModal');
    renderizarAll();

    if (imagemParaEnviar && imagemCopiada) {
        showToast(`WhatsApp aberto! Imagem copiada — cole com Ctrl+V na conversa.`);
    } else if (imagemParaEnviar && !imagemCopiada) {
        showToast(`WhatsApp aberto! Não consegui copiar a imagem automaticamente neste navegador — use "Baixar imagem".`, 'warning');
    } else {
        showToast(`WhatsApp aberto para ${lead.empresa}!`);
    }
}

// ============================================
// RENDERIZAR WHATSAPP
// ============================================
function renderizarWhatsapp() {
    document.getElementById('totalModelosWhatsapp').textContent = modelosWhatsapp.length;

    const hojeStr = hoje();
    const abertosHoje = whatsappLog.filter(log => log.data === hojeStr);
    document.getElementById('totalWhatsappHoje').textContent = abertosHoje.length;
    document.getElementById('totalWhatsappGeral').textContent = whatsappLog.length;

    // Modelos
    const modelosContainer = document.getElementById('whatsappModelosList');
    if (modelosWhatsapp.length === 0) {
        modelosContainer.innerHTML =
            `<div class="empty-state compact"><span class="emoji-big"><span data-icone="whatsapp"></span></span><p class="text-sm">Nenhum modelo criado</p></div>`;
    } else {
        modelosContainer.innerHTML = modelosWhatsapp.map(m => `
            <div class="template-item">
                <div class="template-info">
                    <div class="name">${m.nome}</div>
                    <div class="desc">${m.conteudo.substring(0, 60)}${m.conteudo.length > 60 ? '...' : ''}</div>
                </div>
                <div class="template-actions">
                    <button class="btn btn-info btn-xs" onclick="abrirModalModeloWhatsapp('${m.id}')"><span data-icone="editar"></span></button>
                    <button class="btn btn-danger btn-xs" onclick="excluirModeloWhatsapp('${m.id}')"><span data-icone="excluir"></span></button>
                </div>
            </div>
        `).join('');
    }

    // Log
    const logContainer = document.getElementById('whatsappLogList');
    document.getElementById('whatsappLogCount').textContent = whatsappLog.length;

    if (whatsappLog.length === 0) {
        logContainer.innerHTML =
            `<div class="empty-state compact"><span class="emoji-big"><span data-icone="whatsapp"></span></span><p class="text-sm">Nenhuma mensagem registrada</p></div>`;
    } else {
        logContainer.innerHTML = whatsappLog.slice(0, 15).map(log => `
            <div class="email-log-item">
                <div>
                    <strong>${log.empresa}</strong>
                    <span class="text-xs text-muted">${log.telefone}</span>
                    <div class="text-xs text-muted">${formatarData(log.data)} ${log.hora || ''}</div>
                </div>
                <div>
                    <span class="log-status ${log.status === 'confirmado' ? 'enviado' : log.status === 'pulado' ? 'cancelado' : 'enviado'}">${log.status === 'confirmado' ? 'Confirmado' : log.status === 'aberto' ? 'Aberto' : 'Pulado'}</span>
                </div>
            </div>
        `).join('');
    }

    setBadge('whatsappCount', abertosHoje.length);
    inicializarFilaWhatsapp();
}


// ============================================
// FILA ASSISTIDA DE CAMPANHAS WHATSAPP
// ============================================
// Sem API oficial, cada item abre um link wa.me para confirmação manual.
// Não há disparo automático nem temporização para simular comportamento humano.

function whatsappEscapar(valor) {
    return String(valor ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

function whatsappTelefoneLead(lead) {
    return String(lead?.whatsapp || lead?.telefone || '').replace(/\D/g, '');
}

function whatsappTemOptOut(leadId) {
    return Array.isArray(whatsappOptOut) && whatsappOptOut.includes(leadId);
}

function whatsappTemConsentimento(leadId) {
    return whatsappConsentimentos && whatsappConsentimentos[leadId] === true;
}

function whatsappOpcoesModelo() {
    return '<option value="">Selecionar modelo</option>' + modelosWhatsapp.map(m => `<option value="${whatsappEscapar(m.id)}">${whatsappEscapar(m.nome)}</option>`).join('');
}

function whatsappFiltrosFila() {
    return {
        etapa: document.getElementById('wFilaEtapa')?.value || '',
        classificacao: document.getElementById('wFilaClassificacao')?.value || '',
        potencial: document.getElementById('wFilaPotencial')?.value || '',
        usuarioId: document.getElementById('wFilaVendedor')?.value || '',
        estado: (document.getElementById('wFilaEstado')?.value || '').trim().toLowerCase(),
        cidade: (document.getElementById('wFilaCidade')?.value || '').trim().toLowerCase()
    };
}

function whatsappLeadCombinaFiltros(lead, filtros) {
    if (filtros.etapa && lead.etapa !== filtros.etapa) return false;
    if (filtros.classificacao && (lead.classificacao || 'outros') !== filtros.classificacao) return false;
    if (filtros.potencial && lead.potencial !== filtros.potencial) return false;
    if (filtros.usuarioId && String(lead.usuarioId || '') !== String(filtros.usuarioId)) return false;
    if (filtros.estado && String(lead.estado || '').trim().toLowerCase() !== filtros.estado) return false;
    if (filtros.cidade && !String(lead.cidade || '').toLowerCase().includes(filtros.cidade)) return false;
    return true;
}

function whatsappLeadsSegmento(filtros, incluirSemConsentimento = false) {
    return leads.filter(lead => {
        if (usuarioAtual?.papel !== 'admin' && lead.usuarioId !== usuarioAtual?.id) return false;
        if (!whatsappTelefoneLead(lead)) return false;
        if (!whatsappLeadCombinaFiltros(lead, filtros)) return false;
        if (whatsappTemOptOut(lead.id)) return false;
        if (!incluirSemConsentimento && !whatsappTemConsentimento(lead.id)) return false;
        return true;
    });
}

function whatsappFilaVariaveis(conteudo, lead) {
    const classifTexto = typeof CLASSIFICACAO_NOMES !== 'undefined' && CLASSIFICACAO_NOMES[lead.classificacao] ? CLASSIFICACAO_NOMES[lead.classificacao] : (lead.classificacao || 'Outros');
    return String(conteudo || '')
        .replace(/\{\{empresa\}\}/g, lead.empresa || '')
        .replace(/\{\{decisor\}\}/g, lead.decisor || '')
        .replace(/\{\{valor\}\}/g, formatarMoeda(lead.valor || 0))
        .replace(/\{\{telefone\}\}/g, lead.telefone || '')
        .replace(/\{\{cidade\}\}/g, lead.cidade || '')
        .replace(/\{\{estado\}\}/g, lead.estado || '')
        .replace(/\{\{potencial\}\}/g, lead.potencial || '')
        .replace(/\{\{classificacao\}\}/g, classifTexto);
}

function whatsappFilaAtualizarVendedores() {
    const select = document.getElementById('wFilaVendedor');
    if (!select) return;
    const atual = select.value;
    const disponiveis = usuarioAtual?.papel === 'admin' ? usuarios : usuarios.filter(u => u.id === usuarioAtual?.id);
    select.innerHTML = '<option value="">Todos os vendedores</option>' + disponiveis.map(u => `<option value="${whatsappEscapar(u.id)}">${whatsappEscapar(u.nome)}</option>`).join('');
    if (disponiveis.some(u => u.id === atual)) select.value = atual;
}

function whatsappFilaAtualizarModeloSelects() {
    ['wFilaModeloV1', 'wFilaModeloV2', 'wFilaModeloV3'].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        const atual = select.value;
        select.innerHTML = whatsappOpcoesModelo();
        if (modelosWhatsapp.some(m => m.id === atual)) select.value = atual;
    });
}

function whatsappFilaRenderizarCandidatos() {
    const container = document.getElementById('wFilaCandidatos');
    if (!container) return;
    const leadsSegmento = whatsappLeadsSegmento(whatsappFiltrosFila(), true);
    if (!leadsSegmento.length) {
        container.innerHTML = '<div class="empty-state compact"><p>Nenhum contato com telefone/WhatsApp encontrado para os filtros atuais.</p></div>';
        return;
    }

    const wrapAnterior = container.querySelector('.w-fila-table-wrap');
    const scrollAnterior = wrapAnterior ? wrapAnterior.scrollTop : null;

    const limiteExibir = window.wFilaVerTodos ? leadsSegmento.length : Math.min(leadsSegmento.length, 300);
    const visiveis = leadsSegmento.slice(0, limiteExibir);
    const usuarioMap = new Map(usuarios.map(u => [u.id, u.nome]));

    const totalCandidatos = leadsSegmento.length;
    const totalAutorizados = leadsSegmento.filter(l => whatsappTemConsentimento(l.id)).length;
    const todosMarcados = totalCandidatos > 0 && totalAutorizados === totalCandidatos;
    const algumMarcado = totalAutorizados > 0 && totalAutorizados < totalCandidatos;

    container.innerHTML = `
        <div class="w-fila-controles-selecao">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <label style="display:inline-flex;align-items:center;gap:7px;cursor:pointer;font-weight:600;font-size:13px;margin:0;user-select:none;">
                    <input type="checkbox" id="wFilaMasterCheckbox" class="w-fila-master-check" onchange="whatsappFilaToggleTodosCandidatos(this.checked)" ${todosMarcados ? 'checked' : ''}>
                    <span>Selecionar Todos da Lista</span>
                </label>
                <button type="button" class="btn btn-primary btn-xs" onclick="whatsappFilaToggleTodosCandidatos(true)" title="Seleciona todos os contatos filtrados de uma única vez">
                    ☑️ Selecionar Todos (${totalCandidatos})
                </button>
                <button type="button" class="btn btn-outline btn-xs" onclick="whatsappFilaToggleTodosCandidatos(false)" title="Desmarca todos os contatos da lista">
                    ⬜ Desmarcar Todos
                </button>
                ${totalCandidatos > 300 ? `
                    <button type="button" class="btn btn-outline btn-xs" onclick="window.wFilaVerTodos = !window.wFilaVerTodos; whatsappFilaRenderizarCandidatos();">
                        ${window.wFilaVerTodos ? 'Mostrar primeiros 300' : `Exibir todos (${totalCandidatos})`}
                    </button>
                ` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                <span class="badge ${totalAutorizados > 0 ? 'badge-success' : 'badge-secondary'}" style="font-size:12px;padding:5px 12px;font-weight:600;">
                    ${totalAutorizados > 0 ? `✓ ${totalAutorizados} de ${totalCandidatos} selecionados para a campanha` : `Nenhum contato selecionado (${totalCandidatos} disponíveis)`}
                </span>
            </div>
        </div>
        <div class="table-wrapper w-fila-table-wrap"><table class="w-fila-table"><thead><tr>
            <th class="w-fila-check-col" title="Marcar ou desmarcar todos"><input type="checkbox" id="wFilaHeaderCheck" class="w-fila-master-check" onchange="whatsappFilaToggleTodosCandidatos(this.checked)" ${todosMarcados ? 'checked' : ''}></th>
            <th>Empresa</th>
            <th>Contato</th>
            <th>Segmento</th>
            <th>Campanha</th>
            <th>Ação</th>
        </tr></thead><tbody>
            ${visiveis.map(lead => {
                const consentiu = whatsappTemConsentimento(lead.id);
                const classifTexto = typeof CLASSIFICACAO_NOMES !== 'undefined' && CLASSIFICACAO_NOMES[lead.classificacao] ? CLASSIFICACAO_NOMES[lead.classificacao] : (lead.classificacao || 'Outros');
                return `<tr class="${consentiu ? 'w-fila-row-autorizado' : ''}">
                    <td class="w-fila-check-col">
                        <input type="checkbox" class="w-fila-check-lead" data-lead-id="${whatsappEscapar(lead.id)}" 
                            ${consentiu ? 'checked' : ''} 
                            onchange="whatsappFilaToggleContato('${whatsappEscapar(lead.id)}', this.checked)"
                            title="${consentiu ? 'Clique para desmarcar da campanha' : 'Clique para selecionar para a campanha'}">
                    </td>
                    <td><strong>${whatsappEscapar(lead.empresa)}</strong><div class="text-xs text-muted">${whatsappEscapar(lead.cidade || '—')}/${whatsappEscapar(lead.estado || '—')}</div></td>
                    <td>${whatsappEscapar(lead.decisor || '—')}<div class="text-xs text-muted">${whatsappEscapar(lead.whatsapp || lead.telefone)}</div></td>
                    <td>${whatsappEscapar(ETAPA_NOMES[lead.etapa] || lead.etapa)} • <span class="badge-classificacao badge-classificacao-${whatsappEscapar(lead.classificacao || 'outros')}">${whatsappEscapar(classifTexto)}</span><div class="text-xs text-muted">Potencial ${whatsappEscapar(lead.potencial || '—')} • ${whatsappEscapar(usuarioMap.get(lead.usuarioId) || 'Sem responsável')}</div></td>
                    <td><span class="w-consent-badge ${consentiu ? 'ok' : 'pendente'}">${consentiu ? '✓ Selecionado' : 'Não selecionado'}</span></td>
                    <td>${consentiu
                        ? `<button type="button" class="btn btn-outline btn-xs" onclick="whatsappFilaToggleContato('${whatsappEscapar(lead.id)}', false)">Desmarcar</button>`
                        : `<button type="button" class="btn btn-success btn-xs" onclick="whatsappFilaToggleContato('${whatsappEscapar(lead.id)}', true)">Selecionar</button>`}</td>
                </tr>`;
            }).join('')}
        </tbody></table></div>
    `;

    // Atualiza estado intermediário (tri-state) dos checkboxes mestres se parte da lista estiver selecionada
    const masterCheck = document.getElementById('wFilaMasterCheckbox');
    const headerCheck = document.getElementById('wFilaHeaderCheck');
    if (masterCheck) masterCheck.indeterminate = algumMarcado;
    if (headerCheck) headerCheck.indeterminate = algumMarcado;

    // Restaura a rolagem para que a navegação do usuário permaneça suave e contínua
    if (scrollAnterior !== null) {
        const novoWrap = container.querySelector('.w-fila-table-wrap');
        if (novoWrap) novoWrap.scrollTop = scrollAnterior;
    }
}

function whatsappFilaToggleTodosCandidatos(selecionar) {
    const filtros = whatsappFiltrosFila();
    const leadsSegmento = whatsappLeadsSegmento(filtros, true);
    if (!leadsSegmento.length) {
        showToast('Nenhum contato disponível com os filtros atuais.', 'warning');
        return;
    }

    if (selecionar) {
        let count = 0;
        leadsSegmento.forEach(lead => {
            if (!whatsappTemOptOut(lead.id)) {
                whatsappConsentimentos[lead.id] = true;
                count++;
            }
        });
        showToast(`${count} contato(s) selecionados para a campanha.`, 'success');
    } else {
        leadsSegmento.forEach(lead => {
            delete whatsappConsentimentos[lead.id];
        });
        showToast('Todos os contatos foram desmarcados.', 'info');
    }

    salvarDadosDebounced(300);
    whatsappFilaRenderizarCandidatos();
}

function whatsappFilaToggleContato(leadId, selecionar) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    if (selecionar) {
        if (whatsappTemOptOut(leadId)) {
            showToast('Este contato possui solicitação de Não Contatar (opt-out).', 'warning');
            whatsappFilaRenderizarCandidatos();
            return;
        }
        whatsappConsentimentos[leadId] = true;
        showToast(`${lead.empresa} selecionado para a campanha.`);
    } else {
        delete whatsappConsentimentos[leadId];
        showToast(`${lead.empresa} desmarcado da campanha.`);
    }

    salvarDadosDebounced(300);
    whatsappFilaRenderizarCandidatos();
}

function whatsappAutorizarContato(leadId) {
    whatsappFilaToggleContato(leadId, true);
}

function whatsappRemoverConsentimento(leadId) {
    whatsappFilaToggleContato(leadId, false);
}

function whatsappMarcarOptOut(leadId) {
    if (!whatsappOptOut.includes(leadId)) whatsappOptOut.push(leadId);
    delete whatsappConsentimentos[leadId];
    salvarDadosDebounced(300);
    whatsappFilaRenderizarCandidatos();
}

function whatsappFilaModeloIds() {
    return ['wFilaModeloV1', 'wFilaModeloV2', 'wFilaModeloV3']
        .map(id => document.getElementById(id)?.value)
        .filter(Boolean);
}

function whatsappFilaContarConfirmadosHoje() {
    const hojeStr = hoje();
    return whatsappLog.filter(log => log.data === hojeStr && ['confirmado', 'enviado'].includes(log.status)).length;
}

function whatsappFilaObterItemAtual() {
    if (!whatsappFilaAtual?.itens?.length) return null;
    return whatsappFilaAtual.itens.find(item => item.status === 'aberto') || whatsappFilaAtual.itens.find(item => item.status === 'pendente') || null;
}

function whatsappFilaCriar() {
    const nome = document.getElementById('wFilaNome')?.value.trim() || `Campanha ${formatarData(hoje())}`;
    const modeloIds = whatsappFilaModeloIds();
    const personalizada = document.getElementById('wFilaPersonalizada')?.value.trim() || '';
    const limiteDiario = Math.max(1, Math.min(100, parseInt(document.getElementById('wFilaLimite')?.value, 10) || 30));
    const filtros = whatsappFiltrosFila();
    const candidatos = whatsappLeadsSegmento(filtros, false);
    if (!modeloIds.length && !personalizada) {
        showToast('Selecione ao menos um modelo ou informe uma mensagem personalizada.', 'error');
        return;
    }
    if (!candidatos.length) {
        showToast('Nenhum contato selecionado para a campanha. Marque as caixas de seleção dos contatos desejados ou clique em "Selecionar Todos".', 'warning');
        return;
    }
    const fila = {
        id: gerarId(),
        nome,
        criadaEm: new Date().toISOString(),
        status: 'em_andamento',
        limiteDiario,
        filtros,
        modeloIds,
        itens: candidatos.map((lead, index) => {
            const variacoes = [
                ...modeloIds.map((modeloId, posicao) => ({ id: modeloId, rotulo: `V${posicao + 1}`, conteudo: modelosWhatsapp.find(m => m.id === modeloId)?.conteudo || '' })),
                ...(personalizada ? [{ id: 'personalizada', rotulo: 'Personalizada', conteudo: personalizada }] : [])
            ];
            const variacao = variacoes[index % variacoes.length];
            return {
                id: gerarId(),
                leadId: lead.id,
                modeloId: variacao.id,
                variacao: variacao.rotulo,
                mensagem: whatsappFilaVariaveis(variacao.conteudo, lead),
                status: 'pendente',
                criadoEm: new Date().toISOString()
            };
        })
    };
    whatsappFilaAtual = fila;
    whatsappCampanhas.unshift({ id: fila.id, nome: fila.nome, criadaEm: fila.criadaEm, status: fila.status, total: fila.itens.length });
    salvarDados();
    renderizarWhatsapp();
    showToast(`Fila criada com ${fila.itens.length} contato(s).`, 'success');
}

function whatsappFilaAbrirAtual() {
    const item = whatsappFilaObterItemAtual();
    if (!item) {
        showToast('Não há contato pendente na fila.', 'warning');
        return;
    }
    if (whatsappFilaContarConfirmadosHoje() >= whatsappFilaAtual.limiteDiario) {
        showToast(`Limite diário de ${whatsappFilaAtual.limiteDiario} confirmações atingido.`, 'warning');
        return;
    }
    const lead = leads.find(l => l.id === item.leadId);
    if (!lead || whatsappTemOptOut(lead.id) || !whatsappTemConsentimento(lead.id)) {
        item.status = 'optout';
        whatsappFilaRenderizar();
        showToast('Contato sem consentimento válido ou marcado para não contatar.', 'warning');
        return;
    }
    const telefone = whatsappTelefoneLead(lead);
    const url = `https://wa.me/${CONFIG.WHATSAPP_COUNTRY_CODE}${telefone}?text=${encodeURIComponent(item.mensagem)}`;
    window.open(url, '_blank');
    item.status = 'aberto';
    item.abertoEm = new Date().toISOString();
    whatsappLog.unshift({ id: gerarId(), data: hoje(), hora: new Date().toTimeString().slice(0, 5), leadId: lead.id, empresa: lead.empresa, telefone: lead.whatsapp || lead.telefone, mensagem: item.mensagem, status: 'aberto', campanhaId: whatsappFilaAtual.id, variacao: item.variacao, usuarioId: usuarioAtual.id });
    salvarDados();
    whatsappFilaRenderizar();
    showToast(`WhatsApp aberto para ${lead.empresa}. Confirme manualmente o envio na conversa.`);
}

function whatsappFilaMarcarEnviado() {
    const item = whatsappFilaObterItemAtual();
    if (!item || item.status !== 'aberto') {
        showToast('Abra o contato no WhatsApp antes de confirmar o envio.', 'warning');
        return;
    }
    if (whatsappFilaContarConfirmadosHoje() >= whatsappFilaAtual.limiteDiario) {
        showToast(`Limite diário de ${whatsappFilaAtual.limiteDiario} confirmações atingido.`, 'warning');
        return;
    }
    const lead = leads.find(l => l.id === item.leadId);
    item.status = 'confirmado';
    item.confirmadoEm = new Date().toISOString();
    const log = whatsappLog.find(l => l.campanhaId === whatsappFilaAtual.id && l.leadId === item.leadId && l.status === 'aberto');
    if (log) log.status = 'confirmado';
    if (lead) {
        if (!lead.historico) lead.historico = [];
        lead.historico.push({ data: hoje(), hora: new Date().toTimeString().slice(0, 5), tipo: 'WhatsApp', descricao: `Envio confirmado na fila ${whatsappFilaAtual.nome} (${item.variacao}).` });
    }
    salvarDados();
    whatsappFilaRenderizar();
    renderizarAll();
    showToast('Envio confirmado e registrado.', 'success');
}

function whatsappFilaPularAtual() {
    const item = whatsappFilaObterItemAtual();
    if (!item) return;
    item.status = 'pulado';
    item.puladoEm = new Date().toISOString();
    salvarDados();
    whatsappFilaRenderizar();
    showToast('Contato pulado. A fila avançou para o próximo.');
}

function whatsappFilaOptOutAtual() {
    const item = whatsappFilaObterItemAtual();
    if (!item) return;
    whatsappMarcarOptOut(item.leadId);
    item.status = 'optout';
    item.optoutEm = new Date().toISOString();
    salvarDados();
    whatsappFilaRenderizar();
    showToast('Contato incluído na lista de não contato.', 'warning');
}

function whatsappFilaPausar() {
    if (!whatsappFilaAtual) return;
    whatsappFilaAtual.status = 'pausada';
    salvarDados();
    whatsappFilaRenderizar();
}

function whatsappFilaRetomar() {
    if (!whatsappFilaAtual) return;
    whatsappFilaAtual.status = 'em_andamento';
    salvarDados();
    whatsappFilaRenderizar();
}

function whatsappFilaEncerrar() {
    if (!whatsappFilaAtual) return;
    whatsappFilaAtual.status = 'encerrada';
    const campanha = whatsappCampanhas.find(c => c.id === whatsappFilaAtual.id);
    if (campanha) campanha.status = 'encerrada';
    salvarDados();
    whatsappFilaRenderizar();
}

function whatsappFilaReiniciar() {
    if (!whatsappFilaAtual) return;
    whatsappFilaAtual.itens.forEach(item => {
        if (['pulado', 'aberto'].includes(item.status)) item.status = 'pendente';
    });
    whatsappFilaAtual.status = 'em_andamento';
    salvarDados();
    whatsappFilaRenderizar();
}

function whatsappStatusFilaLabel(status) {
    return ({ pendente: 'Pendente', aberto: 'Aberto', confirmado: 'Confirmado', pulado: 'Pulado', optout: 'Não contatar' }[status] || status);
}

function whatsappFilaRenderizar() {
    const painel = document.getElementById('wFilaPainel');
    if (!painel) return;
    const fila = whatsappFilaAtual;
    if (!fila) {
        painel.innerHTML = '<div class="empty-state compact"><p>Nenhuma fila ativa. Monte uma fila com os contatos autorizados.</p></div>';
        return;
    }
    const itemAtual = whatsappFilaObterItemAtual();
    const total = fila.itens.length;
    const confirmados = fila.itens.filter(i => i.status === 'confirmado').length;
    const pulados = fila.itens.filter(i => ['pulado', 'optout'].includes(i.status)).length;
    const concluidos = confirmados + pulados;
    const progresso = total ? Math.round((concluidos / total) * 100) : 0;
    const lead = itemAtual ? leads.find(l => l.id === itemAtual.leadId) : null;
    const pausada = fila.status === 'pausada';
    const encerrada = ['encerrada', 'concluida'].includes(fila.status);
    const statusAtual = itemAtual ? whatsappStatusFilaLabel(itemAtual.status) : 'Concluída';
    const resto = fila.itens.filter(i => i.id !== itemAtual?.id).slice(0, 8);

    painel.innerHTML = `
        <div class="w-fila-header">
            <div><h4>${whatsappEscapar(fila.nome)}</h4><span class="text-xs text-muted">${total} contatos • ${confirmados} confirmados • ${pulados} pulados • limite diário ${fila.limiteDiario}</span></div>
            <div class="flex gap-8 flex-wrap"><span class="w-fila-status ${fila.status}">${pausada ? 'Pausada' : encerrada ? 'Encerrada' : 'Em andamento'}</span><button class="btn btn-outline btn-xs" onclick="${pausada ? 'whatsappFilaRetomar' : 'whatsappFilaPausar'}()">${pausada ? 'Retomar' : 'Pausar'}</button><button class="btn btn-danger btn-xs" onclick="whatsappFilaEncerrar()">Encerrar</button></div>
        </div>
        <div class="w-fila-progress"><div style="width:${progresso}%;"></div></div><div class="text-xs text-muted mb-8">${progresso}% processado</div>
        ${itemAtual && !pausada && !encerrada ? `<div class="w-fila-atual">
            <div class="w-fila-atual-head"><div><span class="text-xs text-muted">Próximo contato • ${whatsappEscapar(itemAtual.variacao)} • ${statusAtual}</span><h4>${whatsappEscapar(lead?.empresa || 'Contato não encontrado')}</h4><div class="text-xs text-muted">${whatsappEscapar(lead?.decisor || '—')} • ${whatsappEscapar(lead?.whatsapp || lead?.telefone || 'Sem telefone')}</div></div><strong>${concluidos + 1}/${total}</strong></div>
            <div class="w-fila-mensagem">${whatsappEscapar(itemAtual.mensagem).replace(/\n/g, '<br>')}</div>
            <div class="flex gap-8 flex-wrap mt-12">
                <button class="btn btn-success btn-sm" onclick="whatsappFilaAbrirAtual()">Abrir no WhatsApp</button>
                <button class="btn btn-primary btn-sm" onclick="whatsappFilaMarcarEnviado()">Confirmar envio</button>
                <button class="btn btn-outline btn-sm" onclick="whatsappFilaPularAtual()">Pular</button>
                <button class="btn btn-danger btn-sm" onclick="whatsappFilaOptOutAtual()">Não contatar</button>
            </div>
            <div class="text-xs text-muted mt-8">O botão “Confirmar envio” deve ser usado somente depois que você concluir o envio na conversa aberta.</div>
        </div>` : `<div class="empty-state compact"><p>${encerrada ? 'Fila encerrada.' : pausada ? 'Fila pausada.' : 'Todos os contatos foram processados.'}</p>${!encerrada && !pausada ? '<button class="btn btn-outline btn-sm" onclick="whatsappFilaReiniciar()">Reabrir pulados</button>' : ''}</div>`}
        <div class="w-fila-proximos"><h4>Próximos itens</h4>${resto.length ? `<div class="w-fila-lista">${resto.map(i => { const l = leads.find(x => x.id === i.leadId); return `<div class="w-fila-lista-item"><span>${whatsappEscapar(l?.empresa || '—')}</span><span>${whatsappEscapar(i.variacao)} • <em class="w-fila-item-status ${i.status}">${whatsappStatusFilaLabel(i.status)}</em></span></div>`; }).join('')}</div>` : '<div class="text-xs text-muted">Nenhum item restante.</div>'}</div>
    `;
}

function whatsappRenderizarCampanhas() {
    const container = document.getElementById('wFilaCampanhas');
    if (!container) return;
    if (!whatsappCampanhas.length) {
        container.innerHTML = '<div class="text-xs text-muted">Nenhuma campanha criada.</div>';
        return;
    }
    container.innerHTML = whatsappCampanhas.slice(0, 8).map(c => `<div class="w-campanha-item"><div><strong>${whatsappEscapar(c.nome)}</strong><div class="text-xs text-muted">${c.total || 0} contatos • ${formatarData(c.criadaEm)}</div></div><span class="w-fila-status ${c.status}">${whatsappEscapar(c.status)}</span></div>`).join('');
}

function inicializarFilaWhatsapp() {
    whatsappFilaAtualizarVendedores();
    whatsappFilaAtualizarModeloSelects();
    whatsappFilaRenderizarCandidatos();
    whatsappFilaRenderizar();
    whatsappRenderizarCampanhas();
    openwaInicializarPainel();
}

// ============================================
// OPEN-WA DISPARADOR EM MASSA CONTROLLER
// ============================================

let openwaContatosFiltrados = [];
let openwaDisparoState = {
    ativo: false,
    pausado: false,
    cancelado: false,
    indiceAtual: 0,
    total: 0,
    enviadosSucesso: 0,
    falhas: 0,
    timerId: null
};

function alternarAbaWhatsapp(aba) {
    const tabOpenWA = document.getElementById('tabBtnOpenWA');
    const tabManual = document.getElementById('tabBtnManual');
    const painelOpenWA = document.getElementById('painelOpenWA');
    const painelManual = document.getElementById('painelManual');

    if (aba === 'openwa') {
        tabOpenWA?.classList.add('active');
        tabManual?.classList.remove('active');
        if (painelOpenWA) painelOpenWA.style.display = 'block';
        if (painelManual) painelManual.style.display = 'none';
    } else {
        tabManual?.classList.add('active');
        tabOpenWA?.classList.remove('active');
        if (painelManual) painelManual.style.display = 'block';
        if (painelOpenWA) painelOpenWA.style.display = 'none';
    }
}

function openwaInicializarPainel() {
    openwaAtualizarVendedores();
    openwaAtualizarModelosSelect();
    openwaAtualizarContatosAlvo();
    openwaVerificarStatusSilencioso();
}

function openwaAtualizarVendedores() {
    const sel = document.getElementById('openwaFiltroVendedor');
    if (!sel) return;
    const atual = sel.value;
    sel.innerHTML = '<option value="">Todos os vendedores</option>' +
        (typeof usuarios !== 'undefined' ? usuarios.map(u => `<option value="${whatsappEscapar(u.id)}">${whatsappEscapar(u.nome)}</option>`).join('') : '');
    sel.value = atual;
}

function openwaAtualizarModelosSelect() {
    const sel = document.getElementById('openwaModeloSelect');
    if (!sel) return;
    const atual = sel.value;
    sel.innerHTML = '<option value="">Selecionar modelo cadastrado</option>' +
        modelosWhatsapp.map(m => `<option value="${whatsappEscapar(m.id)}">${whatsappEscapar(m.nome)}</option>`).join('');
    if (modelosWhatsapp.some(m => m.id === atual)) sel.value = atual;
}

function openwaAtualizarPreviewModelo() {
    const sel = document.getElementById('openwaModeloSelect');
    const txtArea = document.getElementById('openwaMensagemConteudo');
    const imgWrap = document.getElementById('openwaImagemAnexoWrap');
    const imgPreview = document.getElementById('openwaImagemAnexoPreview');
    if (!sel || !txtArea) return;

    const modelo = modelosWhatsapp.find(m => m.id === sel.value);
    if (modelo) {
        txtArea.value = modelo.conteudo;
        if (modelo.imagem && imgWrap && imgPreview) {
            imgPreview.src = modelo.imagem;
            imgWrap.style.display = 'block';
        } else if (imgWrap) {
            imgWrap.style.display = 'none';
        }
    } else {
        if (imgWrap) imgWrap.style.display = 'none';
    }
}

function openwaObterFiltros() {
    return {
        etapa: document.getElementById('openwaFiltroEtapa')?.value || '',
        classificacao: document.getElementById('openwaFiltroClassificacao')?.value || '',
        potencial: document.getElementById('openwaFiltroPotencial')?.value || '',
        usuarioId: document.getElementById('openwaFiltroVendedor')?.value || '',
        estado: (document.getElementById('openwaFiltroEstado')?.value || '').trim().toUpperCase(),
        cidade: (document.getElementById('openwaFiltroCidade')?.value || '').trim().toLowerCase()
    };
}

function openwaAtualizarContatosAlvo() {
    const filtros = openwaObterFiltros();
    const contatosValidos = leads.filter(l => {
        const tel = whatsappTelefoneLead(l);
        if (!tel) return false;
        if (whatsappTemOptOut(l.id)) return false;
        if (filtros.etapa && l.etapa !== filtros.etapa) return false;
        if (filtros.classificacao && l.classificacao !== filtros.classificacao) return false;
        if (filtros.potencial && l.potencial !== filtros.potencial) return false;
        if (filtros.usuarioId && l.usuarioId !== filtros.usuarioId) return false;
        if (filtros.estado && (l.estado || '').trim().toUpperCase() !== filtros.estado) return false;
        if (filtros.cidade && !(l.cidade || '').toLowerCase().includes(filtros.cidade)) return false;
        return true;
    });

    openwaContatosFiltrados = contatosValidos;

    const countElem = document.getElementById('openwaTotalContatosAlvo');
    const tempoElem = document.getElementById('openwaTempoEstimado');
    const container = document.getElementById('openwaListaContatosWrap');

    const cfg = OpenWAService.obterConfig();
    const mediaDelay = ((parseInt(cfg.delayMinSegundos, 10) || 5) + (parseInt(cfg.delayMaxSegundos, 10) || 15)) / 2;
    const tempoTotalSegundos = contatosValidos.length * mediaDelay;
    const tempoMinutos = Math.ceil(tempoTotalSegundos / 60);

    if (countElem) {
        countElem.textContent = `${contatosValidos.length} contato(s) selecionado(s)`;
    }
    if (tempoElem) {
        tempoElem.textContent = contatosValidos.length ? `• Tempo estimado: ~${tempoMinutos} min (média de ${mediaDelay.toFixed(0)}s por envio com pausas)` : '';
    }

    if (!container) return;
    if (!contatosValidos.length) {
        container.innerHTML = '<div class="empty-state compact"><p>Nenhum contato encontrado com telefone válido para os filtros selecionados.</p></div>';
        return;
    }

    const previewContatos = contatosValidos.slice(0, 50);
    container.innerHTML = `
        <div class="table-wrapper w-fila-table-wrap">
            <table class="w-fila-table">
                <thead>
                    <tr>
                        <th>Empresa</th>
                        <th>Contato / Telefone</th>
                        <th>Etapa / Classif.</th>
                        <th>Localização</th>
                        <th>Status Disparo</th>
                    </tr>
                </thead>
                <tbody>
                    ${previewContatos.map(lead => `
                        <tr id="openwa-row-${lead.id}">
                            <td><strong>${whatsappEscapar(lead.empresa)}</strong></td>
                            <td>${whatsappEscapar(lead.decisor || '—')}<div class="text-xs text-muted">${whatsappEscapar(lead.whatsapp || lead.telefone)}</div></td>
                            <td>${whatsappEscapar(ETAPA_NOMES[lead.etapa] || lead.etapa)} • <span class="text-xs">${whatsappEscapar(CLASSIFICACAO_NOMES[lead.classificacao] || lead.classificacao || 'Outros')}</span></td>
                            <td>${whatsappEscapar(lead.cidade || '—')}/${whatsappEscapar(lead.estado || '—')}</td>
                            <td><span class="badge-status-item pendente" id="openwa-status-${lead.id}">Pendente</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ${contatosValidos.length > 50 ? `<div class="text-xs text-muted mt-4">Exibindo primeiros 50 contatos de ${contatosValidos.length}. Todos os ${contatosValidos.length} receberão o disparo.</div>` : ''}
    `;
}

// Config Modal Handlers
function openwaAbrirModalConfig() {
    const cfg = OpenWAService.obterConfig();
    document.getElementById('openwaCfgServerUrl').value = cfg.serverUrl || '';
    document.getElementById('openwaCfgApiKey').value = cfg.apiKey || '';
    document.getElementById('openwaCfgSessionId').value = cfg.sessionId || 'default';
    document.getElementById('openwaCfgDelayMin').value = cfg.delayMinSegundos || 5;
    document.getElementById('openwaCfgDelayMax').value = cfg.delayMaxSegundos || 15;
    document.getElementById('openwaCfgPausaAposN').value = cfg.pausarAposN || 20;
    document.getElementById('openwaCfgTempoPausa').value = cfg.tempoPausaMinutos || 5;
    abrirModal('modalConfigOpenWA');
}

function openwaBaixarScriptWindows() {
    const batConteudo = `@echo off
title Servidor Open-WA - Feitosa CRM
color 0A
echo ======================================================
echo    INICIANDO SERVIDOR OPEN-WA PARA O FEITOSA CRM
echo ======================================================
echo.
echo Verificando se o Node.js esta instalado...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] O Node.js nao foi encontrado no seu Windows!
    echo Por favor, baixe e instale o Node.js em: https://nodejs.org
    echo.
    pause
    exit /b
)

echo [OK] Node.js detectado com sucesso!
echo.
echo Iniciando o servidor Open-WA na porta 8080...
echo Uma janela do navegador abrira com o QR Code para conectar seu WhatsApp.
echo.
npx @open-wa/wa-automate -p 8080 --popup
pause
`;

    const blob = new Blob([batConteudo], { type: 'application/x-bat;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iniciar-openwa.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Arquivo iniciar-openwa.bat baixado! Basta dar dois cliques nele para rodar.', 'success');
}

async function openwaTestarConfigModal() {
    const serverUrl = document.getElementById('openwaCfgServerUrl').value.trim();
    const apiKey = document.getElementById('openwaCfgApiKey').value.trim();
    const sessionId = document.getElementById('openwaCfgSessionId').value.trim();

    if (!serverUrl) {
        showToast('Informe a URL do servidor Open-WA para testar.', 'error');
        return;
    }

    showToast('Testando conexão com servidor Open-WA...', 'info');
    try {
        const resp = await fetch('/api/openwa/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serverUrl, apiKey, sessionId })
        });
        const data = await resp.json();
        if (resp.ok && data.success) {
            showToast('✅ Conexão com Open-WA estabelecida com sucesso!', 'success');
            openwaAtualizarBadgeStatus(true);
        } else {
            showToast(`⚠️ Não foi possível conectar: ${data.error || 'Verifique se o Open-WA está em execução.'}`, 'error');
            openwaAtualizarBadgeStatus(false);
        }
    } catch (err) {
        showToast(`Erro ao testar Open-WA: ${err.message}`, 'error');
        openwaAtualizarBadgeStatus(false);
    }
}

function openwaSalvarConfigModal() {
    const serverUrl = document.getElementById('openwaCfgServerUrl').value.trim();
    const apiKey = document.getElementById('openwaCfgApiKey').value.trim();
    const sessionId = document.getElementById('openwaCfgSessionId').value.trim() || 'default';
    const delayMinSegundos = parseInt(document.getElementById('openwaCfgDelayMin').value, 10) || 5;
    const delayMaxSegundos = parseInt(document.getElementById('openwaCfgDelayMax').value, 10) || 15;
    const pausarAposN = parseInt(document.getElementById('openwaCfgPausaAposN').value, 10) || 20;
    const tempoPausaMinutos = parseInt(document.getElementById('openwaCfgTempoPausa').value, 10) || 5;

    if (!serverUrl) {
        showToast('A URL do servidor Open-WA é obrigatória.', 'error');
        return;
    }

    OpenWAService.salvarConfig({
        serverUrl,
        apiKey,
        sessionId,
        delayMinSegundos,
        delayMaxSegundos,
        pausarAposN,
        tempoPausaMinutos,
        ativo: true
    });

    fecharModal('modalConfigOpenWA');
    showToast('Configurações do Open-WA salvas com sucesso!', 'success');
    openwaVerificarStatus();
}

async function openwaVerificarStatus() {
    openwaAtualizarBadgeStatus('verificando');
    const res = await OpenWAService.testarConexao();
    if (res.ok) {
        openwaAtualizarBadgeStatus(true);
        showToast('Open-WA está conectado e pronto para envios em massa!', 'success');
    } else {
        openwaAtualizarBadgeStatus(false);
        showToast(`Open-WA offline: ${res.error}`, 'warning');
    }
}

async function openwaVerificarStatusSilencioso() {
    const res = await OpenWAService.testarConexao();
    openwaAtualizarBadgeStatus(res.ok);
}

function openwaAtualizarBadgeStatus(status) {
    const badge = document.getElementById('openwaStatusBadge');
    if (!badge) return;
    if (status === 'verificando') {
        badge.className = 'openwa-badge-status verificando';
        badge.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:currentColor;"></span> Verificando Open-WA...';
    } else if (status === true) {
        badge.className = 'openwa-badge-status conectado';
        badge.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:currentColor;"></span> Open-WA: Conectado';
    } else {
        badge.className = 'openwa-badge-status desconectado';
        badge.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:currentColor;"></span> Open-WA: Desconectado';
    }
}

// Log Terminal
function openwaLogTerminal(mensagem, tipo = 'info') {
    const terminal = document.getElementById('openwaTerminalLog');
    if (!terminal) return;
    const hora = new Date().toTimeString().slice(0, 8);
    const div = document.createElement('div');
    div.className = `log-${tipo}`;
    div.textContent = `[${hora}] ${mensagem}`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

// Execução do Disparo em Massa
async function openwaIniciarDisparoMassa() {
    if (openwaDisparoState.ativo) return;

    const textoMensagem = document.getElementById('openwaMensagemConteudo')?.value.trim();
    if (!textoMensagem) {
        showToast('Por favor, escreva a mensagem ou selecione um modelo de mensagem.', 'error');
        return;
    }

    if (!openwaContatosFiltrados.length) {
        showToast('Nenhum contato selecionado para o disparo. Ajuste os filtros.', 'warning');
        return;
    }

    // Testar conexão antes de disparar
    const check = await OpenWAService.testarConexao();
    if (!check.ok) {
        const confirmar = confirm(`Não foi possível conectar ao servidor Open-WA (${check.error}).\n\nCertifique-se de que o comando '@open-wa/wa-automate' está em execução.\n\nDeseja abrir as configurações agora?`);
        if (confirmar) openwaAbrirModalConfig();
        return;
    }

    const modeloId = document.getElementById('openwaModeloSelect')?.value;
    const modelo = modelosWhatsapp.find(m => m.id === modeloId);
    const imagemAnexo = modelo?.imagem || null;
    const nomeCampanha = document.getElementById('openwaCampanhaNome')?.value.trim() || `Campanha Open-WA ${formatarData(hoje())}`;

    const cfg = OpenWAService.obterConfig();

    openwaDisparoState = {
        ativo: true,
        pausado: false,
        cancelado: false,
        indiceAtual: 0,
        total: openwaContatosFiltrados.length,
        enviadosSucesso: 0,
        falhas: 0,
        campanhaNome: nomeCampanha,
        mensagemTemplate: textoMensagem,
        imagem: imagemAnexo
    };

    // UI Updates
    document.getElementById('btnOpenWAIniciar').style.display = 'none';
    document.getElementById('btnOpenWAPausar').style.display = 'inline-block';
    document.getElementById('btnOpenWACancelar').style.display = 'inline-block';
    document.getElementById('openwaMonitorWrap').style.display = 'block';
    document.getElementById('openwaTerminalLog').innerHTML = '';

    openwaLogTerminal(`Iniciando disparo em massa: ${openwaDisparoState.total} contatos selecionados.`, 'info');
    if (imagemAnexo) openwaLogTerminal(`Mensagem inclui anexo de imagem corporativa.`, 'info');

    openwaExecutarLoopDisparo();
}

async function openwaExecutarLoopDisparo() {
    const state = openwaDisparoState;
    const cfg = OpenWAService.obterConfig();
    const contatos = openwaContatosFiltrados;

    while (state.ativo && state.indiceAtual < state.total) {
        if (state.cancelado) {
            openwaLogTerminal('Disparo cancelado pelo usuário.', 'warn');
            break;
        }

        if (state.pausado) {
            openwaLogTerminal('Disparo pausado. Aguardando retomada...', 'warn');
            return;
        }

        // Checagem de descanso periódico para proteger número
        const enviadosAteAgora = state.enviadosSucesso + state.falhas;
        if (enviadosAteAgora > 0 && enviadosAteAgora % cfg.pausarAposN === 0) {
            const minutos = cfg.tempoPausaMinutos || 5;
            openwaLogTerminal(`Pausa de segurança ativada após ${enviadosAteAgora} envios. Aguardando ${minutos} minutos de descanso...`, 'warn');
            document.getElementById('openwaStatusTexto').textContent = `Descanso de segurança (${minutos} min)...`;
            await OpenWAService.dormir(minutos * 60 * 1000);
            if (state.cancelado || !state.ativo) break;
        }

        const lead = contatos[state.indiceAtual];
        const statusItem = document.getElementById(`openwa-status-${lead.id}`);
        if (statusItem) {
            statusItem.className = 'badge-status-item enviando';
            statusItem.textContent = 'Enviando...';
        }

        document.getElementById('openwaStatusTexto').textContent = `Enviando para ${lead.empresa} (${state.indiceAtual + 1}/${state.total})...`;

        // Montar mensagem personalizada
        const textoPersonalizado = whatsappFilaVariaveis(state.mensagemTemplate, lead);
        const digitos = whatsappTelefoneLead(lead);
        const numeroDestino = `${CONFIG.WHATSAPP_COUNTRY_CODE}${digitos}`;

        try {
            if (state.imagem) {
                await OpenWAService.enviarImagem(numeroDestino, state.imagem, textoPersonalizado);
            } else {
                await OpenWAService.enviarTexto(numeroDestino, textoPersonalizado);
            }

            state.enviadosSucesso++;
            if (statusItem) {
                statusItem.className = 'badge-status-item sucesso';
                statusItem.textContent = 'Enviado';
            }
            openwaLogTerminal(`[${state.indiceAtual + 1}/${state.total}] ✅ Enviado para ${lead.empresa} (${numeroDestino})`, 'success');

            // Registrar no log geral do WhatsApp
            whatsappLog.unshift({
                id: gerarId(),
                data: hoje(),
                hora: new Date().toTimeString().slice(0, 5),
                leadId: lead.id,
                empresa: lead.empresa,
                telefone: lead.whatsapp || lead.telefone,
                mensagem: textoPersonalizado,
                status: 'enviado_openwa',
                campanhaId: state.campanhaNome,
                usuarioId: usuarioAtual.id
            });

            // Registrar no histórico do lead
            if (!lead.historico) lead.historico = [];
            lead.historico.push({
                data: hoje(),
                hora: new Date().toTimeString().slice(0, 5),
                tipo: 'WhatsApp',
                descricao: `Disparo automático Open-WA: "${textoPersonalizado.substring(0, 80)}..."`
            });

        } catch (err) {
            state.falhas++;
            if (statusItem) {
                statusItem.className = 'badge-status-item erro';
                statusItem.textContent = 'Falha';
            }
            openwaLogTerminal(`[${state.indiceAtual + 1}/${state.total}] ❌ Falha em ${lead.empresa} (${numeroDestino}): ${err.message}`, 'error');
        }

        state.indiceAtual++;

        // Atualizar barra de progresso
        const perc = Math.round((state.indiceAtual / state.total) * 100);
        document.getElementById('openwaProgressBar').style.width = `${perc}%`;
        document.getElementById('openwaProgressoTexto').textContent = `${state.indiceAtual} / ${state.total} (${perc}%)`;

        salvarDados();

        // Intervalo aleatório de segurança antes do próximo envio
        if (state.indiceAtual < state.total && !state.cancelado && !state.pausado) {
            const delayMs = OpenWAService.obterDelayAleatorioMs();
            openwaLogTerminal(`Aguardando ${(delayMs / 1000).toFixed(1)}s (antiban delay)...`, 'info');
            await OpenWAService.dormir(delayMs);
        }
    }

    openwaFinalizarDisparo();
}

function openwaPausarDisparo() {
    if (!openwaDisparoState.ativo) return;
    openwaDisparoState.pausado = true;
    document.getElementById('btnOpenWAPausar').textContent = '▶️ Retomar';
    document.getElementById('btnOpenWAPausar').onclick = openwaRetomarDisparo;
    document.getElementById('openwaStatusTexto').textContent = 'Disparo pausado.';
}

function openwaRetomarDisparo() {
    if (!openwaDisparoState.ativo) return;
    openwaDisparoState.pausado = false;
    document.getElementById('btnOpenWAPausar').textContent = '⏸️ Pausar';
    document.getElementById('btnOpenWAPausar').onclick = openwaPausarDisparo;
    openwaLogTerminal('Retomando disparo em massa...', 'info');
    openwaExecutarLoopDisparo();
}

function openwaCancelarDisparo() {
    if (!openwaDisparoState.ativo) return;
    if (confirm('Deseja realmente cancelar o disparo em massa? Os contatos já enviados permanecerão registrados.')) {
        openwaDisparoState.cancelado = true;
        openwaDisparoState.ativo = false;
        openwaFinalizarDisparo();
    }
}

function openwaFinalizarDisparo() {
    const state = openwaDisparoState;
    state.ativo = false;
    document.getElementById('btnOpenWAIniciar').style.display = 'inline-block';
    document.getElementById('btnOpenWAPausar').style.display = 'none';
    document.getElementById('btnOpenWACancelar').style.display = 'none';

    document.getElementById('openwaStatusTexto').textContent = `Disparo finalizado: ${state.enviadosSucesso} enviado(s), ${state.falhas} falha(s).`;
    openwaLogTerminal(`=== DISPARO CONCLUÍDO: ${state.enviadosSucesso} sucessos, ${state.falhas} falhas ===`, 'success');

    // Registrar campanha em campanhas globais
    whatsappCampanhas.unshift({
        id: gerarId(),
        nome: state.campanhaNome || `Campanha Open-WA`,
        criadaEm: new Date().toISOString(),
        status: 'concluida',
        total: state.total,
        sucessos: state.enviadosSucesso,
        falhas: state.falhas
    });

    salvarDados();
    renderizarAll();
    showToast(`Disparo em massa finalizado! ${state.enviadosSucesso} mensagens enviadas.`, 'success');
}


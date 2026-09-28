// ============================================
// MARKETING - MODELOS
// ============================================
function abrirModalModelo(modeloId = null) {
    const form = document.getElementById('modeloForm');
    form.reset();

    if (modeloId) {
        const modelo = modelos.find(m => m.id === modeloId);
        if (!modelo) return;
        document.getElementById('modeloModalTitle').textContent = 'Editar Modelo';
        document.getElementById('modeloId').value = modeloId;
        document.getElementById('mNome').value = modelo.nome || '';
        document.getElementById('mAssunto').value = modelo.assunto || '';
        document.getElementById('mConteudo').value = modelo.conteudo || '';
    } else {
        document.getElementById('modeloModalTitle').textContent = 'Novo Modelo de Email';
        document.getElementById('modeloId').value = '';
    }

    abrirModal('modeloModal');
}

function salvarModelo(event) {
    event.preventDefault();
    const id = document.getElementById('modeloId').value;
    const nome = document.getElementById('mNome').value.trim();
    const assunto = document.getElementById('mAssunto').value.trim();
    const conteudo = document.getElementById('mConteudo').value.trim();

    if (!nome || !assunto || !conteudo) {
        showToast('Preencha todos os campos!', 'error');
        return;
    }

    if (id) {
        const index = modelos.findIndex(m => m.id === id);
        if (index !== -1) {
            modelos[index] = { ...modelos[index], nome, assunto, conteudo };
            showToast('Modelo atualizado!');
        }
    } else {
        modelos.push({ id: gerarId(), nome, assunto, conteudo });
        showToast('Modelo criado!');
    }

    salvarDados();
    fecharModal('modeloModal');
    renderizarMarketing();
}

function excluirModelo(id) {
    if (!confirm('Remover este modelo?')) return;
    modelos = modelos.filter(m => m.id !== id);
    salvarDados();
    renderizarMarketing();
    showToast('Modelo removido!');
}

function inserirTag(tag) {
    const textarea = document.getElementById('mConteudo');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    textarea.value = text.substring(0, start) + tag + text.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + tag.length;
}

// ============================================
// MARKETING - CAMPANHAS
// ============================================
let envioMassaAtual = null;

function atualizarOpcoesMetodoCampanha() {
    const metodoSelect = document.getElementById('cMetodoEnvio');
    const painelCopiaOculta = document.getElementById('cPainelCopiaOculta');
    const btnSalvarEAbrir = document.getElementById('btnSalvarEAbrirEnvioMassa');
    const metodo = metodoSelect ? metodoSelect.value : 'copia_oculta';

    if (painelCopiaOculta) {
        painelCopiaOculta.style.display = metodo === 'copia_oculta' ? 'block' : 'none';
    }
    if (btnSalvarEAbrir) {
        btnSalvarEAbrir.style.display = metodo === 'copia_oculta' ? 'inline-flex' : 'none';
    }
    atualizarPreviaContatosCampanha();
}

function extrairContatosCampanha(campanha) {
    const leadsVisiveis = typeof getLeadsVisiveis === 'function' ? getLeadsVisiveis() : (typeof leads !== 'undefined' ? leads : []);
    const contatos = [];
    const emailsVistos = new Set();

    leadsVisiveis.forEach(l => {
        if (!l.email) return;
        if (campanha.alvo && campanha.alvo.length > 0 && !campanha.alvo.includes(l.etapa)) return false;
        if (campanha.classificacoes && campanha.classificacoes.length > 0 && !campanha.classificacoes.includes(l.classificacao || 'outros')) return false;

        // Separar múltiplos e-mails caso existam (vírgula, ponto e vírgula, espaço ou barra)
        const partesEmail = String(l.email).split(/[;,/ ]+/).map(e => e.trim()).filter(Boolean);
        partesEmail.forEach(email => {
            const emailLimpo = email.toLowerCase();
            if (emailLimpo.includes('@') && emailLimpo.includes('.')) {
                if (!emailsVistos.has(emailLimpo)) {
                    emailsVistos.add(emailLimpo);
                    contatos.push({
                        leadId: l.id,
                        empresa: l.empresa || 'Sem nome',
                        decisor: l.decisor || '',
                        etapa: l.etapa || '',
                        classificacao: l.classificacao || 'outros',
                        email: email
                    });
                }
            }
        });
    });

    return contatos;
}

function dividirContatosEmPartes(contatos, limitePorLote = 100) {
    const limite = Math.max(1, parseInt(limitePorLote, 10) || 100);
    const partes = [];
    for (let i = 0; i < contatos.length; i += limite) {
        const slice = contatos.slice(i, i + limite);
        const parteNum = Math.floor(i / limite) + 1;
        partes.push({
            parteNum: parteNum,
            inicioIndex: i + 1,
            fimIndex: i + slice.length,
            contatos: slice,
            emailsStr: slice.map(c => c.email).join(', '),
            enviado: false,
            aberto: false,
            enviadoEm: null
        });
    }
    return partes;
}

function atualizarPreviaContatosCampanha() {
    const infoEl = document.getElementById('cPreviaContatosInfo');
    if (!infoEl) return;

    const alvoSelect = document.getElementById('cAlvo');
    const classifSelect = document.getElementById('cClassificacao');
    const limiteInput = document.getElementById('cLimitePorLote');

    const alvo = alvoSelect ? Array.from(alvoSelect.selectedOptions).map(o => o.value) : [];
    const classificacoes = classifSelect ? Array.from(classifSelect.selectedOptions).map(o => o.value) : [];
    const limitePorLote = limiteInput ? parseInt(limiteInput.value, 10) || 100 : 100;

    const dummyCampanha = { alvo, classificacoes };
    const contatos = extrairContatosCampanha(dummyCampanha);

    if (contatos.length === 0) {
        infoEl.innerHTML = '<span style="color:#ef4444;">⚠️ Nenhum lead com e-mail encontrado para os filtros selecionados.</span>';
        return;
    }

    const partes = dividirContatosEmPartes(contatos, limitePorLote);
    const partesTexto = partes.map(p => `Parte ${p.parteNum}: ${p.contatos.length} contatos`).join(', ');

    infoEl.innerHTML = `
        <span style="color:#10b981;font-weight:600;">✓ ${contatos.length} contatos qualificados encontrados</span> 
        • <strong>${partes.length} parte(s) de envio</strong> (máx. ${limitePorLote} por lote):
        <div style="margin-top:3px;font-size:11px;color:var(--text-secondary);">${partesTexto}</div>
    `;
}

function abrirModalCampanha(campanhaId = null) {
    const form = document.getElementById('campanhaForm');
    form.reset();

    const select = document.getElementById('cModelo');
    select.innerHTML = '<option value="">Selecione um modelo</option>' +
        modelos.map(m => `<option value="${m.id}">${m.nome}</option>`).join('');

    const campoEmailPrincipal = document.getElementById('cEmailPrincipal');
    const campoLimitePorLote = document.getElementById('cLimitePorLote');
    const campoMetodoEnvio = document.getElementById('cMetodoEnvio');

    if (campanhaId) {
        const campanha = campanhas.find(c => c.id === campanhaId);
        if (!campanha) return;
        document.getElementById('campanhaModalTitle').textContent = 'Editar Campanha';
        document.getElementById('campanhaId').value = campanhaId;
        document.getElementById('cNome').value = campanha.nome || '';
        document.getElementById('cModelo').value = campanha.modeloId || '';
        document.getElementById('cStatus').value = campanha.status || 'ativa';
        document.getElementById('cDataInicio').value = campanha.dataInicio || '';
        document.getElementById('cDataFim').value = campanha.dataFim || '';
        document.getElementById('cDescricao').value = campanha.descricao || '';
        if (campoMetodoEnvio) campoMetodoEnvio.value = campanha.metodoEnvio || 'copia_oculta';
        if (campoEmailPrincipal) campoEmailPrincipal.value = campanha.emailPrincipal || 'vendas4.cps@microautomacao.com.br';
        if (campoLimitePorLote) campoLimitePorLote.value = campanha.limitePorLote || 100;

        if (campanha.alvo) {
            const opts = document.getElementById('cAlvo').options;
            for (let opt of opts) {
                opt.selected = campanha.alvo.includes(opt.value);
            }
        }
        if (campanha.classificacoes && document.getElementById('cClassificacao')) {
            const opts = document.getElementById('cClassificacao').options;
            for (let opt of opts) {
                opt.selected = campanha.classificacoes.includes(opt.value);
            }
        }
    } else {
        document.getElementById('campanhaModalTitle').textContent = 'Nova Campanha';
        document.getElementById('campanhaId').value = '';
        document.getElementById('cStatus').value = 'ativa';
        if (campoMetodoEnvio) campoMetodoEnvio.value = 'copia_oculta';
        if (campoEmailPrincipal) campoEmailPrincipal.value = 'vendas4.cps@microautomacao.com.br';
        if (campoLimitePorLote) campoLimitePorLote.value = 100;

        if (document.getElementById('cClassificacao')) {
            const opts = document.getElementById('cClassificacao').options;
            for (let opt of opts) opt.selected = false;
        }
    }

    // Vincular listeners para recalcular prévia dinamicamente
    const cAlvo = document.getElementById('cAlvo');
    const cClassif = document.getElementById('cClassificacao');
    if (cAlvo) cAlvo.onchange = atualizarPreviaContatosCampanha;
    if (cClassif) cClassif.onchange = atualizarPreviaContatosCampanha;

    atualizarOpcoesMetodoCampanha();
    abrirModal('campanhaModal');
}

function salvarCampanha(event, abrirEnvioMassaApos = false) {
    if (event && event.preventDefault) event.preventDefault();
    const id = document.getElementById('campanhaId').value;
    const nome = document.getElementById('cNome').value.trim();
    const modeloId = document.getElementById('cModelo').value;
    const status = document.getElementById('cStatus').value;
    const dataInicio = document.getElementById('cDataInicio').value;
    const dataFim = document.getElementById('cDataFim').value;
    const descricao = document.getElementById('cDescricao').value.trim();

    const metodoEnvio = document.getElementById('cMetodoEnvio') ? document.getElementById('cMetodoEnvio').value : 'copia_oculta';
    const emailPrincipal = document.getElementById('cEmailPrincipal')
        ? (document.getElementById('cEmailPrincipal').value.trim() || 'vendas4.cps@microautomacao.com.br')
        : 'vendas4.cps@microautomacao.com.br';
    const limitePorLote = document.getElementById('cLimitePorLote')
        ? Math.max(5, parseInt(document.getElementById('cLimitePorLote').value, 10) || 100)
        : 100;

    const alvoSelect = document.getElementById('cAlvo');
    const alvo = alvoSelect ? Array.from(alvoSelect.selectedOptions).map(opt => opt.value) : [];

    const classifSelect = document.getElementById('cClassificacao');
    const classificacoes = classifSelect ? Array.from(classifSelect.selectedOptions).map(opt => opt.value) : [];

    if (!nome || !modeloId) {
        showToast('Preencha o nome da campanha e selecione um modelo de e-mail!', 'error');
        return;
    }

    let savedId = id;

    if (id) {
        const index = campanhas.findIndex(c => c.id === id);
        if (index !== -1) {
            campanhas[index] = {
                ...campanhas[index],
                nome,
                modeloId,
                status,
                dataInicio,
                dataFim,
                descricao,
                alvo,
                classificacoes,
                metodoEnvio,
                emailPrincipal,
                limitePorLote
            };
            showToast('Campanha atualizada!');
        }
    } else {
        savedId = gerarId();
        campanhas.push({
            id: savedId,
            nome,
            modeloId,
            status,
            dataInicio,
            dataFim,
            descricao,
            alvo,
            classificacoes,
            metodoEnvio,
            emailPrincipal,
            limitePorLote,
            criadaEm: new Date().toISOString(),
            emailsEnviados: 0,
            usuarioId: usuarioAtual.id
        });
        showToast('Campanha criada com sucesso!');
    }

    salvarDados();
    fecharModal('campanhaModal');
    renderizarMarketing();

    if (abrirEnvioMassaApos && savedId) {
        setTimeout(() => {
            abrirModalEnvioMassaBcc(savedId);
        }, 150);
    }
}

function salvarEAbrirEnvioMassa(event) {
    salvarCampanha(event, true);
}

function excluirCampanha(id) {
    if (!confirm('Remover esta campanha?')) return;
    campanhas = campanhas.filter(c => c.id !== id);
    salvarDados();
    renderizarMarketing();
    showToast('Campanha removida!');
}

// ============================================
// ENVIO EM MASSA VIA CÓPIA OCULTA (BCC)
// ============================================
function formatarTextoCampanhaMassa(texto) {
    if (!texto) return '';
    return texto
        .replace(/\{\{empresa\}\}/gi, 'Prezados Clientes e Parceiros')
        .replace(/\{\{decisor\}\}/gi, 'Prezado(a)')
        .replace(/\{\{valor\}\}/gi, '')
        .replace(/\{\{email\}\}/gi, '')
        .replace(/\{\{telefone\}\}/gi, '')
        .replace(/\{\{classificacao\}\}/gi, 'Clientes');
}

function abrirModalEnvioMassaBcc(campanhaId) {
    const campanha = campanhas.find(c => c.id === campanhaId);
    if (!campanha) {
        showToast('Campanha não encontrada!', 'error');
        return;
    }

    const modelo = modelos.find(m => m.id === campanha.modeloId);
    if (!modelo) {
        showToast('Esta campanha não possui modelo de e-mail associado. Edite a campanha e selecione um modelo.', 'warning');
        return;
    }

    const contatos = extrairContatosCampanha(campanha);
    const limitePorLote = campanha.limitePorLote || 100;
    const partes = dividirContatosEmPartes(contatos, limitePorLote);

    const emailPrincipal = campanha.emailPrincipal || 'vendas4.cps@microautomacao.com.br';
    const assuntoFormatado = formatarTextoCampanhaMassa(modelo.assunto || campanha.nome);
    const corpoFormatado = formatarTextoCampanhaMassa(modelo.conteudo || '');

    envioMassaAtual = {
        campanhaId: campanha.id,
        campanha: campanha,
        modelo: modelo,
        emailPrincipal: emailPrincipal,
        assunto: assuntoFormatado,
        corpo: corpoFormatado,
        contatos: contatos,
        limitePorLote: limitePorLote,
        partes: partes
    };

    // Preencher campos do modal
    const modalTitle = document.getElementById('envioMassaModalTitle');
    const modalSub = document.getElementById('envioMassaModalSub');
    const toInput = document.getElementById('envioMassaToInput');
    const assuntoInput = document.getElementById('envioMassaAssuntoInput');
    const corpoInput = document.getElementById('envioMassaCorpoInput');
    const badgeContatos = document.getElementById('envioMassaBadgeContatos');
    const badgePartes = document.getElementById('envioMassaBadgePartes');

    if (modalTitle) modalTitle.textContent = `Envio em Massa: ${campanha.nome}`;
    if (modalSub) modalSub.textContent = `Modelo: ${modelo.nome} • Destinatário Principal: ${emailPrincipal}`;
    if (toInput) toInput.value = emailPrincipal;
    if (assuntoInput) assuntoInput.value = assuntoFormatado;
    if (corpoInput) corpoInput.value = corpoFormatado;
    if (badgeContatos) badgeContatos.textContent = `${contatos.length} contato(s) qualificado(s)`;
    if (badgePartes) badgePartes.textContent = `${partes.length} parte(s) (máx. ${limitePorLote})`;

    renderizarLotesEnvioMassa();
    abrirModal('modalEnvioMassaBcc');
}

function renderizarLotesEnvioMassa() {
    const container = document.getElementById('envioMassaLotesContainer');
    if (!container || !envioMassaAtual) return;

    const partes = envioMassaAtual.partes;
    const temGmail = localStorage.getItem('gmail_access_token') && Date.now() < parseInt(localStorage.getItem('gmail_token_expiry') || '0');
    const temOutlook = localStorage.getItem('outlook_access_token') && Date.now() < parseInt(localStorage.getItem('outlook_token_expiry') || '0');

    if (partes.length === 0) {
        container.innerHTML = `
            <div class="empty-state compact" style="padding:28px 20px;text-align:center;background:var(--bg-card);border:1px dashed var(--border-color);border-radius:var(--radius);">
                <span class="emoji-big" style="font-size:32px;">📭</span>
                <h4 style="margin:8px 0 4px;font-size:15px;">Nenhum lead com e-mail encontrado</h4>
                <p class="text-xs text-muted" style="max-width:500px;margin:0 auto 12px;">
                    Não encontramos leads com e-mail válido nas etapas e classificações selecionadas para esta campanha.
                </p>
                <button type="button" class="btn btn-outline btn-sm" onclick="fecharModal('modalEnvioMassaBcc');abrirModalCampanha('${envioMassaAtual.campanhaId}')">
                    Editar Filtros da Campanha
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = partes.map((lote, index) => {
        const isEnviado = lote.enviado;
        const statusBadge = isEnviado
            ? `<span class="badge" style="background:#10b981;color:#fff;font-size:11px;padding:3px 8px;border-radius:10px;">✓ Enviado (${lote.enviadoEm || 'Hoje'})</span>`
            : lote.aberto
            ? `<span class="badge" style="background:#f59e0b;color:#fff;font-size:11px;padding:3px 8px;border-radius:10px;">Aberto no Webmail</span>`
            : `<span class="badge" style="background:var(--text-muted);color:#fff;font-size:11px;padding:3px 8px;border-radius:10px;">Pendente</span>`;

        return `
            <div class="envio-massa-lote-card ${isEnviado ? 'enviado' : ''}" id="cardLote-${index}">
                <div class="envio-massa-lote-header">
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <span class="envio-massa-tag-parte">Parte ${lote.parteNum} de ${partes.length}</span>
                        <strong style="font-size:14px;">${lote.contatos.length} destinatários (Contatos #${lote.inicioIndex} a #${lote.fimIndex})</strong>
                    </div>
                    <div>${statusBadge}</div>
                </div>

                <!-- Campo de E-mails em Cco -->
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;flex-wrap:wrap;gap:6px;">
                        <span class="text-xs text-muted" style="font-weight:600;">E-mails em Cópia Oculta (BCC / Cco):</span>
                        <div style="display:flex;gap:6px;">
                            <button type="button" class="btn btn-outline btn-xs" id="btnCopiarEmailsLote-${index}" onclick="copiarEmailsLote(${index})" title="Copiar todos os e-mails desta parte">
                                📋 Copiar ${lote.contatos.length} E-mails
                            </button>
                            <button type="button" class="btn btn-outline btn-xs" id="btnToggleDetalhes-${index}" onclick="toggleDetalhesLote(${index})">
                                👥 Ver Lista (${lote.contatos.length})
                            </button>
                        </div>
                    </div>
                    <textarea readonly class="form-control" style="width:100%;height:50px;font-size:11.5px;font-family:monospace;padding:6px 8px;background:var(--bg-primary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:4px;resize:none;">${lote.emailsStr}</textarea>
                    
                    <div id="detalhesLote-${index}" style="display:none;margin-top:8px;max-height:160px;overflow-y:auto;border:1px solid var(--border-color);border-radius:4px;padding:6px 10px;background:var(--bg-primary);font-size:12px;">
                        <div style="display:flex;justify-content:space-between;font-weight:700;padding-bottom:4px;border-bottom:1px solid var(--border-color);margin-bottom:4px;font-size:11px;color:var(--text-muted);">
                            <span>EMPRESA</span>
                            <span>E-MAIL</span>
                        </div>
                        ${lote.contatos.map(c => `
                            <div class="envio-massa-lead-item">
                                <span style="font-weight:600;">${c.empresa} ${c.decisor ? `<small style="font-weight:normal;color:var(--text-muted);">(${c.decisor})</small>` : ''}</span>
                                <span style="font-family:monospace;color:var(--text-secondary);">${c.email}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Barra de Ações Rápidas -->
                <div class="envio-massa-actions-bar">
                    <span class="text-xs text-muted" style="margin-right:4px;">Abrir envio:</span>
                    <button type="button" class="btn btn-primary btn-xs" id="btnGmailLote-${index}" onclick="abrirDisparoLote('gmail', ${index})" title="Abrir no Gmail Web com destinatários em Cco">
                        🚀 Abrir Gmail Web
                    </button>
                    <button type="button" class="btn btn-info btn-xs" id="btnOutlookLote-${index}" onclick="abrirDisparoLote('outlook', ${index})" title="Abrir no Outlook Web com destinatários em Cco">
                        📧 Abrir Outlook Web
                    </button>
                    <button type="button" class="btn btn-outline btn-xs" id="btnMailtoLote-${index}" onclick="abrirDisparoLote('mailto', ${index})" title="Abrir no aplicativo padrão de e-mail (mailto:)">
                        ✉️ E-mail Padrão (mailto:)
                    </button>
                    ${temGmail ? `
                        <button type="button" class="btn btn-success btn-xs" id="btnGmailApiLote-${index}" onclick="enviarLoteGmailApi(${index})" title="Disparar esta parte via Gmail API conectada">
                            ⚡ Enviar via Gmail API
                        </button>
                    ` : ''}
                    <div style="margin-left:auto;">
                        <button type="button" class="btn ${isEnviado ? 'btn-outline' : 'btn-success'} btn-xs" id="btnMarcarEnviadoLote-${index}" onclick="marcarLoteEnviado(${index})">
                            ${isEnviado ? '✓ Registrar Novamente' : '✓ Registrar Envio no CRM'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function abrirDisparoLote(provedor, loteIndex) {
    if (!envioMassaAtual || !envioMassaAtual.partes || !envioMassaAtual.partes[loteIndex]) return;
    const lote = envioMassaAtual.partes[loteIndex];
    const to = (document.getElementById('envioMassaToInput')?.value || envioMassaAtual.emailPrincipal || 'vendas4.cps@microautomacao.com.br').trim();
    const assunto = (document.getElementById('envioMassaAssuntoInput')?.value || envioMassaAtual.assunto || '').trim();
    const corpo = (document.getElementById('envioMassaCorpoInput')?.value || envioMassaAtual.corpo || '').trim();
    const bccList = lote.contatos.map(c => c.email).join(',');

    let url = '';
    if (provedor === 'gmail') {
        url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&bcc=${encodeURIComponent(bccList)}&su=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    } else if (provedor === 'outlook') {
        url = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(to)}&bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    } else if (provedor === 'mailto') {
        url = `mailto:${encodeURIComponent(to)}?bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    }

    if (url.length > 2000) {
        copiarTexto(bccList, `Parte ${lote.parteNum}: ${lote.contatos.length} e-mails copiados para a Área de Transferência!`);
        showToast(`Abrindo ${provedor === 'gmail' ? 'Gmail' : provedor === 'outlook' ? 'Outlook' : 'E-mail'}! Os ${lote.contatos.length} e-mails da Parte ${lote.parteNum} também foram copiados para a Área de Transferência (caso precise colar no campo Cco).`, 'info');
    } else {
        showToast(`Abrindo ${provedor === 'gmail' ? 'Gmail' : provedor === 'outlook' ? 'Outlook' : 'E-mail'} com os ${lote.contatos.length} contatos da Parte ${lote.parteNum}...`, 'success');
    }

    if (provedor === 'mailto') {
        window.location.href = url;
    } else {
        window.open(url, '_blank');
    }

    lote.aberto = true;
    renderizarLotesEnvioMassa();
}

function copiarEmailsLote(loteIndex) {
    if (!envioMassaAtual || !envioMassaAtual.partes || !envioMassaAtual.partes[loteIndex]) return;
    const lote = envioMassaAtual.partes[loteIndex];
    const bccList = lote.contatos.map(c => c.email).join(', ');
    copiarTexto(bccList, `✓ ${lote.contatos.length} e-mails da Parte ${lote.parteNum} copiados! Basta colar no campo Cco do e-mail.`);
}

function toggleDetalhesLote(loteIndex) {
    const el = document.getElementById(`detalhesLote-${loteIndex}`);
    if (!el) return;
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function alternarPreviaCorpoMassa() {
    const wrap = document.getElementById('envioMassaCorpoWrap');
    if (!wrap) return;
    wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
}

function marcarLoteEnviado(loteIndex) {
    if (!envioMassaAtual || !envioMassaAtual.partes || !envioMassaAtual.partes[loteIndex]) return;
    const lote = envioMassaAtual.partes[loteIndex];
    const campanha = envioMassaAtual.campanha;
    const to = (document.getElementById('envioMassaToInput')?.value || envioMassaAtual.emailPrincipal || 'vendas4.cps@microautomacao.com.br').trim();
    const assunto = (document.getElementById('envioMassaAssuntoInput')?.value || envioMassaAtual.assunto || '').trim();

    const hojeStr = hoje();
    const horaStr = new Date().toTimeString().slice(0, 5);

    let novosEnviados = 0;
    lote.contatos.forEach(contato => {
        const lead = leads.find(l => l.id === contato.leadId);
        if (lead) {
            if (!lead.historico) lead.historico = [];
            lead.historico.push({
                data: hojeStr,
                hora: horaStr,
                tipo: 'Campanha (Cópia Oculta)',
                descricao: `Campanha "${campanha.nome}" (Parte ${lote.parteNum} - Cópia Oculta) • Para: ${to} • Assunto: ${assunto}`
            });
            novosEnviados++;
        }
    });

    const logItem = {
        id: gerarId(),
        data: hojeStr,
        hora: horaStr,
        empresa: `Lote ${lote.parteNum} (${lote.contatos.length} leads)`,
        email: `${to} (Cco: ${lote.contatos.length} contatos)`,
        assunto: assunto,
        campanha: campanha.nome,
        provedor: 'copia-oculta',
        status: 'enviado',
        usuarioId: usuarioAtual.id
    };
    emailLog.unshift(logItem);

    campanha.emailsEnviados = (campanha.emailsEnviados || 0) + novosEnviados;
    lote.enviado = true;
    lote.enviadoEm = `${hojeStr} ${horaStr}`;

    salvarDados();
    renderizarMarketing();
    renderizarLotesEnvioMassa();
    showToast(`✓ Parte ${lote.parteNum} registrada! Histórico atualizado para ${novosEnviados} lead(s).`, 'success');
}

function marcarTodosLotesComoEnviados() {
    if (!envioMassaAtual || !envioMassaAtual.partes || envioMassaAtual.partes.length === 0) return;
    const pendentes = envioMassaAtual.partes.filter(p => !p.enviado);
    if (pendentes.length === 0) {
        showToast('Todas as partes já foram marcadas como enviadas!', 'info');
        return;
    }

    if (!confirm(`Deseja registrar o envio de todas as ${pendentes.length} parte(s) pendente(s) no histórico dos leads e log do CRM?`)) {
        return;
    }

    envioMassaAtual.partes.forEach((_, idx) => {
        if (!envioMassaAtual.partes[idx].enviado) {
            marcarLoteEnviado(idx);
        }
    });

    showToast('✓ Todas as partes foram registradas como enviadas no CRM!', 'success');
}

async function enviarLoteGmailApi(loteIndex) {
    if (!envioMassaAtual || !envioMassaAtual.partes || !envioMassaAtual.partes[loteIndex]) return;
    const lote = envioMassaAtual.partes[loteIndex];
    const token = localStorage.getItem('gmail_access_token');
    const expiry = parseInt(localStorage.getItem('gmail_token_expiry') || '0');

    if (!token || Date.now() >= expiry) {
        showToast('Conexão com Gmail expirada ou não autenticada.', 'warning');
        return;
    }

    const to = (document.getElementById('envioMassaToInput')?.value || envioMassaAtual.emailPrincipal || 'vendas4.cps@microautomacao.com.br').trim();
    const assunto = (document.getElementById('envioMassaAssuntoInput')?.value || envioMassaAtual.assunto || '').trim();
    const corpo = (document.getElementById('envioMassaCorpoInput')?.value || envioMassaAtual.corpo || '').trim();
    const bccEmails = lote.contatos.map(c => c.email);

    if (!confirm(`Enviar Parte ${lote.parteNum} (${bccEmails.length} destinatários em Cco) para ${to} via Gmail API?`)) {
        return;
    }

    try {
        const emailLines = [
            `From: ${localStorage.getItem('gmail_user_email') || to}`,
            `To: ${to}`,
            `Bcc: ${bccEmails.join(', ')}`,
            `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(assunto)))}?=`,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 7bit',
            '',
            corpo
        ];

        const raw = btoa(unescape(encodeURIComponent(emailLines.join('\r\n'))))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ raw })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Falha na requisição');
        }

        marcarLoteEnviado(loteIndex);
        showToast(`✓ Parte ${lote.parteNum} enviada com sucesso via Gmail API!`, 'success');
    } catch (e) {
        console.error('Erro ao enviar lote Gmail:', e);
        showToast('Erro no envio via API: ' + e.message, 'error');
    }
}

async function executarCampanha(id) {
    const campanha = campanhas.find(c => c.id === id);
    if (!campanha) return;

    // Se a campanha estiver configurada para cópia oculta (ou padrão), abre a página de envio em massa BCC
    if (campanha.metodoEnvio === 'copia_oculta' || !campanha.metodoEnvio) {
        abrirModalEnvioMassaBcc(id);
        return;
    }

    const modelo = modelos.find(m => m.id === campanha.modeloId);
    if (!modelo) {
        showToast('Modelo não encontrado!', 'error');
        return;
    }

    // Verificar integração
    const provedor = localStorage.getItem('ploomesEmailProvider');
    if (!provedor) {
        showToast('Conecte-se ao Gmail ou Outlook primeiro!', 'warning');
        return;
    }

    // Filtrar leads (apenas os visíveis)
    let alvos = [];
    const leadsVisiveis = getLeadsVisiveis();
    alvos = leadsVisiveis.filter(l => {
        if (!l.email) return false;
        if (campanha.alvo && campanha.alvo.length > 0 && !campanha.alvo.includes(l.etapa)) return false;
        if (campanha.classificacoes && campanha.classificacoes.length > 0 && !campanha.classificacoes.includes(l.classificacao || 'outros')) return false;
        return true;
    });

    if (alvos.length === 0) {
        showToast('Nenhum lead com email encontrado!', 'warning');
        return;
    }

    if (!confirm(`Enviar "${campanha.nome}" para ${alvos.length} leads via ${provedor === 'google' ? 'Gmail' : 'Outlook'}?`))
        return;

    let enviados = 0;
    let erros = 0;
    const total = alvos.length;
    const btnExecutar = document.querySelector(`button[data-campanha-executar="${id}"]`);
    const progressoEl = document.getElementById('campanhaProgresso-' + id);
    if (btnExecutar) { btnExecutar.disabled = true; btnExecutar.textContent = 'Enviando...'; }
    if (progressoEl) progressoEl.style.display = 'block';

    for (const lead of alvos) {
        const classifTexto = typeof CLASSIFICACAO_NOMES !== 'undefined' && CLASSIFICACAO_NOMES[lead.classificacao] ? CLASSIFICACAO_NOMES[lead.classificacao] : (lead.classificacao || 'Outros');
        let assunto = modelo.assunto
            .replace(/\{\{empresa\}\}/g, lead.empresa || '')
            .replace(/\{\{decisor\}\}/g, lead.decisor || '')
            .replace(/\{\{valor\}\}/g, formatarMoeda(lead.valor || 0))
            .replace(/\{\{email\}\}/g, lead.email || '')
            .replace(/\{\{telefone\}\}/g, lead.telefone || '')
            .replace(/\{\{classificacao\}\}/g, classifTexto);

        let conteudo = modelo.conteudo
            .replace(/\{\{empresa\}\}/g, lead.empresa || '')
            .replace(/\{\{decisor\}\}/g, lead.decisor || '')
            .replace(/\{\{valor\}\}/g, formatarMoeda(lead.valor || 0))
            .replace(/\{\{email\}\}/g, lead.email || '')
            .replace(/\{\{telefone\}\}/g, lead.telefone || '')
            .replace(/\{\{classificacao\}\}/g, classifTexto);

        let result = null;
        if (provedor === 'google') {
            result = await enviarEmailGmailReal(lead.email, assunto, conteudo);
        } else if (provedor === 'outlook') {
            result = await enviarEmailOutlookReal(lead.email, assunto, conteudo);
        }

        if (result) {
            const log = {
                id: gerarId(),
                data: hoje(),
                hora: new Date().toTimeString().slice(0, 5),
                leadId: lead.id,
                empresa: lead.empresa,
                email: lead.email,
                assunto: assunto,
                campanha: campanha.nome,
                provedor: provedor,
                status: 'enviado',
                usuarioId: usuarioAtual.id
            };
            emailLog.unshift(log);
            campanha.emailsEnviados = (campanha.emailsEnviados || 0) + 1;

            if (!lead.historico) lead.historico = [];
            lead.historico.push({
                data: hoje(),
                hora: new Date().toTimeString().slice(0, 5),
                tipo: 'Campanha (API)',
                descricao: `Campanha "${campanha.nome}" via ${provedor === 'google' ? 'Gmail' : 'Outlook'}`
            });
            enviados++;
        } else {
            erros++;
        }

        const feitos = enviados + erros;
        if (progressoEl) {
            const pct = Math.round((feitos / total) * 100);
            progressoEl.innerHTML = `
                <div class="bar-track" style="height:10px;"><div class="bar-fill" style="width:${pct}%;height:100%;"></div></div>
                <span class="text-xs text-muted">${feitos}/${total} processados (${enviados} ok, ${erros} erro)</span>
            `;
        }

        // Pequeno delay para não sobrecarregar
        await new Promise(r => setTimeout(r, 1000));
    }

    if (btnExecutar) { btnExecutar.disabled = false; btnExecutar.textContent = 'Executar'; }
    if (progressoEl) progressoEl.style.display = 'none';

    salvarDados();
    renderizarAll();
    showToast(`${enviados} emails enviados, ${erros} erros`);
}

// ============================================
// RENDERIZAR MARKETING
// ============================================
function renderizarMarketing() {
    document.getElementById('totalCampanhas').textContent = campanhas.length;
    document.getElementById('totalModelos').textContent = modelos.length;

    const hojeStr = hoje();
    const enviadosHoje = emailLog.filter(log => log.data === hojeStr);
    document.getElementById('totalEnviadosHoje').textContent = enviadosHoje.length;

    const totalEnvios = emailLog.length;
    const abertos = emailLog.filter(log => log.aberto).length || 0;
    const taxa = totalEnvios > 0 ? Math.round((abertos / totalEnvios) * 100) : 0;
    document.getElementById('taxaAbertura').textContent = taxa + '%';

    // Modelos
    const modelosContainer = document.getElementById('modelosList');
    if (modelos.length === 0) {
        modelosContainer.innerHTML =
            `<div class="empty-state compact"><span class="emoji-big"><span data-icone="nota"></span></span><p class="text-sm">Nenhum modelo criado</p></div>`;
    } else {
        modelosContainer.innerHTML = modelos.map(m => `
            <div class="template-item">
                <div class="template-info">
                    <div class="name">${m.nome}</div>
                    <div class="desc">${m.assunto}</div>
                </div>
                <div class="template-actions">
                    <button class="btn btn-info btn-xs" onclick="abrirModalModelo('${m.id}')"><span data-icone="editar"></span></button>
                    <button class="btn btn-danger btn-xs" onclick="excluirModelo('${m.id}')"><span data-icone="excluir"></span></button>
                </div>
            </div>
        `).join('');
    }

    // Campanhas
    const campanhasContainer = document.getElementById('campanhasList');
    if (campanhas.length === 0) {
        campanhasContainer.innerHTML =
            `<div class="empty-state compact"><span class="emoji-big"><span data-icone="marketing"></span></span><p class="text-sm">Nenhuma campanha criada</p></div>`;
    } else {
        campanhasContainer.innerHTML = campanhas.map(c => {
            const modelo = modelos.find(m => m.id === c.modeloId);
            const statusClass = c.status === 'ativa' ? 'ativa' : c.status === 'pausada' ? 'pausada' :
                'finalizada';
            const statusLabel = c.status === 'ativa' ? 'Ativa' : c.status === 'pausada' ? 'Pausada' :
                'Finalizada';
            const alvoLabel = c.alvo && c.alvo.length > 0 ? c.alvo.map(e => ETAPA_NOMES[e] || e).join(', ') :
                'Todas as etapas';
            const classifLabel = c.classificacoes && c.classificacoes.length > 0
                ? c.classificacoes.map(cl => (typeof CLASSIFICACAO_NOMES !== 'undefined' ? CLASSIFICACAO_NOMES[cl] : cl)).join(', ')
                : 'Todas as classificações';

            const isCopiaOculta = c.metodoEnvio !== 'api';
            const metodoBadge = isCopiaOculta
                ? `<span class="badge" style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;background:rgba(99,102,241,0.12);color:#4f46e5;">Cópia Oculta (BCC - máx. ${c.limitePorLote || 100})</span>`
                : `<span class="badge" style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;background:rgba(16,185,129,0.12);color:#059669;">1 a 1 (API)</span>`;

            return `
                <div class="campaign-item" id="campanha-item-${c.id}">
                    <div class="campaign-header">
                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                            <span class="campaign-name">${c.nome}</span>
                            ${metodoBadge}
                        </div>
                        <span class="campaign-status ${statusClass}">${statusLabel}</span>
                    </div>
                    <div class="campaign-details">
                        Modelo: ${modelo ? modelo.nome : '—'} • Etapas: ${alvoLabel} • Classificação: ${classifLabel}
                        ${isCopiaOculta && c.emailPrincipal ? ` • Para: ${c.emailPrincipal}` : ''}
                        ${c.emailsEnviados !== undefined ? ` • ${c.emailsEnviados} enviados` : ''}
                    </div>
                    <div class="campaign-actions">
                        ${isCopiaOculta ? `
                            <button class="btn btn-primary btn-xs" id="btnDisparoMassa-${c.id}" onclick="abrirModalEnvioMassaBcc('${c.id}')" title="Abrir página de envio em massa por cópia oculta">
                                🚀 Enviar em Massa (BCC)
                            </button>
                        ` : `
                            <button class="btn btn-success btn-xs" data-campanha-executar="${c.id}" onclick="executarCampanha('${c.id}')">Executar (API)</button>
                            <button class="btn btn-outline btn-xs" onclick="abrirModalEnvioMassaBcc('${c.id}')" title="Enviar também via cópia oculta">Envio em Massa (BCC)</button>
                        `}
                        <button class="btn btn-info btn-xs" id="btnEditarCampanha-${c.id}" onclick="abrirModalCampanha('${c.id}')" title="Editar Campanha"><span data-icone="editar"></span></button>
                        <button class="btn btn-danger btn-xs" id="btnExcluirCampanha-${c.id}" onclick="excluirCampanha('${c.id}')" title="Excluir Campanha"><span data-icone="excluir"></span></button>
                    </div>
                    <div class="campanha-progresso" id="campanhaProgresso-${c.id}" style="display:none;"></div>
                </div>
            `;
        }).join('');
    }

    // Log
    const logContainer = document.getElementById('emailLogList');
    document.getElementById('logCount').textContent = emailLog.length;

    if (emailLog.length === 0) {
        logContainer.innerHTML =
            `<div class="empty-state compact"><span class="emoji-big"><span data-icone="exportar"></span></span><p class="text-sm">Nenhum email enviado</p></div>`;
    } else {
        logContainer.innerHTML = emailLog.slice(0, 15).map(log => `
            <div class="email-log-item">
                <div>
                    <strong>${log.empresa}</strong>
                    <span class="text-xs text-muted">${log.email}</span>
                    <div class="text-xs text-muted">${formatarData(log.data)} ${log.hora || ''}</div>
                </div>
                <div>
                    <span class="log-status ${log.status}">${log.status === 'enviado' ? 'Enviado' : log.status === 'manual' ? 'Aberto p/ envio' : log.status === 'erro' ? 'Erro' : 'Pendente'}</span>
                    <span class="text-xs text-muted">${nomeProvedorEmail(log.provedor)}</span>
                </div>
            </div>
        `).join('');

    }

    document.getElementById('marketingCount').textContent = campanhas.filter(c => c.status === 'ativa').length;

    // Atualiza também o painel de Landing Pages caso esteja ativo
    if (typeof renderizarPainelLandingPagesMarketing === 'function') {
        renderizarPainelLandingPagesMarketing();
    }
}

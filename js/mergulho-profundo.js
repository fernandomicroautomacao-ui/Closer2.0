// ============================================================
// MERGULHO PROFUNDO & DOSSIÊ DO LEAD
// Enriquecimento por CNPJ (Receita Federal), Presença Digital,
// Pesquisa de Campo, Questionário com Link e Cross-Selling Micro
// ============================================================

let mergulhoLeadAtualId = null;
let mergulhoDadosCNPJCached = null;

// Inicializa ou recupera os dados de Mergulho Profundo vinculados a um lead
function mergulhoObterDados(lead) {
    if (!lead) return null;
    if (!lead.mergulho) {
        // Tenta recuperar do localStorage caso exista backup
        const salvos = mergulhoCarregarTodos();
        lead.mergulho = salvos[lead.id] || {
            cnpjEnriquecido: null,
            presencaDigital: {
                website: '',
                linkedinEmpresa: '',
                linkedinDecisores: '',
                instagram: '',
                catalogoUrl: '',
                mapsUrl: '',
                notas: ''
            },
            campo: {
                tipoOperacao: 'oem',
                nivelAutomacao: 'semi',
                porteFabril: 'medio',
                maquinasEquipamentos: '',
                marcasPresentes: [],
                diarioVisitas: []
            },
            questionario: {
                respondido: false,
                respondidoEm: null,
                respondidoPor: '',
                focoOperacao: '',
                frequenciaCompra: '',
                linhasConsumo: [],
                cilindrosEspeciais: '',
                fornecedoresAtuais: '',
                desafioFornecedor: '',
                desejoAmostra: '',
                detalhesItemAmostra: '',
                observacoesGerais: ''
            },
            crossSelling: []
        };
    }
    return lead.mergulho;
}

function mergulhoCarregarTodos() {
    try {
        return JSON.parse(localStorage.getItem('ploomesMergulhoV1') || '{}');
    } catch (e) {
        return {};
    }
}

function mergulhoSalvarLocal(leadId, dados) {
    try {
        const todos = mergulhoCarregarTodos();
        todos[leadId] = dados;
        localStorage.setItem('ploomesMergulhoV1', JSON.stringify(todos));
    } catch (e) {
        console.warn('Erro ao salvar mergulho no localStorage:', e);
    }
}

// Navega e abre o Mergulho Profundo direto para um lead específico
function abrirMergulhoProfundoLead(leadId, aba = 'abaQuestionario') {
    mergulhoAbrirParaLead(leadId, aba);
}

// Renderizador principal da tela
function renderizarMergulhoProfundo() {
    const container = document.getElementById('section-mergulho');
    if (!container) return;

    // Dispara sincronização com o backend para buscar diagnósticos preenchidos externamente
    mergulhoSincronizarDiagnosticosRecebidos();

    // Se nenhum lead estiver selecionado, tenta selecionar o primeiro ou manter o atual
    if (!mergulhoLeadAtualId && leads && leads.length > 0) {
        mergulhoLeadAtualId = leads[0].id;
    }

    const lead = leads.find(l => l.id === mergulhoLeadAtualId);
    const dados = lead ? mergulhoObterDados(lead) : null;

    container.innerHTML = `
        <div class="mergulho-header-bar">
            <div>
                <h3 style="font-size:20px;font-weight:700;margin:0 0 4px;display:flex;align-items:center;gap:8px;">
                    <span data-icone="busca"></span> Mergulho Profundo & Dossiê do Lead
                </h3>
                <p class="text-sm text-muted" style="margin:0;">
                    Raio-X completo: Consulta na Receita Federal por CNPJ, Presença Digital, Pesquisa de Campo, Questionário para o Lead e Matriz de Cross-Selling Micro.
                </p>
            </div>
            <div class="mergulho-acoes-topo" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <button type="button" class="btn btn-primary btn-sm" onclick="mergulhoAbrirRelatorioRespondentesModal()" title="Visualizar relatório consolidado de quem já respondeu o questionário e imprimir em PDF">
                    📋 Relatório de Respondentes (PDF)
                </button>
                ${lead ? `
                    <button type="button" class="btn btn-outline btn-sm" onclick="mergulhoExportarDossiePDF()" title="Imprimir ou gerar PDF deste dossiê">
                        📄 Exportar / Imprimir Dossiê
                    </button>
                ` : ''}
            </div>
        </div>

        <!-- BARRA DE SELEÇÃO DE LEAD E BUSCA DE CNPJ -->
        <div class="mergulho-lead-selector-card">
            <div class="mergulho-selector-grid">
                <div class="form-group" style="margin:0;min-width:280px;flex:1;">
                    <label style="font-weight:600;font-size:12px;margin-bottom:4px;display:block;">Selecionar Lead para Análise:</label>
                    <select id="mergulhoSelectLead" class="form-control" onchange="mergulhoSelecionarLead(this.value)" style="width:100%;font-weight:600;">
                        ${leads.map(l => `
                            <option value="${l.id}" ${l.id === mergulhoLeadAtualId ? 'selected' : ''}>
                                ${l.empresa} ${l.cnpj ? `— CNPJ: ${l.cnpj}` : ''} (${ETAPA_NOMES[l.etapa] || l.etapa})
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group" style="margin:0;min-width:240px;flex:1;">
                    <label style="font-weight:600;font-size:12px;margin-bottom:4px;display:block;">Consultar CNPJ na Receita Federal:</label>
                    <div style="display:flex;gap:6px;">
                        <input type="text" id="mergulhoInputCnpj" placeholder="00.000.000/0000-00" 
                            value="${lead ? (lead.cnpj || '') : ''}" 
                            class="form-control" style="font-family:monospace;font-weight:600;">
                        <button type="button" class="btn btn-primary btn-sm" onclick="mergulhoDispararConsultaCNPJ()" id="btnMergulhoBuscarCnpj" title="Buscar dados da empresa na Receita Federal via BrasilAPI">
                            🔍 Buscar
                        </button>
                    </div>
                </div>
            </div>

            ${lead ? `
                <div class="mergulho-lead-meta-pill">
                    <span>Etapa: <strong>${ETAPA_NOMES[lead.etapa] || lead.etapa}</strong></span>
                    <span>•</span>
                    <span>Cidade: <strong>${lead.cidade || '—'}/${lead.estado || '—'}</strong></span>
                    <span>•</span>
                    <span>Telefone: <strong>${lead.telefone || lead.whatsapp || '—'}</strong></span>
                    <span>•</span>
                    <span>Decisor: <strong>${lead.decisor || '—'}</strong></span>
                    <span>•</span>
                    <span>Potencial: <strong>${lead.potencial || 'B'}</strong></span>
                    ${dados && dados.questionario && dados.questionario.respondido ? `
                        <span class="badge badge-success" style="font-size:11px;padding:3px 8px;margin-left:auto;">
                            ✅ Questionário Respondido
                        </span>
                    ` : `
                        <span class="badge badge-secondary" style="font-size:11px;padding:3px 8px;margin-left:auto;">
                            ⏳ Questionário Pendente
                        </span>
                    `}
                </div>
            ` : ''}
        </div>

        <div id="mergulhoCnpjAlerta"></div>

        ${!lead ? `
            <div class="empty-state">
                <span class="emoji-big">🔍</span>
                <p>Selecione um lead acima ou informe um CNPJ para iniciar o Mergulho Profundo.</p>
            </div>
        ` : `
            <!-- NAVEGAÇÃO INTERNA DO MERGULHO PROFUNDO -->
            <div class="mergulho-tabs-nav">
                <button type="button" class="mergulho-tab-btn active" onclick="mergulhoAlternarAba('abaCnpj', this)">
                    🏢 1. Dados Receita (CNPJ)
                </button>
                <button type="button" class="mergulho-tab-btn" onclick="mergulhoAlternarAba('abaLinks', this)">
                    🌐 2. Presença Digital
                </button>
                <button type="button" class="mergulho-tab-btn" onclick="mergulhoAlternarAba('abaCampo', this)">
                    🏭 3. Pesquisa de Campo
                </button>
                <button type="button" class="mergulho-tab-btn" onclick="mergulhoAlternarAba('abaQuestionario', this)">
                    📋 4. Questionário & Link
                </button>
                <button type="button" class="mergulho-tab-btn" onclick="mergulhoAlternarAba('abaCross', this)">
                    🎯 5. Cross-Selling Micro
                </button>
            </div>

            <!-- CONTEÚDO DAS ABAS -->
            <div id="mergulhoTabConteudo">
                <!-- A renderização do conteúdo inicial da aba 1 -->
                ${mergulhoRenderizarAbaCnpjHTML(lead, dados)}
            </div>
        `}
    `;

    // Aplica ícones
    if (typeof aplicarIcones === 'function') aplicarIcones(container);
}

// Troca de Lead
function mergulhoSelecionarLead(leadId) {
    mergulhoLeadAtualId = leadId;
    mergulhoDadosCNPJCached = null;
    renderizarMergulhoProfundo();
}

// Atalho global para abrir o Mergulho Profundo diretamente no lead e na aba desejada
function mergulhoAbrirParaLead(leadId, aba = 'abaQuestionario') {
    mergulhoLeadAtualId = leadId;
    mergulhoDadosCNPJCached = null;
    if (typeof navegarPara === 'function') {
        navegarPara('mergulho');
    }
    setTimeout(() => {
        const btn = document.querySelector(`.mergulho-tab-btn[onclick*="${aba}"]`);
        mergulhoAlternarAba(aba, btn);
    }, 50);
}

// Troca de sub-abas do Mergulho
function mergulhoAlternarAba(abaNome, botao) {
    document.querySelectorAll('.mergulho-tab-btn').forEach(b => b.classList.remove('active'));
    if (botao) botao.classList.add('active');

    const container = document.getElementById('mergulhoTabConteudo');
    if (!container) return;

    const lead = leads.find(l => l.id === mergulhoLeadAtualId);
    if (!lead) return;
    const dados = mergulhoObterDados(lead);

    if (abaNome === 'abaCnpj') container.innerHTML = mergulhoRenderizarAbaCnpjHTML(lead, dados);
    if (abaNome === 'abaLinks') container.innerHTML = mergulhoRenderizarAbaLinksHTML(lead, dados);
    if (abaNome === 'abaCampo') container.innerHTML = mergulhoRenderizarAbaCampoHTML(lead, dados);
    if (abaNome === 'abaQuestionario') container.innerHTML = mergulhoRenderizarAbaQuestionarioHTML(lead, dados);
    if (abaNome === 'abaCross') container.innerHTML = mergulhoRenderizarAbaCrossHTML(lead, dados);

    if (typeof aplicarIcones === 'function') aplicarIcones(container);
}

// ============================================================
// 1. MÓDULO: DADOS DA RECEITA FEDERAL (CNPJ)
// ============================================================
function mergulhoRenderizarAbaCnpjHTML(lead, dados) {
    const info = mergulhoDadosCNPJCached || dados.cnpjEnriquecido;

    return `
        <div class="mergulho-card">
            <div class="mergulho-card-header">
                <div>
                    <h4>🏢 Identificação Cadastral na Receita Federal</h4>
                    <p class="text-xs text-muted">Dados oficiais retornados em tempo real da base da Receita Federal.</p>
                </div>
                <div>
                    <button type="button" class="btn btn-primary btn-sm" onclick="mergulhoDispararConsultaCNPJ()">
                        🔄 Atualizar Consulta da Receita
                    </button>
                    ${info ? `
                        <button type="button" class="btn btn-success btn-sm" onclick="mergulhoAplicarDadosNoLead()" style="margin-left:6px;">
                            📥 Salvar na Ficha do Lead
                        </button>
                    ` : ''}
                </div>
            </div>

            ${!info ? `
                <div class="mergulho-empty-prompt">
                    <span style="font-size:32px;">🔍</span>
                    <h5>Nenhuma consulta recente da Receita Federal</h5>
                    <p class="text-sm text-muted">Clique em <strong>"Buscar"</strong> acima para consultar CNPJ, Razão Social, CNAEs, Sócios (QSA), Capital Social e Endereço Oficial.</p>
                    <button type="button" class="btn btn-primary btn-sm mt-8" onclick="mergulhoDispararConsultaCNPJ()">
                        Consultar CNPJ Agora
                    </button>
                </div>
            ` : `
                <div class="mergulho-cnpj-grid">
                    <div class="mergulho-info-box">
                        <span class="lbl">Razão Social</span>
                        <span class="val"><strong>${info.razao_social || info.razaoSocial || '—'}</strong></span>
                    </div>
                    <div class="mergulho-info-box">
                        <span class="lbl">Nome Fantasia</span>
                        <span class="val">${info.nome_fantasia || info.nomeFantasia || '—'}</span>
                    </div>
                    <div class="mergulho-info-box">
                        <span class="lbl">CNPJ</span>
                        <span class="val font-mono"><strong>${mergulhoFormatarCnpj(info.cnpj || lead.cnpj)}</strong></span>
                    </div>
                    <div class="mergulho-info-box">
                        <span class="lbl">Situação Cadastral</span>
                        <span class="val">
                            <span class="badge ${String(info.descricao_situacao_cadastral || info.situacao).toUpperCase().includes('ATIVA') ? 'badge-success' : 'badge-danger'}">
                                ${info.descricao_situacao_cadastral || info.situacao || 'ATIVA'}
                            </span>
                        </span>
                    </div>
                    <div class="mergulho-info-box">
                        <span class="lbl">Data de Abertura</span>
                        <span class="val">${info.data_inicio_atividade ? formatarData(info.data_inicio_atividade) : (info.dataAbertura || '—')}</span>
                    </div>
                    <div class="mergulho-info-box">
                        <span class="lbl">Porte da Empresa</span>
                        <span class="val">${info.porte || '—'}</span>
                    </div>
                    <div class="mergulho-info-box">
                        <span class="lbl">Capital Social</span>
                        <span class="val text-success"><strong>${formatarMoeda(info.capital_social || info.capitalSocial || 0)}</strong></span>
                    </div>
                    <div class="mergulho-info-box">
                        <span class="lbl">Natureza Jurídica</span>
                        <span class="val text-xs">${info.natureza_juridica || info.naturezaJuridica || '—'}</span>
                    </div>
                </div>

                <!-- CNAE -->
                <div class="mergulho-subsecao mt-16">
                    <h5>🏭 Atividade Econômica (CNAE)</h5>
                    <div class="mergulho-cnae-box">
                        <div style="font-weight:600;color:var(--primary);">
                            Principal: ${info.cnae_fiscal || (info.cnaePrincipal && info.cnaePrincipal.codigo) || '—'} — ${info.cnae_fiscal_descricao || (info.cnaePrincipal && info.cnaePrincipal.descricao) || '—'}
                        </div>
                        ${(info.cnaes_secundarios || info.cnaesSecundarios || []).length > 0 ? `
                            <div class="text-xs text-muted mt-8"><strong>CNAEs Secundários (${(info.cnaes_secundarios || info.cnaesSecundarios).length}):</strong></div>
                            <div class="mergulho-cnae-tags">
                                ${(info.cnaes_secundarios || info.cnaesSecundarios).slice(0, 10).map(c => `
                                    <span class="cnae-tag" title="${c.descricao || ''}">
                                        ${c.codigo}: ${(c.descricao || '').slice(0, 45)}...
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- ENDEREÇO & CONTATO FISCAL -->
                <div class="mergulho-subsecao mt-16">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <h5>📍 Endereço Fiscal & Contato Oficial</h5>
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${info.logradouro || ''}, ${info.numero || ''}, ${info.municipio || ''} - ${info.uf || ''}`)}" 
                           target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-xs">
                            🗺️ Abrir no Google Maps
                        </a>
                    </div>
                    <div class="mergulho-cnpj-grid mt-8">
                        <div class="mergulho-info-box" style="grid-column: span 2;">
                            <span class="lbl">Logradouro</span>
                            <span class="val">${info.logradouro || ''}, ${info.numero || ''} ${info.complemento ? `— ${info.complemento}` : ''}</span>
                        </div>
                        <div class="mergulho-info-box">
                            <span class="lbl">Bairro / CEP</span>
                            <span class="val">${info.bairro || '—'} • CEP: ${info.cep || '—'}</span>
                        </div>
                        <div class="mergulho-info-box">
                            <span class="lbl">Cidade / Estado</span>
                            <span class="val"><strong>${info.municipio || info.cidade || '—'} / ${info.uf || info.estado || '—'}</strong></span>
                        </div>
                        <div class="mergulho-info-box">
                            <span class="lbl">Telefone Receita</span>
                            <span class="val">${info.ddd_telefone_1 || info.telefones || '—'}</span>
                        </div>
                        <div class="mergulho-info-box">
                            <span class="lbl">E-mail Fiscal</span>
                            <span class="val">${info.email || info.emailFiscal || '—'}</span>
                        </div>
                    </div>
                </div>

                <!-- QUADRO DE SÓCIOS (QSA) -->
                <div class="mergulho-subsecao mt-16">
                    <h5>👥 Quadro de Sócios e Administradores (QSA)</h5>
                    ${(info.qsa && info.qsa.length > 0) ? `
                        <div class="table-wrapper mt-8">
                            <table class="table" style="font-size:12px;">
                                <thead>
                                    <tr>
                                        <th>Nome do Sócio / Diretor</th>
                                        <th>Qualificação</th>
                                        <th>Faixa Etária</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${info.qsa.map(s => `
                                        <tr>
                                            <td><strong>${s.nome_socio || s.nome}</strong></td>
                                            <td>${s.qualificacao_socio || s.qual || 'Sócio / Administrador'}</td>
                                            <td>${s.faixa_etaria || '—'}</td>
                                            <td>
                                                <a href="https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${s.nome_socio || s.nome} ${info.razao_social || lead.empresa}`)}" 
                                                   target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-xs">
                                                    Buscar LinkedIn
                                                </a>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <p class="text-xs text-muted">Nenhum sócio ou administrador listado publicamente para este porte/natureza.</p>
                    `}
                </div>
            `}
        </div>
    `;
}

// Executa a busca na BrasilAPI
async function mergulhoDispararConsultaCNPJ() {
    const input = document.getElementById('mergulhoInputCnpj');
    const cnpjBruto = (input?.value || '').replace(/\D/g, '');
    const alerta = document.getElementById('mergulhoCnpjAlerta');

    if (cnpjBruto.length !== 14) {
        if (typeof showToast === 'function') showToast('Informe um CNPJ válido com 14 dígitos.', 'warning');
        return;
    }

    const btn = document.getElementById('btnMergulhoBuscarCnpj');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Consultando...';
    }

    if (alerta) {
        alerta.innerHTML = `<div class="alert alert-info" style="padding:8px 12px;font-size:12px;margin-bottom:12px;">Consultando dados oficiais da Receita Federal para o CNPJ ${mergulhoFormatarCnpj(cnpjBruto)}...</div>`;
    }

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjBruto}`);
        if (!response.ok) {
            throw new Error('CNPJ não localizado na base pública.');
        }
        const data = await response.json();
        mergulhoDadosCNPJCached = data;

        // Vincula ao lead atual
        const lead = leads.find(l => l.id === mergulhoLeadAtualId);
        if (lead) {
            const dados = mergulhoObterDados(lead);
            dados.cnpjEnriquecido = data;
            lead.cnpj = mergulhoFormatarCnpj(cnpjBruto);
            mergulhoSalvarLocal(lead.id, dados);
            salvarDadosDebounced(300);
        }

        if (alerta) {
            alerta.innerHTML = `<div class="alert alert-success" style="padding:8px 12px;font-size:12px;margin-bottom:12px;">✅ Dados da Receita Federal carregados com sucesso para <strong>${data.razao_social || data.nome_fantasia}</strong>!</div>`;
            setTimeout(() => { if (alerta) alerta.innerHTML = ''; }, 4000);
        }

        renderizarMergulhoProfundo();
        if (typeof showToast === 'function') showToast('Dados da Receita Federal obtidos com sucesso!', 'success');
    } catch (err) {
        console.error('Erro na consulta do CNPJ:', err);
        if (alerta) {
            alerta.innerHTML = `<div class="alert alert-danger" style="padding:8px 12px;font-size:12px;margin-bottom:12px;">Não foi possível consultar este CNPJ na Receita Federal. Verifique o número digitado ou preencha manualmente.</div>`;
        }
        if (typeof showToast === 'function') showToast('CNPJ não localizado na base pública.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '🔍 Buscar';
        }
    }
}

// Aplica os dados da Receita no cadastro principal do lead
function mergulhoAplicarDadosNoLead() {
    const lead = leads.find(l => l.id === mergulhoLeadAtualId);
    const info = mergulhoDadosCNPJCached || (lead && lead.mergulho && lead.mergulho.cnpjEnriquecido);
    if (!lead || !info) return;

    if (info.razao_social && !lead.empresa) lead.empresa = info.razao_social;
    if (info.municipio) lead.cidade = info.municipio;
    if (info.uf) lead.estado = info.uf;
    if (info.ddd_telefone_1 && !lead.telefone) lead.telefone = info.ddd_telefone_1;
    if (info.email && !lead.email) lead.email = info.email;
    if (info.qsa && info.qsa.length > 0 && !lead.decisor) lead.decisor = info.qsa[0].nome_socio;

    salvarDadosDebounced(200);
    renderizarMergulhoProfundo();
    if (typeof showToast === 'function') showToast('Ficha do lead atualizada com os dados oficiais!', 'success');
}

// ============================================================
// 2. MÓDULO: PRESENÇA DIGITAL & LINKS DE INVESTIGAÇÃO
// ============================================================
function mergulhoRenderizarAbaLinksHTML(lead, dados) {
    const p = dados.presencaDigital || {};
    const mapsAuto = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.empresa} ${lead.cidade || ''} ${lead.estado || ''}`)}`;

    return `
        <div class="mergulho-card">
            <div class="mergulho-card-header">
                <div>
                    <h4>🌐 Presença Digital & Links de Investigação</h4>
                    <p class="text-xs text-muted">Links para investigar site, equipe, catálogo e fachada da fábrica.</p>
                </div>
                <button type="button" class="btn btn-primary btn-sm" onclick="mergulhoSalvarLinks()">
                    💾 Salvar Links
                </button>
            </div>

            <div class="mergulho-links-grid">
                <div class="form-group">
                    <label>Website Oficial:</label>
                    <div class="input-com-botao">
                        <input type="url" id="mergulhoSite" class="form-control" placeholder="https://empresa.com.br" value="${p.website || ''}">
                        <button type="button" class="btn btn-outline btn-sm" onclick="mergulhoAbrirUrl('mergulhoSite')" title="Abrir em nova aba">
                            🔗 Abrir
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label>LinkedIn da Empresa:</label>
                    <div class="input-com-botao">
                        <input type="url" id="mergulhoLinkedinEmpresa" class="form-control" placeholder="https://linkedin.com/company/..." value="${p.linkedinEmpresa || ''}">
                        <button type="button" class="btn btn-outline btn-sm" onclick="mergulhoAbrirUrl('mergulhoLinkedinEmpresa')" title="Abrir em nova aba">
                            💼 Abrir
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label>LinkedIn dos Decisores / Engenharia:</label>
                    <div class="input-com-botao">
                        <input type="url" id="mergulhoLinkedinDecisores" class="form-control" placeholder="Link do perfil do decisor ou busca de pessoas" value="${p.linkedinDecisores || ''}">
                        <button type="button" class="btn btn-outline btn-sm" onclick="mergulhoBuscarLinkedinPessoas('${lead.empresa}')" title="Fazer busca no LinkedIn por funcionários da empresa">
                            👤 Buscar
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Catálogo de Produtos / Portfólio do Lead:</label>
                    <div class="input-com-botao">
                        <input type="url" id="mergulhoCatalogo" class="form-control" placeholder="Link do catálogo em PDF ou página de máquinas" value="${p.catalogoUrl || ''}">
                        <button type="button" class="btn btn-outline btn-sm" onclick="mergulhoAbrirUrl('mergulhoCatalogo')" title="Abrir catálogo">
                            📑 Abrir
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Instagram / Redes Sociais:</label>
                    <div class="input-com-botao">
                        <input type="url" id="mergulhoInstagram" class="form-control" placeholder="https://instagram.com/..." value="${p.instagram || ''}">
                        <button type="button" class="btn btn-outline btn-sm" onclick="mergulhoAbrirUrl('mergulhoInstagram')" title="Abrir rede social">
                            📷 Abrir
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Google Maps / Fachada do Galpão:</label>
                    <div class="input-com-botao">
                        <input type="url" id="mergulhoMaps" class="form-control" placeholder="Link do Street View ou Google Maps" value="${p.mapsUrl || mapsAuto}">
                        <button type="button" class="btn btn-outline btn-sm" onclick="mergulhoAbrirUrl('mergulhoMaps')" title="Ver localização e fachada">
                            🗺️ Ver Fachada
                        </button>
                    </div>
                </div>
            </div>

            <div class="form-group mt-12">
                <label>Anotações sobre a Presença Digital & Linha de Fabricação:</label>
                <textarea id="mergulhoNotasPresenca" class="form-control" rows="3" 
                    placeholder="Ex.: Fabricam 3 modelos de dosadoras industriais e 2 embaladoras. O site destaca exportação para o Mercosul.">${p.notas || ''}</textarea>
            </div>
        </div>
    `;
}

function mergulhoAbrirUrl(inputId) {
    let url = document.getElementById(inputId)?.value.trim();
    if (!url) {
        if (typeof showToast === 'function') showToast('Informe uma URL antes de abrir.', 'warning');
        return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    window.open(url, '_blank');
}

function mergulhoBuscarLinkedinPessoas(empresa) {
    const url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(empresa + ' compras engenharia manutencao')}`;
    window.open(url, '_blank');
}

function mergulhoSalvarLinks() {
    const lead = leads.find(l => l.id === mergulhoLeadAtualId);
    if (!lead) return;
    const dados = mergulhoObterDados(lead);

    dados.presencaDigital = {
        website: document.getElementById('mergulhoSite')?.value.trim() || '',
        linkedinEmpresa: document.getElementById('mergulhoLinkedinEmpresa')?.value.trim() || '',
        linkedinDecisores: document.getElementById('mergulhoLinkedinDecisores')?.value.trim() || '',
        instagram: document.getElementById('mergulhoInstagram')?.value.trim() || '',
        catalogoUrl: document.getElementById('mergulhoCatalogo')?.value.trim() || '',
        mapsUrl: document.getElementById('mergulhoMaps')?.value.trim() || '',
        notas: document.getElementById('mergulhoNotasPresenca')?.value.trim() || ''
    };

    mergulhoSalvarLocal(lead.id, dados);
    salvarDadosDebounced(300);
    if (typeof showToast === 'function') showToast('Links e presença digital salvos!', 'success');
}

// ============================================================
// 3. MÓDULO: PESQUISA DE CAMPO & CHÃO DE FÁBRICA
// ============================================================
function mergulhoRenderizarAbaCampoHTML(lead, dados) {
    const c = dados.campo || {};
    const marcasDisponiveis = [
        { id: 'festo', label: 'Festo' },
        { id: 'smc', label: 'SMC' },
        { id: 'micro', label: 'Micro Automação' },
        { id: 'parker', label: 'Parker' },
        { id: 'camozzi', label: 'Camozzi' },
        { id: 'norgren', label: 'Norgren' },
        { id: 'airtac', label: 'Airtac' },
        { id: 'metalwork', label: 'Metal Work' },
        { id: 'outras', label: 'Outras' }
    ];

    const marcasAtuais = c.marcasPresentes || [];

    return `
        <div class="mergulho-card">
            <div class="mergulho-card-header">
                <div>
                    <h4>🏭 Pesquisa de Campo & Chão de Fábrica</h4>
                    <p class="text-xs text-muted">Mapeamento técnico de equipamentos, porte do parque fabril e concorrentes presentes.</p>
                </div>
                <button type="button" class="btn btn-primary btn-sm" onclick="mergulhoSalvarCampo()">
                    💾 Salvar Dados de Campo
                </button>
            </div>

            <div class="mergulho-grid-3col">
                <div class="form-group">
                    <label>Perfil da Operação:</label>
                    <select id="campoTipoOperacao" class="form-control">
                        <option value="oem" ${c.tipoOperacao === 'oem' ? 'selected' : ''}>Fabricante de Máquinas (OEM)</option>
                        <option value="mro" ${c.tipoOperacao === 'mro' ? 'selected' : ''}>Indústria Final / Manutenção (MRO)</option>
                        <option value="integrador" ${c.tipoOperacao === 'integrador' ? 'selected' : ''}>Integrador de Sistemas / Painéis</option>
                        <option value="revenda" ${c.tipoOperacao === 'revenda' ? 'selected' : ''}>Revenda / Distribuidor</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Nível de Automação:</label>
                    <select id="campoNivelAutomacao" class="form-control">
                        <option value="manual" ${c.nivelAutomacao === 'manual' ? 'selected' : ''}>Manual / Mecânica Tradicional</option>
                        <option value="semi" ${c.nivelAutomacao === 'semi' ? 'selected' : ''}>Semi-automatizada (Pneumática pontual)</option>
                        <option value="total" ${c.nivelAutomacao === 'total' ? 'selected' : ''}>Totalmente Automatizada (Indústria 4.0 / Linhas contínuas)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Porte do Parque Fabril:</label>
                    <select id="campoPorteFabril" class="form-control">
                        <option value="pequeno" ${c.porteFabril === 'pequeno' ? 'selected' : ''}>Pequeno (1 a 5 máquinas ativas)</option>
                        <option value="medio" ${c.porteFabril === 'medio' ? 'selected' : ''}>Médio (6 a 25 máquinas ativas)</option>
                        <option value="grande" ${c.porteFabril === 'grande' ? 'selected' : ''}>Grande (Mais de 25 máquinas / Alta demanda)</option>
                    </select>
                </div>
            </div>

            <div class="form-group mt-12">
                <label>Marcas Concorrentes Presentes no Chão de Fábrica:</label>
                <div class="mergulho-chips-grid" id="campoMarcasContainer">
                    ${marcasDisponiveis.map(m => {
                        const checked = marcasAtuais.includes(m.id);
                        return `
                            <label class="mergulho-chip ${checked ? 'active' : ''}">
                                <input type="checkbox" name="campoMarca" value="${m.id}" ${checked ? 'checked' : ''} onchange="this.parentElement.classList.toggle('active', this.checked)">
                                <span>${m.label}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="form-group mt-12">
                <label>Equipamentos, Maquinários & Linhas Produtivas Observadas:</label>
                <textarea id="campoMaquinas" class="form-control" rows="3" 
                    placeholder="Ex.: 4 injetoras de plástico, 2 linhas de envase automático com cilindros guiados e 1 esteira de embalagem com esteira pneumática.">${c.maquinasEquipamentos || ''}</textarea>
            </div>

            <!-- DIÁRIO DE VISITAS TÉCNICAS -->
            <div class="mergulho-subsecao mt-16">
                <h5>📝 Diário de Visitas Técnicas & Contato em Campo</h5>
                <div style="background:var(--bg-secondary);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border-color);margin-bottom:12px;">
                    <div style="display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap;">
                        <input type="date" id="novaVisitaData" class="form-control" style="width:140px;" value="${hoje()}">
                        <input type="text" id="novaVisitaAutor" class="form-control" style="width:160px;" placeholder="Responsável" value="${usuarioAtual?.nome || ''}">
                        <input type="text" id="novaVisitaNota" class="form-control" style="flex:1;min-width:220px;" placeholder="O que foi observado na visita? Ex.: Conversamos com Eng. Roberto na linha 2...">
                        <button type="button" class="btn btn-success btn-sm" onclick="mergulhoAdicionarVisita()">
                            + Registrar Visita
                        </button>
                    </div>
                </div>

                <div id="campoListaVisitas">
                    ${(c.diarioVisitas && c.diarioVisitas.length > 0) ? `
                        <div class="table-wrapper">
                            <table class="table" style="font-size:12px;">
                                <thead>
                                    <tr>
                                        <th style="width:100px;">Data</th>
                                        <th style="width:140px;">Responsável</th>
                                        <th>Relato Técnico de Campo</th>
                                        <th style="width:60px;">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${c.diarioVisitas.map((v, idx) => `
                                        <tr>
                                            <td><strong>${formatarData(v.data)}</strong></td>
                                            <td>${v.autor || '—'}</td>
                                            <td>${v.nota || '—'}</td>
                                            <td>
                                                <button type="button" class="btn btn-outline btn-xs text-danger" onclick="mergulhoExcluirVisita(${idx})">
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <p class="text-xs text-muted">Nenhuma visita técnica registrada ainda.</p>
                    `}
                </div>
            </div>
        </div>
    `;
}

function mergulhoSalvarCampo() {
    const lead = leads.find(l => l.id === mergulhoLeadAtualId);
    if (!lead) return;
    const dados = mergulhoObterDados(lead);

    const marcasSelecionadas = Array.from(document.querySelectorAll('input[name="campoMarca"]:checked')).map(el => el.value);

    dados.campo.tipoOperacao = document.getElementById('campoTipoOperacao')?.value || 'oem';
    dados.campo.nivelAutomacao = document.getElementById('campoNivelAutomacao')?.value || 'semi';
    dados.campo.porteFabril = document.getElementById('campoPorteFabril')?.value || 'medio';
    dados.campo.marcasPresentes = marcasSelecionadas;
    dados.campo.maquinasEquipamentos = document.getElementById('campoMaquinas')?.value.trim() || '';

    mergulhoSalvarLocal(lead.id, dados);
    salvarDadosDebounced(300);
    if (typeof showToast === 'function') showToast('Dados de pesquisa de campo salvos!', 'success');
}

function mergulhoAdicionarVisita() {
    const lead = leads.find(l => l.id === mergulhoLeadAtualId);
    if (!lead) return;
    const dados = mergulhoObterDados(lead);

    const data = document.getElementById('novaVisitaData')?.value || hoje();
    const autor = document.getElementById('novaVisitaAutor')?.value.trim() || usuarioAtual?.nome || 'Vendedor';
    const nota = document.getElementById('novaVisitaNota')?.value.trim();

    if (!nota) {
        if (typeof showToast === 'function') showToast('Descreva o que foi observado na visita.', 'warning');
        return;
    }

    if (!dados.campo.diarioVisitas) dados.campo.diarioVisitas = [];
    dados.campo.diarioVisitas.unshift({
        id: gerarId(),
        data,
        autor,
        nota
    });

    mergulhoSalvarLocal(lead.id, dados);
    salvarDadosDebounced(300);

    const inputNota = document.getElementById('novaVisitaNota');
    if (inputNota) inputNota.value = '';

    mergulhoAlternarAba('abaCampo');
    if (typeof showToast === 'function') showToast('Visita técnica registrada com sucesso!', 'success');
}

function mergulhoExcluirVisita(idx) {
    const lead = leads.find(l => l.id === mergulhoLeadAtualId);
    if (!lead) return;
    const dados = mergulhoObterDados(lead);
    if (!dados.campo.diarioVisitas) return;

    dados.campo.diarioVisitas.splice(idx, 1);
    mergulhoSalvarLocal(lead.id, dados);
    salvarDadosDebounced(300);
    mergulhoAlternarAba('abaCampo');
}

// ============================================================
// 4. MÓDULO: QUESTIONÁRIO DE SONDAGEM & LINK PÚBLICO
// ============================================================
// GERAÇÃO DE LINK PÚBLICO E ISOLADO DO DIAGNÓSTICO
// O link direciona para diagnostico.html (totalmente protegido,
// sem scripts administrativos, sem navegação e sem acesso ao CRM).
// ============================================================
function mergulhoGerarLinkPublico(lead) {
    if (!lead) return '';
    const origin = window.location.origin || '';
    const leadId = encodeURIComponent(lead.id || '');
    const empresaNome = encodeURIComponent(lead.empresa || '');
    return `${origin}/diagnostico.html?id=${leadId}&empresa=${empresaNome}`;
}

// Sincroniza diagnósticos enviados remotamente pelos leads pelo link externo
async function mergulhoSincronizarDiagnosticosRecebidos() {
    try {
        const res = await fetch('/api/diagnosticos');
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.diagnosticos) return;

        const idsSincronizados = [];
        let houveMudancas = false;
        const todosLocais = mergulhoCarregarTodos();

        Object.values(data.diagnosticos).forEach(diag => {
            if (!diag || !diag.leadId || !diag.respondido) return;
            const lead = (typeof leads !== 'undefined' ? leads : []).find(l => l.id === diag.leadId);
            const dadosLocais = todosLocais[diag.leadId] || (lead ? mergulhoObterDados(lead) : null);

            if (dadosLocais) {
                const jaRespondido = dadosLocais.questionario && dadosLocais.questionario.respondido;
                const respEmLocal = dadosLocais.questionario ? dadosLocais.questionario.respondidoEm : null;
                const respEmRemoto = diag.respondidoEm;

                if (!jaRespondido || respEmRemoto !== respEmLocal) {
                    dadosLocais.questionario = {
                        respondido: true,
                        respondidoEm: diag.respondidoEm || new Date().toISOString(),
                        respondidoPor: 'cliente',
                        contatoNome: diag.contatoNome || '',
                        contatoTel: diag.contatoTel || '',
                        contatoEmail: diag.contatoEmail || '',
                        ...(diag.respostas || {})
                    };
                    todosLocais[diag.leadId] = dadosLocais;
                    houveMudancas = true;

                    if (lead) {
                        lead.mergulho = dadosLocais;
                        if (!lead.historico) lead.historico = [];
                        const jaTemHistorico = lead.historico.some(h => (h.tipo === 'Diagnóstico' && h.descricao && h.descricao.includes('link exclusivo')));
                        if (!jaTemHistorico) {
                            lead.historico.unshift({
                                data: (diag.respondidoEm || new Date().toISOString()).split('T')[0],
                                hora: new Date().toTimeString().slice(0, 5),
                                tipo: 'Diagnóstico',
                                descricao: `Diagnóstico Técnico preenchido pelo cliente via link exclusivo (${diag.contatoNome || 'Contato da Empresa'}).`
                            });
                        }
                    }
                }
            }

            if (!diag.sincronizadoNoCrm) {
                idsSincronizados.push(diag.leadId);
            }
        });

        if (houveMudancas) {
            localStorage.setItem('ploomesMergulhoV1', JSON.stringify(todosLocais));
            if (typeof salvarDados === 'function') salvarDados();
            if (mergulhoLeadAtualId && typeof renderizarMergulhoProfundo === 'function') {
                renderizarMergulhoProfundo();
            }
        }

        if (idsSincronizados.length > 0) {
            fetch('/api/diagnosticos/sync-ack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadIds: idsSincronizados })
            }).catch(() => {});
        }
    } catch (e) {
        // silencioso
    }
}

function mergulhoRenderizarAbaQuestionarioHTML(lead, dados) {
    const q = dados.questionario || {};
    const linkPublico = mergulhoGerarLinkPublico(lead);

    return `
        <div class="mergulho-card">
            <div class="mergulho-card-header">
                <div>
                    <h4>📋 Questionário de Diagnóstico Técnico & Sondagem</h4>
                    <p class="text-xs text-muted">
                        Envie o link exclusivo protegido para o cliente responder em 1 minuto, ou preencha as respostas colhidas na ligação/visita.
                    </p>
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
                    <button type="button" class="btn btn-primary btn-sm" onclick="mergulhoAbrirRelatorioRespondentesModal()" title="Visualizar relatório visual e impressão em PDF de todos que já responderam o questionário">
                        📊 Relatório de Respostas (PDF)
                    </button>
                    ${q.respondido ? `
                        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">
                            <span class="badge badge-success" style="font-size:12px;padding:5px 10px;">
                                ✅ Respondido ${q.respondidoEm ? 'em ' + (typeof formatarDataHora === 'function' ? formatarDataHora(q.respondidoEm) : q.respondidoEm) : ''} (${q.respondidoPor === 'cliente' ? 'Pelo Próprio Lead' : 'Pela Equipe'})
                            </span>
                            ${q.contatoNome ? `<span class="text-xs text-muted">Preenchido por: <strong>${typeof whatsappEscapar === 'function' ? whatsappEscapar(q.contatoNome) : q.contatoNome}</strong> ${q.contatoTel ? '· ' + (typeof whatsappEscapar === 'function' ? whatsappEscapar(q.contatoTel) : q.contatoTel) : ''}</span>` : ''}
                        </div>
                        <button type="button" class="btn btn-outline btn-sm" onclick="mergulhoExibirRelatorioModal('${lead.id}')" title="Visualizar ficha formatada deste lead">
                            📄 Ficha Deste Lead (PDF)
                        </button>
                    ` : `
                        <span class="badge badge-secondary" style="font-size:12px;padding:5px 10px;">
                            ⏳ Pendente de Preenchimento
                        </span>
                    `}
                    <button type="button" class="btn btn-success btn-sm" onclick="mergulhoSalvarQuestionarioInterno()">
                        💾 Salvar Respostas
                    </button>
                </div>
            </div>

            <!-- CARD DE DISPARO DO LINK PROTEGIDO -->
            <div class="mergulho-link-share-box">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                    <div>
                        <strong style="font-size:13px;color:var(--primary);">🔒 Link Exclusivo & Protegido para o Cliente:</strong>
                        <div class="text-xs text-muted">O lead acessa uma página isolada, sem login e sem qualquer acesso ao CRM ou outros dados. Responde, envia e vincula direto à ficha.</div>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <button type="button" class="btn btn-outline btn-xs" onclick="mergulhoCopiarLink('${linkPublico}')" title="Copiar link para área de transferência">
                            📋 Copiar Link
                        </button>
                        <button type="button" class="btn btn-success btn-xs" onclick="mergulhoDispararWhatsAppQuestionario('${lead.id}')" title="Disparar convite amigável no WhatsApp do contato">
                            📲 Enviar WhatsApp com 1 Clique
                        </button>
                        <button type="button" class="btn btn-outline btn-xs" onclick="window.open('${linkPublico}', '_blank')" title="Abrir página do cliente em nova aba para testar">
                            👁️ Testar Página do Lead
                        </button>
                    </div>
                </div>
                <input type="text" class="form-control" value="${linkPublico}" readonly style="font-family:monospace;font-size:12px;background:var(--bg-card);" onclick="this.select()">
            </div>

            <!-- DADOS DO RESPONDENTE (NOME, TELEFONE, E-MAIL, DATA/HORA) -->
            <div style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:14px;margin-bottom:14px;">
                <div style="font-weight:700;font-size:12.5px;margin-bottom:8px;color:var(--text-primary);display:flex;align-items:center;gap:6px;">
                    <span>👤 Dados de Quem Respondeu (Exibidos no Relatório e Impressão PDF):</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));gap:10px;">
                    <div class="form-group" style="margin:0;">
                        <label style="font-size:11px;font-weight:600;">Nome de Quem Respondeu:</label>
                        <input type="text" id="questContatoNome" class="form-control" placeholder="Ex.: Carlos Silva - Manutenção" value="${typeof whatsappEscapar === 'function' ? whatsappEscapar(q.contatoNome || lead.decisor || '') : (q.contatoNome || lead.decisor || '')}">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label style="font-size:11px;font-weight:600;">Telefone / WhatsApp:</label>
                        <input type="text" id="questContatoTel" class="form-control" placeholder="Ex.: (11) 98765-4321" value="${typeof whatsappEscapar === 'function' ? whatsappEscapar(q.contatoTel || lead.whatsapp || lead.telefone || '') : (q.contatoTel || lead.whatsapp || lead.telefone || '')}">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label style="font-size:11px;font-weight:600;">E-mail Corporativo (Opcional):</label>
                        <input type="email" id="questContatoEmail" class="form-control" placeholder="Ex.: contato@empresa.com.br" value="${typeof whatsappEscapar === 'function' ? whatsappEscapar(q.contatoEmail || lead.email || '') : (q.contatoEmail || lead.email || '')}">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label style="font-size:11px;font-weight:600;">Data e Hora da Resposta:</label>
                        <input type="datetime-local" id="questDataHora" class="form-control" value="${q.respondidoEm ? (q.respondidoEm.includes('T') ? q.respondidoEm.slice(0, 16) : '') : ''}">
                    </div>
                </div>
            </div>

            <!-- FORMULÁRIO DE PERGUNTAS (PREENCHÍVEL TAMBÉM INTERNAMENTE) -->
            <div class="mergulho-perguntas-grid mt-16">
                <!-- Q1 -->
                <div class="mergulho-pergunta-box">
                    <label class="mergulho-pergunta-titulo">1. Foco Principal da Operação do Cliente:</label>
                    <select id="questFoco" class="form-control">
                        <option value="">Selecione...</option>
                        <option value="oem" ${q.focoOperacao === 'oem' ? 'selected' : ''}>Fabricante de Máquinas e Equipamentos (OEM)</option>
                        <option value="mro" ${q.focoOperacao === 'mro' ? 'selected' : ''}>Indústria em Produção Ativa (Manutenção / Reposição)</option>
                        <option value="integrador" ${q.focoOperacao === 'integrador' ? 'selected' : ''}>Revenda / Distribuidor / Integrador de Painéis</option>
                    </select>
                </div>

                <!-- Q2 -->
                <div class="mergulho-pergunta-box">
                    <label class="mergulho-pergunta-titulo">2. Frequência de Compra de Itens Pneumáticos:</label>
                    <select id="questFrequencia" class="form-control">
                        <option value="">Selecione...</option>
                        <option value="semanal" ${q.frequenciaCompra === 'semanal' ? 'selected' : ''}>Semanal / Contínua (Alto volume de giro)</option>
                        <option value="mensal" ${q.frequenciaCompra === 'mensal' ? 'selected' : ''}>Mensal sob demanda de pedidos</option>
                        <option value="esporadica" ${q.frequenciaCompra === 'esporadica' ? 'selected' : ''}>Esporádica (Apenas em reformas ou manutenções)</option>
                    </select>
                </div>

                <!-- Q3 -->
                <div class="mergulho-pergunta-box" style="grid-column: span 2;">
                    <label class="mergulho-pergunta-titulo">3. Linhas de Produtos com Maior Demanda ou Criticidade:</label>
                    <div class="mergulho-chips-grid">
                        ${[
                            { id: 'cilindros_iso', label: 'Cilindros ISO (15552 / 6431 / 6432)' },
                            { id: 'cilindros_compactos', label: 'Cilindros Compactos / Guiados' },
                            { id: 'valvulas_solenoide', label: 'Válvulas Direcionais & Solenoides' },
                            { id: 'ilhas_valvulas', label: 'Ilhas de Válvulas / Manifolds' },
                            { id: 'preparacao_ar', label: 'Preparação de Ar (Filtros, FRL, Coalescentes)' },
                            { id: 'conexoes_tubos', label: 'Conexões Rápidas & Tubos PU/Nylon' },
                            { id: 'garras_vacuo', label: 'Garras Pneumáticas & Manipulação / Vácuo' },
                            { id: 'linha_inox', label: 'Linha Inox / Sanitária para Alimentos/Química' }
                        ].map(item => {
                            const checked = (q.linhasConsumo || []).includes(item.id);
                            return `
                                <label class="mergulho-chip ${checked ? 'active' : ''}">
                                    <input type="checkbox" name="questLinha" value="${item.id}" ${checked ? 'checked' : ''} onchange="this.parentElement.classList.toggle('active', this.checked)">
                                    <span>${item.label}</span>
                                </label>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Q4 -->
                <div class="mergulho-pergunta-box">
                    <label class="mergulho-pergunta-titulo">4. Necessidade de Cilindros com Medidas Especiais sob Encomenda?</label>
                    <select id="questEspeciais" class="form-control">
                        <option value="">Selecione...</option>
                        <option value="sim" ${q.cilindrosEspeciais === 'sim' ? 'selected' : ''}>Sim, precisamos com frequência de cursos ou hastes especiais</option>
                        <option value="nao" ${q.cilindrosEspeciais === 'nao' ? 'selected' : ''}>Não, apenas padrões convencionais de catálogo</option>
                    </select>
                </div>

                <!-- Q5 -->
                <div class="mergulho-pergunta-box">
                    <label class="mergulho-pergunta-titulo">5. Principal Gargalo com Fornecedores Atuais de Pneumática:</label>
                    <select id="questDesafio" class="form-control">
                        <option value="">Selecione...</option>
                        <option value="prazo" ${q.desafioFornecedor === 'prazo' ? 'selected' : ''}>Prazo de entrega longo (atrasando máquinas/manutenções)</option>
                        <option value="preco" ${q.desafioFornecedor === 'preco' ? 'selected' : ''}>Preços elevados ou reajustes abusivos</option>
                        <option value="suporte" ${q.desafioFornecedor === 'suporte' ? 'selected' : ''}>Falta de suporte técnico para especificação</option>
                        <option value="estoque" ${q.desafioFornecedor === 'estoque' ? 'selected' : ''}>Falta de estoque local para reposição imediata</option>
                    </select>
                </div>

                <!-- Q6 -->
                <div class="mergulho-pergunta-box">
                    <label class="mergulho-pergunta-titulo">6. Interesse em Amostra Técnica ou Cotação Comparativa?</label>
                    <select id="questAmostra" class="form-control">
                        <option value="">Selecione...</option>
                        <option value="sim_amostra" ${q.desejoAmostra === 'sim_amostra' ? 'selected' : ''}>Sim! Queremos testar uma amostra equivalente na máquina</option>
                        <option value="sim_cotacao" ${q.desejoAmostra === 'sim_cotacao' ? 'selected' : ''}>Sim! Queremos cotação comparativa de itens mais consumidos</option>
                        <option value="nao" ${q.desejoAmostra === 'nao' ? 'selected' : ''}>No momento não, manter apenas contato</option>
                    </select>
                </div>

                <!-- Q7 -->
                <div class="mergulho-pergunta-box">
                    <label class="mergulho-pergunta-titulo">7. Código do Item Concorrente ou Detalhes para Amostra/Cotação:</label>
                    <input type="text" id="questDetalhesItem" class="form-control" placeholder="Ex.: Cilindro Festo DNC-40-150-PPV ou Válvula SMC SY5120" value="${q.detalhesItemAmostra || ''}">
                </div>
            </div>

            <div class="form-group mt-12">
                <label>Observações Adicionais do Diagnóstico:</label>
                <textarea id="questObservacoes" class="form-control" rows="2" placeholder="Qualquer particularidade de temperatura, pressão, ciclos por minuto ou exigência técnica...">${q.observacoesGerais || ''}</textarea>
            </div>
        </div>
    `;
}

function mergulhoCopiarLink(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            if (typeof showToast === 'function') showToast('Link do questionário copiado para a área de transferência!', 'success');
        });
    } else {
        copiarTexto(url, 'Link do questionário copiado!');
    }
}

function mergulhoDispararWhatsAppQuestionario(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const telefone = (lead.whatsapp || lead.telefone || '').replace(/\D/g, '');
    const nomeDecisor = lead.decisor ? lead.decisor.split(' ')[0] : 'amigo(a)';
    const linkPublico = mergulhoGerarLinkPublico(lead);

    const mensagem = `Olá, ${nomeDecisor}! Tudo bem?\n\nAqui é da equipe técnica da Micro Automação.\n\nPreparamos um rápido diagnóstico técnico (leva menos de 1 minuto) para entender a demanda da *${lead.empresa}* em automação pneumática e identificar oportunidades de *redução de custo e envio de amostras para teste* sem compromisso.\n\nVocê pode responder diretamente por este link seguro:\n👉 ${linkPublico}\n\nFicamos à disposição!`;

    const url = `https://wa.me/${CONFIG.WHATSAPP_COUNTRY_CODE}${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    if (typeof showToast === 'function') showToast('WhatsApp aberto com a mensagem do questionário.');
}

function mergulhoSalvarQuestionarioInterno() {
    const lead = leads.find(l => l.id === mergulhoLeadAtualId);
    if (!lead) return;
    const dados = mergulhoObterDados(lead);

    const linhas = Array.from(document.querySelectorAll('input[name="questLinha"]:checked')).map(el => el.value);

    const contatoNome = document.getElementById('questContatoNome')?.value.trim() || lead.decisor || '';
    const contatoTel = document.getElementById('questContatoTel')?.value.trim() || lead.whatsapp || lead.telefone || '';
    const contatoEmail = document.getElementById('questContatoEmail')?.value.trim() || lead.email || '';
    const dtInput = document.getElementById('questDataHora')?.value;
    let dataResp = dados.questionario?.respondidoEm || new Date().toISOString();
    if (dtInput) {
        try {
            dataResp = new Date(dtInput).toISOString();
        } catch (e) {
            dataResp = dtInput;
        }
    }

    dados.questionario = {
        respondido: true,
        respondidoEm: dataResp,
        respondidoPor: dados.questionario?.respondidoPor || 'vendedor',
        contatoNome: contatoNome,
        contatoTel: contatoTel,
        contatoEmail: contatoEmail,
        focoOperacao: document.getElementById('questFoco')?.value || '',
        frequenciaCompra: document.getElementById('questFrequencia')?.value || '',
        linhasConsumo: linhas,
        cilindrosEspeciais: document.getElementById('questEspeciais')?.value || '',
        fornecedoresAtuais: '',
        desafioFornecedor: document.getElementById('questDesafio')?.value || '',
        desejoAmostra: document.getElementById('questAmostra')?.value || '',
        detalhesItemAmostra: document.getElementById('questDetalhesItem')?.value.trim() || '',
        observacoesGerais: document.getElementById('questObservacoes')?.value.trim() || ''
    };

    mergulhoSalvarLocal(lead.id, dados);
    salvarDadosDebounced(300);
    renderizarMergulhoProfundo();
    if (typeof showToast === 'function') showToast('Respostas do questionário salvas com sucesso!', 'success');
}

// ============================================================
// 5. MÓDULO: CROSS-SELLING DE PRODUTOS MICRO (MATRIZ DE ATAQUE)
// ============================================================
function mergulhoRenderizarAbaCrossHTML(lead, dados) {
    const lista = dados.crossSelling || [];
    const totalPotencial = lista.reduce((acc, item) => acc + (parseFloat(item.potencial) || 0), 0);
    const emTeste = lista.filter(i => i.etapa === 'amostra').length;
    const homologados = lista.filter(i => i.etapa === 'homologado').length;

    return `
        <div class="mergulho-card">
            <div class="mergulho-card-header">
                <div>
                    <h4>🎯 Cross-Selling de Produtos Micro (Matriz de Ataque)</h4>
                    <p class="text-xs text-muted">Defina as linhas da Micro Automação que fazem sentido atacar neste cliente contra a concorrência.</p>
                </div>
                <div style="display:flex;gap:6px;">
                    <button type="button" class="btn btn-outline btn-sm" onclick="mergulhoSugerirProdutosDiagnostico()" title="Adicionar produtos sugeridos com base no questionário">
                        💡 Sugerir a partir do Diagnóstico
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" onclick="mergulhoAbrirModalNovoProduto()">
                        + Adicionar Produto para Ataque
                    </button>
                </div>
            </div>

            <!-- CARDS DE TOTALIZADORES -->
            <div class="mergulho-metricas-grid">
                <div class="mergulho-mini-stat">
                    <span class="lbl">Linhas Mapeadas</span>
                    <span class="val">${lista.length}</span>
                </div>
                <div class="mergulho-mini-stat">
                    <span class="lbl">Amostras em Teste</span>
                    <span class="val text-warning">${emTeste}</span>
                </div>
                <div class="mergulho-mini-stat">
                    <span class="lbl">Homologados Micro</span>
                    <span class="val text-success">${homologados}</span>
                </div>
                <div class="mergulho-mini-stat">
                    <span class="lbl">Potencial Mapeado</span>
                    <span class="val text-primary"><strong>${formatarMoeda(totalPotencial)}</strong></span>
                </div>
            </div>

            <!-- TABELA DE ITENS DE CROSS-SELLING -->
            <div class="table-wrapper mt-16">
                <table class="table" style="font-size:12px;">
                    <thead>
                        <tr>
                            <th>Linha / Produto Micro</th>
                            <th>Concorrente Atual / Aplicação</th>
                            <th>Status do Ataque</th>
                            <th>Potencial Estimado</th>
                            <th>Argumento Técnico / Diferencial</th>
                            <th style="text-align:right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lista.length === 0 ? `
                            <tr>
                                <td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">
                                    Nenhum produto cadastrado para ataque neste lead ainda.<br>
                                    Clique em <strong>"+ Adicionar Produto para Ataque"</strong> ou use <strong>"💡 Sugerir a partir do Diagnóstico"</strong>.
                                </td>
                            </tr>
                        ` : lista.map((p, idx) => {
                            const etapaCores = {
                                oportunidade: 'badge-secondary',
                                amostra: 'badge-warning',
                                orcado: 'badge-info',
                                homologado: 'badge-success',
                                declinado: 'badge-danger'
                            };
                            const etapaNomes = {
                                oportunidade: '🟡 Oportunidade Mapeada',
                                amostra: '🔵 Amostra / Teste em Campo',
                                orcado: '🟣 Orçado / Proposta Enviada',
                                homologado: '🟢 Homologado / Convertido',
                                declinado: '⚪ Declinado'
                            };
                            return `
                                <tr>
                                    <td><strong>${p.linhaMicro}</strong></td>
                                    <td>${p.concorrente || '—'}</td>
                                    <td><span class="badge ${etapaCores[p.etapa] || 'badge-secondary'}">${etapaNomes[p.etapa] || p.etapa}</span></td>
                                    <td><strong>${formatarMoeda(p.potencial || 0)}</strong></td>
                                    <td><span class="text-muted text-xs">${p.argumento || '—'}</span></td>
                                    <td style="text-align:right;white-space:nowrap;">
                                        <button type="button" class="btn btn-outline btn-xs" onclick="mergulhoEditarProduto(${idx})">Editar</button>
                                        <button type="button" class="btn btn-outline btn-xs text-danger" onclick="mergulhoExcluirProduto(${idx})">Excluir</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Modal para adicionar/editar produto de ataque
function mergulhoAbrirModalNovoProduto(itemParaEditar = null, editIndex = -1) {
    const modalExistente = document.getElementById('modalMergulhoCross');
    if (modalExistente) modalExistente.remove();

    const linhasPredefinidas = [
        'Cilindros ISO 15552 Perfilados (Série P)',
        'Cilindros Compactos ISO 21287',
        'Cilindros Mini ISO 6432',
        'Cilindros com Guia Linear Integrada',
        'Válvulas Direcionais Solenoide 5/2 e 5/3 vias',
        'Ilhas de Válvulas Multipolares / Fieldbus',
        'Conjunto FRL Preparação de Ar (Filtro + Regulador + Lubrif.)',
        'Filtros Coalescentes Grau Submicrônico',
        'Conexões Instantâneas Latão Niquelado',
        'Tubos de Poliuretano (PU) Azul/Preto/Transparente',
        'Garras Pneumáticas Paralelas / Angulares',
        'Geradores de Vácuo (Ejetores) & Ventosas',
        'Linha Inox Sanitária (Cilindros e Válvulas)',
        'Válvulas de Processo / Assento Inclinado'
    ];

    const p = itemParaEditar || {
        linhaMicro: '',
        concorrente: '',
        etapa: 'oportunidade',
        potencial: 0,
        argumento: ''
    };

    const modalHTML = `
        <div class="modal-backdrop active" id="modalMergulhoCross">
            <div class="modal-box" style="max-width:550px;">
                <div class="modal-header">
                    <h3>${editIndex >= 0 ? 'Editar Produto de Ataque' : '+ Adicionar Produto Micro para Ataque'}</h3>
                    <button class="modal-close" onclick="document.getElementById('modalMergulhoCross').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Linha / Produto Micro Automação: <span class="required">*</span></label>
                        <input type="text" id="crossLinhaMicro" class="form-control" list="listaLinhasMicroSugestao" 
                            placeholder="Ex.: Cilindro ISO 15552 ou selecione abaixo" value="${p.linhaMicro}">
                        <datalist id="listaLinhasMicroSugestao">
                            ${linhasPredefinidas.map(l => `<option value="${l}">`).join('')}
                        </datalist>
                    </div>

                    <div class="form-group">
                        <label>Produto Concorrente Atual / Aplicação do Cliente:</label>
                        <input type="text" id="crossConcorrente" class="form-control" 
                            placeholder="Ex.: Festo DNC-50-200 ou SMC SY5120" value="${p.concorrente}">
                    </div>

                    <div class="form-group">
                        <label>Etapa do Ataque / Homologação:</label>
                        <select id="crossEtapa" class="form-control">
                            <option value="oportunidade" ${p.etapa === 'oportunidade' ? 'selected' : ''}>🟡 Oportunidade Mapeada</option>
                            <option value="amostra" ${p.etapa === 'amostra' ? 'selected' : ''}>🔵 Amostra / Teste em Campo</option>
                            <option value="orcado" ${p.etapa === 'orcado' ? 'selected' : ''}>🟣 Orçado / Proposta Enviada</option>
                            <option value="homologado" ${p.etapa === 'homologado' ? 'selected' : ''}>🟢 Homologado / Convertido</option>
                            <option value="declinado" ${p.etapa === 'declinado' ? 'selected' : ''}>⚪ Declinado</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Potencial Estimado de Faturamento (R$):</label>
                        <input type="number" id="crossPotencial" class="form-control" step="0.01" min="0" placeholder="0,00" value="${p.potencial || ''}">
                    </div>

                    <div class="form-group">
                        <label>Argumento Técnico / Diferencial para Vencer o Concorrente:</label>
                        <textarea id="crossArgumento" class="form-control" rows="3" 
                            placeholder="Ex.: Prazo de entrega em 48h vs. 45 dias do concorrente; Custo 25% menor; Vedação especial em Viton.">${p.argumento}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="document.getElementById('modalMergulhoCross').remove()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="mergulhoSalvarProduto(${editIndex})">Salvar Produto</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function mergulhoSalvarProduto(editIndex) {
    const lead = leads.find(l => l.id === mergulhoLeadAtualId);
    if (!lead) return;
    const dados = mergulhoObterDados(lead);

    const linhaMicro = document.getElementById('crossLinhaMicro')?.value.trim();
    if (!linhaMicro) {
        if (typeof showToast === 'function') showToast('Informe a linha ou produto Micro.', 'warning');
        return;
    }

    const item = {
        id: editIndex >= 0 ? dados.crossSelling[editIndex].id : gerarId(),
        linhaMicro,
        concorrente: document.getElementById('crossConcorrente')?.value.trim() || '',
        etapa: document.getElementById('crossEtapa')?.value || 'oportunidade',
        potencial: parseFloat(document.getElementById('crossPotencial')?.value) || 0,
        argumento: document.getElementById('crossArgumento')?.value.trim() || ''
    };

    if (!dados.crossSelling) dados.crossSelling = [];
    if (editIndex >= 0) {
        dados.crossSelling[editIndex] = item;
    } else {
        dados.crossSelling.push(item);
    }

    mergulhoSalvarLocal(lead.id, dados);
    salvarDadosDebounced(300);

    const modal = document.getElementById('modalMergulhoCross');
    if (modal) modal.remove();

    mergulhoAlternarAba('abaCross');
    if (typeof showToast === 'function') showToast('Produto salvo na matriz de cross-selling!', 'success');
}

function mergulhoEditarProduto(idx) {
    const lead = leads.find(l => l.id === mergulhoLeadAtualId);
    if (!lead) return;
    const dados = mergulhoObterDados(lead);
    if (!dados.crossSelling || !dados.crossSelling[idx]) return;

    mergulhoAbrirModalNovoProduto(dados.crossSelling[idx], idx);
}

function mergulhoExcluirProduto(idx) {
    const lead = leads.find(l => l.id === mergulhoLeadAtualId);
    if (!lead) return;
    const dados = mergulhoObterDados(lead);
    if (!dados.crossSelling) return;

    dados.crossSelling.splice(idx, 1);
    mergulhoSalvarLocal(lead.id, dados);
    salvarDadosDebounced(300);
    mergulhoAlternarAba('abaCross');
}

// Sugere automaticamente produtos baseando-se nas respostas do questionário
function mergulhoSugerirProdutosDiagnostico() {
    const lead = leads.find(l => l.id === mergulhoLeadAtualId);
    if (!lead) return;
    const dados = mergulhoObterDados(lead);
    const q = dados.questionario || {};

    let sugestoes = [];
    const linhas = q.linhasConsumo || [];

    if (linhas.includes('cilindros_iso')) {
        sugestoes.push({
            linhaMicro: 'Cilindros ISO 15552 Perfilados',
            concorrente: q.detalhesItemAmostra || 'Cilindro Festo DNC / SMC C95',
            etapa: q.desejoAmostra === 'sim_amostra' ? 'amostra' : 'oportunidade',
            potencial: 12000,
            argumento: 'Entrega ágil em 48h para cursos especiais e preço altamente competitivo.'
        });
    }

    if (linhas.includes('valvulas_solenoide') || linhas.includes('ilhas_valvulas')) {
        sugestoes.push({
            linhaMicro: 'Ilha de Válvulas & Válvulas Direcionais Solenoide',
            concorrente: 'SMC SY5000 / Festo VUVG',
            etapa: 'oportunidade',
            potencial: 18000,
            argumento: 'Manifolds compactos com montagem nacional e bobinas intercambiáveis.'
        });
    }

    if (linhas.includes('preparacao_ar')) {
        sugestoes.push({
            linhaMicro: 'Conjunto FRL Preparação de Ar',
            concorrente: 'Festo MS / SMC AC',
            etapa: 'oportunidade',
            potencial: 6000,
            argumento: 'Dreno automático de alta durabilidade e manômetro embutido.'
        });
    }

    if (linhas.includes('conexoes_tubos')) {
        sugestoes.push({
            linhaMicro: 'Conexões Instantâneas Latão Niquelado & Tubo PU',
            concorrente: 'Festo QS / Parker Prestolok',
            etapa: 'oportunidade',
            potencial: 8000,
            argumento: 'Estoque permanente com desconto progressivo por quantidade.'
        });
    }

    if (sugestoes.length === 0) {
        sugestoes.push({
            linhaMicro: 'Cilindros Pneumáticos ISO & Válvulas Direcionais',
            concorrente: 'Equipamentos da concorrência',
            etapa: 'oportunidade',
            potencial: 10000,
            argumento: 'Linha completa com homologação técnica rápida.'
        });
    }

    if (!dados.crossSelling) dados.crossSelling = [];
    sugestoes.forEach(s => {
        dados.crossSelling.push({
            id: gerarId(),
            ...s
        });
    });

    mergulhoSalvarLocal(lead.id, dados);
    salvarDadosDebounced(300);
    mergulhoAlternarAba('abaCross');
    if (typeof showToast === 'function') showToast(`${sugestoes.length} produtos sugeridos com base no diagnóstico!`, 'success');
}

// ============================================================
// 6. PÁGINA PÚBLICA DE DIAGNÓSTICO (ISOLAMENTO TOTAL DO CRM)
// ============================================================
function mergulhoVerificarRotaPublica() {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    let leadId = null;

    if (hash.startsWith('#diagnostico-')) {
        leadId = hash.replace('#diagnostico-', '').trim();
    } else if (search.includes('diagnostico=')) {
        const params = new URLSearchParams(search);
        leadId = params.get('diagnostico');
    }

    if (leadId) {
        // Redireciona imediatamente para a página externa protegida e 100% isolada do CRM
        const lead = (typeof leads !== 'undefined' ? leads : []).find(l => l.id === leadId);
        const empresaNome = lead ? encodeURIComponent(lead.empresa || '') : '';
        window.location.replace(`diagnostico.html?id=${encodeURIComponent(leadId)}&empresa=${empresaNome}`);
        return true;
    }
    return false;
}

function mergulhoExibirPaginaPublica(leadId) {
    // Redirecionamento de segurança para o arquivo isolado diagnostico.html
    const lead = (typeof leads !== "undefined" ? leads : []).find(l => l.id === leadId);
    const empresaNome = lead ? encodeURIComponent(lead.empresa || "") : "";
    window.location.replace("diagnostico.html?id=" + encodeURIComponent(leadId) + "&empresa=" + empresaNome);
}

// ============================================================
// ============================================================
// 7. EXPORTAÇÃO / IMPRESSÃO / RELATÓRIO DO DOSSIÊ DO LEAD
// ============================================================
function mergulhoEscapar(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function mergulhoExportarDossiePDF(leadId) {
    const id = leadId || mergulhoLeadAtualId;
    if (typeof mergulhoBaixarFichaLeadPDF === 'function') {
        mergulhoBaixarFichaLeadPDF(id);
    } else {
        mergulhoExibirRelatorioModal(id);
    }
}

// Abre o Relatório Completo do Lead diretamente em um Modal na tela (sem popup ou bloqueio de navegador)
function mergulhoExibirRelatorioModal(leadId) {
    const id = leadId || mergulhoLeadAtualId || (leads && leads[0] ? leads[0].id : null);
    const lead = (typeof leads !== 'undefined' ? leads : []).find(l => l.id === id);
    if (!lead) {
        if (typeof showToast === 'function') showToast('Selecione um lead para visualizar o relatório.', 'warning');
        return;
    }
    mergulhoLeadAtualId = lead.id;
    const dados = mergulhoObterDados(lead);
    const c = dados.cnpjEnriquecido || {};
    const p = dados.presencaDigital || {};
    const campo = dados.campo || {};
    const q = dados.questionario || {};
    const cross = dados.crossSelling || [];

    let modalOverlay = document.getElementById('mergulhoRelatorioModalOverlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'mergulhoRelatorioModalOverlay';
        modalOverlay.className = 'modal-overlay';
        document.body.appendChild(modalOverlay);
    }

    const mapaFoco = {
        'oem': 'Fabricante de Máquinas e Equipamentos (OEM)',
        'mro': 'Indústria em Produção Ativa (Manutenção / MRO)',
        'integrador': 'Revenda / Distribuidor / Integrador de Painéis'
    };
    const mapaFreq = {
        'semanal': 'Semanal / Contínua (Alto volume de reposição)',
        'mensal': 'Mensal sob demanda de pedidos',
        'esporadica': 'Esporádica (Apenas reformas/manutenções)'
    };
    const mapaLinhas = {
        'cilindros_iso': 'Cilindros ISO (15552 / 6431 / 6432)',
        'cilindros_compactos': 'Cilindros Compactos / Guiados',
        'valvulas_solenoide': 'Válvulas Direcionais & Solenoides',
        'ilhas_valvulas': 'Ilhas de Válvulas / Manifolds',
        'preparacao_ar': 'Preparação de Ar (Filtros, FRL, Coalescentes)',
        'conexoes_tubos': 'Conexões Rápidas & Tubos PU/Nylon',
        'garras_vacuo': 'Garras Pneumáticas & Manipulação / Vácuo',
        'linha_inox': 'Linha Inox / Sanitária para Alimentos/Química'
    };
    const mapaDesafio = {
        'prazo': 'Prazo de entrega longo (atrasando máquinas/manutenções)',
        'preco': 'Preços elevados ou reajustes abusivos',
        'suporte': 'Falta de suporte técnico para especificação',
        'estoque': 'Falta de estoque local para reposição imediata'
    };
    const mapaAmostra = {
        'sim_amostra': 'Sim! Quer testar uma amostra equivalente na máquina',
        'sim_cotacao': 'Sim! Quer cotação comparativa dos itens mais consumidos',
        'nao': 'No momento não, manter apenas contato'
    };

    const linhasMarcadas = (q.linhasConsumo || []).map(k => mapaLinhas[k] || k);
    const dataHoraResp = q.respondidoEm ? (typeof formatarDataHora === 'function' ? formatarDataHora(q.respondidoEm) : q.respondidoEm) : '—';

    modalOverlay.innerHTML = `
        <div class="modal" style="max-width:920px;width:95vw;max-height:92vh;display:flex;flex-direction:column;padding:0;overflow:hidden;border-radius:12px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.3);">
            <!-- CABEÇALHO DO RELATÓRIO -->
            <div class="modal-header" style="background:#0f172a;color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #0284c7;">
                <div>
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#38bdf8;font-weight:700;">Relatório Executivo & Dossiê do Lead</div>
                    <h2 style="font-size:18px;font-weight:700;margin:2px 0 0;color:#fff;display:flex;align-items:center;gap:8px;">
                        <span>📋</span> ${mergulhoEscapar(lead.empresa)}
                    </h2>
                    <div style="font-size:12px;color:#94a3b8;margin-top:2px;">
                        CNPJ: ${lead.cnpj ? mergulhoFormatarCnpj(lead.cnpj) : 'Não informado'} • ${lead.cidade || '—'}/${lead.estado || '—'}
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <button type="button" class="btn btn-outline btn-sm" onclick="mergulhoCopiarResumoTexto('${lead.id}')" style="color:#fff;border-color:#475569;background:rgba(255,255,255,0.08);" title="Copiar resumo textual para WhatsApp ou E-mail">
                        📋 Copiar Resumo
                    </button>
                    <button type="button" class="btn btn-success btn-sm" onclick="mergulhoBaixarFichaLeadPDF('${lead.id}')" title="Baixar arquivo PDF direto deste lead">
                        📥 Baixar PDF
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" onclick="mergulhoImprimirDossie('${lead.id}')" title="Imprimir ou salvar em PDF">
                        🖨️ Imprimir
                    </button>
                    <button type="button" class="modal-close" onclick="fecharModal('mergulhoRelatorioModalOverlay')" style="color:#94a3b8;font-size:20px;line-height:1;margin-left:8px;background:none;border:none;cursor:pointer;" title="Fechar">✕</button>
                </div>
            </div>

            <!-- CORPO DO RELATÓRIO COM SCROLL -->
            <div style="padding:20px;overflow-y:auto;flex:1;background:#f8fafc;display:flex;flex-direction:column;gap:16px;">
                
                <!-- STATUS DO DIAGNÓSTICO -->
                <div style="background:${q.respondido ? '#f0fdf4' : '#fffbeb'};border:1px solid ${q.respondido ? '#bbf7d0' : '#fef3c7'};border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                    <div>
                        <div style="font-weight:700;font-size:14px;color:${q.respondido ? '#166534' : '#92400e'};display:flex;align-items:center;gap:6px;">
                            <span>${q.respondido ? '✅' : '⏳'}</span>
                            ${q.respondido ? `Diagnóstico Respondido ${q.respondidoPor === 'cliente' ? 'pelo Próprio Lead (Link Externo)' : 'pela Equipe Comercial'}` : 'Diagnóstico Técnico Pendente'}
                        </div>
                        <div style="font-size:12px;color:${q.respondido ? '#15803d' : '#b45309'};margin-top:2px;">
                            ${q.respondido ? `Recebido em: <strong>${dataHoraResp}</strong>` : 'Envie o link de sondagem para o cliente responder em 1 minuto.'}
                            ${q.contatoNome ? ` · Preenchido por: <strong>${mergulhoEscapar(q.contatoNome)}</strong>` : ''}
                            ${q.contatoTel ? ` · Tel/WhatsApp: <strong>${mergulhoEscapar(q.contatoTel)}</strong>` : ''}
                        </div>
                    </div>
                    ${q.respondido ? `
                        <span style="background:#16a34a;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;">
                            RESPOSTAS CONFIRMADAS
                        </span>
                    ` : `
                        <button type="button" class="btn btn-outline btn-xs" onclick="fecharModal('mergulhoRelatorioModalOverlay');abrirMergulhoProfundoLead('${lead.id}','abaQuestionario')">
                            Abrir Questionário / Gerar Link
                        </button>
                    `}
                </div>

                <!-- SEÇÃO 1: RESPOSTAS DO QUESTIONÁRIO TÉCNICO -->
                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
                    <h3 style="font-size:14px;font-weight:700;color:#0369a1;margin:0 0 12px;border-bottom:1px solid #f1f5f9;padding-bottom:6px;display:flex;align-items:center;gap:6px;">
                        <span>📋</span> 1. Questionário & Sondagem Técnica em Pneumática Industrial
                    </h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:12px;">
                        <div style="background:#f8fafc;padding:10px 12px;border-radius:6px;border:1px solid #edf2f7;">
                            <span style="font-size:11px;color:#64748b;display:block;">1. Foco da Operação do Cliente:</span>
                            <strong style="font-size:13px;color:#0f172a;">${mapaFoco[q.focoOperacao] || q.focoOperacao || 'Não informado'}</strong>
                        </div>
                        <div style="background:#f8fafc;padding:10px 12px;border-radius:6px;border:1px solid #edf2f7;">
                            <span style="font-size:11px;color:#64748b;display:block;">2. Frequência de Compra de Itens Pneumáticos:</span>
                            <strong style="font-size:13px;color:#0f172a;">${mapaFreq[q.frequenciaCompra] || q.frequenciaCompra || 'Não informado'}</strong>
                        </div>
                        <div style="background:#f8fafc;padding:10px 12px;border-radius:6px;border:1px solid #edf2f7;">
                            <span style="font-size:11px;color:#64748b;display:block;">4. Cilindros com Medidas Especiais sob Encomenda:</span>
                            <strong style="font-size:13px;color:${q.cilindrosEspeciais === 'sim' ? '#0284c7' : '#0f172a'};">
                                ${q.cilindrosEspeciais === 'sim' ? '⚡ Sim, necessitam de cursos ou hastes especiais' : (q.cilindrosEspeciais === 'nao' ? 'Não, apenas medidas de catálogo' : 'Não informado')}
                            </strong>
                        </div>
                        <div style="background:#f8fafc;padding:10px 12px;border-radius:6px;border:1px solid #edf2f7;">
                            <span style="font-size:11px;color:#64748b;display:block;">5. Principal Gargalo com Fornecedores Atuais:</span>
                            <strong style="font-size:13px;color:#dc2626;">${mapaDesafio[q.desafioFornecedor] || q.desafioFornecedor || 'Não informado'}</strong>
                        </div>
                        <div style="background:#f8fafc;padding:10px 12px;border-radius:6px;border:1px solid #edf2f7;grid-column:1 / -1;">
                            <span style="font-size:11px;color:#64748b;display:block;">6. Interesse em Amostra Técnica ou Cotação:</span>
                            <strong style="font-size:13px;color:#16a34a;">${mapaAmostra[q.desejoAmostra] || q.desejoAmostra || 'Não informado'}</strong>
                        </div>
                    </div>

                    <!-- LINHAS CRÍTICAS -->
                    <div style="margin-top:12px;">
                        <span style="font-size:11px;color:#64748b;display:block;margin-bottom:6px;font-weight:600;">3. Linhas com Maior Demanda ou Criticidade na Fábrica:</span>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                            ${linhasMarcadas.length > 0 ? linhasMarcadas.map(l => `
                                <span style="background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;font-size:11px;font-weight:600;padding:4px 8px;border-radius:4px;">
                                    ✓ ${mergulhoEscapar(l)}
                                </span>
                            `).join('') : '<span style="font-size:12px;color:#94a3b8;">Nenhuma linha assinalada.</span>'}
                        </div>
                    </div>

                    ${q.detalhesItemAmostra ? `
                        <div style="margin-top:12px;background:#fef2f2;border:1px solid #fecaca;padding:10px 12px;border-radius:6px;">
                            <span style="font-size:11px;color:#991b1b;font-weight:700;display:block;">7. Itens Concorrentes / Medidas para Amostra ou Cotação:</span>
                            <div style="font-size:13px;color:#7f1d1d;margin-top:2px;">${mergulhoEscapar(q.detalhesItemAmostra)}</div>
                        </div>
                    ` : ''}

                    ${q.observacoesGerais ? `
                        <div style="margin-top:10px;background:#f8fafc;border:1px solid #e2e8f0;padding:10px 12px;border-radius:6px;">
                            <span style="font-size:11px;color:#475569;font-weight:600;display:block;">Observações Técnicas Gerais:</span>
                            <div style="font-size:12px;color:#334155;margin-top:2px;">${mergulhoEscapar(q.observacoesGerais)}</div>
                        </div>
                    ` : ''}
                </div>

                <!-- SEÇÃO 2: DADOS RECEITA FEDERAL & PRESENÇA DIGITAL -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(380px, 1fr));gap:14px;">
                    <!-- RECEITA -->
                    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;">
                        <h4 style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 10px;border-bottom:1px solid #f1f5f9;padding-bottom:4px;">
                            🏢 2. Dados Oficiais da Receita Federal
                        </h4>
                        <div style="font-size:12px;display:flex;flex-direction:column;gap:5px;">
                            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Razão Social:</span><strong style="text-align:right;">${mergulhoEscapar(c.razao_social || lead.empresa)}</strong></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Situação:</span><strong style="color:${(c.descricao_situacao_cadastral || 'ATIVA') === 'ATIVA' ? '#16a34a' : '#dc2626'};">${c.descricao_situacao_cadastral || 'ATIVA'}</strong></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Porte / Capital:</span><strong>${c.porte || '—'} (${typeof formatarMoeda === 'function' ? formatarMoeda(c.capital_social || 0) : c.capital_social})</strong></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">CNAE Principal:</span><strong style="text-align:right;">${c.cnae_fiscal || '—'} ${c.cnae_fiscal_descricao ? '· ' + mergulhoEscapar(c.cnae_fiscal_descricao) : ''}</strong></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Endereço:</span><strong style="text-align:right;">${mergulhoEscapar(c.logradouro || '')} ${c.numero || ''} - ${mergulhoEscapar(c.municipio || lead.cidade || '')}/${c.uf || lead.estado || ''}</strong></div>
                        </div>
                    </div>

                    <!-- PRESENÇA & CONTATOS -->
                    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;">
                        <h4 style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 10px;border-bottom:1px solid #f1f5f9;padding-bottom:4px;">
                            🌐 3. Presença Digital & Contatos
                        </h4>
                        <div style="font-size:12px;display:flex;flex-direction:column;gap:5px;">
                            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Decisor Principal:</span><strong>${mergulhoEscapar(lead.decisor || '—')}</strong></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Telefone / WhatsApp:</span><strong>${mergulhoEscapar(lead.telefone || lead.whatsapp || '—')}</strong></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">E-mail:</span><strong>${mergulhoEscapar(lead.email || '—')}</strong></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Website:</span><strong>${p.website ? `<a href="${p.website}" target="_blank" style="color:#0284c7;">${mergulhoEscapar(p.website)}</a>` : '—'}</strong></div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">LinkedIn:</span><strong>${p.linkedinEmpresa ? `<a href="${p.linkedinEmpresa}" target="_blank" style="color:#0284c7;">Acessar Perfil</a>` : '—'}</strong></div>
                        </div>
                    </div>
                </div>

                <!-- SEÇÃO 3: MATRIZ DE PRODUTOS MICRO -->
                ${cross.length > 0 ? `
                    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;">
                        <h4 style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 8px;">
                            🎯 4. Oportunidades de Cross-Selling & Linhas Micro Pneumática
                        </h4>
                        <table style="width:100%;border-collapse:collapse;font-size:12px;">
                            <thead>
                                <tr style="background:#f1f5f9;text-align:left;">
                                    <th style="padding:6px 8px;border:1px solid #e2e8f0;">Linha Micro</th>
                                    <th style="padding:6px 8px;border:1px solid #e2e8f0;">Concorrente</th>
                                    <th style="padding:6px 8px;border:1px solid #e2e8f0;">Etapa</th>
                                    <th style="padding:6px 8px;border:1px solid #e2e8f0;">Potencial</th>
                                    <th style="padding:6px 8px;border:1px solid #e2e8f0;">Argumento</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cross.map(item => `
                                    <tr>
                                        <td style="padding:6px 8px;border:1px solid #e2e8f0;"><strong>${mergulhoEscapar(item.linhaMicro || '')}</strong></td>
                                        <td style="padding:6px 8px;border:1px solid #e2e8f0;">${mergulhoEscapar(item.concorrente || '—')}</td>
                                        <td style="padding:6px 8px;border:1px solid #e2e8f0;">${mergulhoEscapar(item.etapa || '')}</td>
                                        <td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:600;color:#16a34a;">${typeof formatarMoeda === 'function' ? formatarMoeda(item.potencial || 0) : item.potencial}</td>
                                        <td style="padding:6px 8px;border:1px solid #e2e8f0;">${mergulhoEscapar(item.argumento || '—')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}

            </div>

            <!-- RODAPÉ -->
            <div class="modal-footer" style="padding:12px 20px;background:#fff;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:12px;color:#64748b;">Feitosa CRM · Micro Automação Pneumática</span>
                <div style="display:flex;gap:8px;">
                    <button type="button" class="btn btn-outline" onclick="fecharModal('mergulhoRelatorioModalOverlay')">Fechar</button>
                    <button type="button" class="btn btn-success" onclick="mergulhoBaixarFichaLeadPDF('${lead.id}')">📥 Baixar PDF (.pdf)</button>
                    <button type="button" class="btn btn-primary" onclick="mergulhoImprimirDossie('${lead.id}')">🖨️ Imprimir / Salvar PDF</button>
                </div>
            </div>
        </div>
    `;

    abrirModal('mergulhoRelatorioModalOverlay');
}

// Gera o HTML do dossiê completo para impressão ou exportação
function mergulhoGerarHTMLDossieParaImpressao(lead) {
    if (!lead) return '';
    const dados = mergulhoObterDados(lead);
    const c = dados.cnpjEnriquecido || {};
    const p = dados.presencaDigital || {};
    const campo = dados.campo || {};
    const q = dados.questionario || {};
    const cross = dados.crossSelling || [];

    const mapaFoco = { 'oem': 'Fabricante OEM', 'mro': 'Manutenção MRO', 'integrador': 'Revenda/Integrador' };
    const mapaFreq = { 'semanal': 'Semanal / Contínua', 'mensal': 'Mensal', 'esporadica': 'Esporádica' };
    const mapaDesafio = { 'prazo': 'Prazo de entrega longo', 'preco': 'Preços elevados', 'suporte': 'Falta de suporte técnico', 'estoque': 'Falta de estoque local' };
    const mapaAmostra = { 'sim_amostra': 'Quer testar amostra', 'sim_cotacao': 'Quer cotação comparativa', 'nao': 'Apenas contato' };

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Dossiê Comercial — ${lead.empresa}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 24px; color: #1e293b; line-height: 1.4; font-size: 12px; }
                h1, h2, h3, h4 { margin: 0 0 6px; color: #0f172a; }
                .header-dossie { border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end; }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
                .box-secao { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px; background: #fff; }
                .box-secao h4 { border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; font-size: 13px; color: #0284c7; }
                .linha-info { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #e2e8f0; font-size: 11px; }
                .linha-info strong { color: #0f172a; text-align: right; }
                table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; }
                th, td { border: 1px solid #cbd5e1; padding: 5px 6px; text-align: left; }
                th { background: #f1f5f9; font-weight: 600; }
                .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #e2e8f0; }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header-dossie">
                <div>
                    <h1 style="font-size:18px;">Dossiê Comercial & Mergulho Profundo</h1>
                    <div style="font-size:15px;font-weight:700;color:#0284c7;">${mergulhoEscapar(lead.empresa)}</div>
                    <div style="font-size:11px;color:#64748b;">CNPJ: ${lead.cnpj ? mergulhoFormatarCnpj(lead.cnpj) : 'Não informado'} • Localidade: ${lead.cidade || '—'}/${lead.estado || '—'}</div>
                </div>
                <div style="text-align:right;font-size:10px;color:#64748b;">
                    <div>Gerado em: ${typeof hoje === 'function' ? formatarData(hoje()) : new Date().toLocaleDateString('pt-BR')}</div>
                    <div>Micro Automação / Feitosa CRM</div>
                    <button class="no-print" onclick="window.print()" style="margin-top:6px;padding:4px 8px;cursor:pointer;background:#0284c7;color:#fff;border:none;border-radius:4px;">Imprimir / PDF</button>
                </div>
            </div>

            <!-- QUESTIONÁRIO TÉCNICO -->
            <div class="box-secao">
                <h4>📋 Diagnóstico Técnico em Pneumática Industrial</h4>
                <div class="grid-2">
                    <div>
                        <div class="linha-info"><span>Status:</span> <strong>${q.respondido ? '✅ Respondido ' + (q.respondidoPor === 'cliente' ? '(Pelo Cliente)' : '') : 'Pendente'}</strong></div>
                        <div class="linha-info"><span>Foco da Operação:</span> <strong>${mapaFoco[q.focoOperacao] || q.focoOperacao || '—'}</strong></div>
                        <div class="linha-info"><span>Frequência de Compra:</span> <strong>${mapaFreq[q.frequenciaCompra] || q.frequenciaCompra || '—'}</strong></div>
                        <div class="linha-info"><span>Cilindros Especiais:</span> <strong>${q.cilindrosEspeciais === 'sim' ? 'Sim (Hastes/Cursos especiais)' : 'Não'}</strong></div>
                    </div>
                    <div>
                        <div class="linha-info"><span>Principal Gargalo:</span> <strong>${mapaDesafio[q.desafioFornecedor] || q.desafioFornecedor || '—'}</strong></div>
                        <div class="linha-info"><span>Interesse Amostra:</span> <strong>${mapaAmostra[q.desejoAmostra] || q.desejoAmostra || '—'}</strong></div>
                        <div class="linha-info"><span>Contato Responsável:</span> <strong>${mergulhoEscapar(q.contatoNome || lead.decisor || '—')} ${q.contatoTel ? '· ' + mergulhoEscapar(q.contatoTel) : ''}</strong></div>
                    </div>
                </div>
                ${(q.linhasConsumo || []).length > 0 ? `<div style="margin-top:6px;font-size:11px;"><strong>Linhas com Demanda:</strong> ${(q.linhasConsumo || []).join(', ')}</div>` : ''}
                ${q.detalhesItemAmostra ? `<div style="margin-top:6px;font-size:11px;"><strong>Itens Concorrentes / Medidas Solicitadas:</strong> ${mergulhoEscapar(q.detalhesItemAmostra)}</div>` : ''}
            </div>

            <div class="grid-2">
                <div class="box-secao">
                    <h4>🏢 Dados Oficiais da Receita Federal</h4>
                    <div class="linha-info"><span>Razão Social:</span> <strong>${mergulhoEscapar(c.razao_social || lead.empresa)}</strong></div>
                    <div class="linha-info"><span>Nome Fantasia:</span> <strong>${mergulhoEscapar(c.nome_fantasia || '—')}</strong></div>
                    <div class="linha-info"><span>Situação:</span> <strong>${c.descricao_situacao_cadastral || 'ATIVA'}</strong></div>
                    <div class="linha-info"><span>Porte / Capital:</span> <strong>${c.porte || '—'} (${typeof formatarMoeda === 'function' ? formatarMoeda(c.capital_social || 0) : c.capital_social})</strong></div>
                    <div class="linha-info"><span>CNAE Principal:</span> <strong>${c.cnae_fiscal || '—'} ${c.cnae_fiscal_descricao ? '· ' + mergulhoEscapar(c.cnae_fiscal_descricao) : ''}</strong></div>
                    <div class="linha-info"><span>Endereço:</span> <strong>${mergulhoEscapar(c.logradouro || '')} ${c.numero || ''} - ${mergulhoEscapar(c.municipio || lead.cidade || '')}/${c.uf || lead.estado || ''}</strong></div>
                </div>

                <div class="box-secao">
                    <h4>🌐 Presença Digital & Contatos</h4>
                    <div class="linha-info"><span>Website:</span> <strong>${mergulhoEscapar(p.website || '—')}</strong></div>
                    <div class="linha-info"><span>LinkedIn Empresa:</span> <strong>${mergulhoEscapar(p.linkedinEmpresa || '—')}</strong></div>
                    <div class="linha-info"><span>Telefone Lead:</span> <strong>${mergulhoEscapar(lead.telefone || lead.whatsapp || '—')}</strong></div>
                    <div class="linha-info"><span>E-mail:</span> <strong>${mergulhoEscapar(lead.email || '—')}</strong></div>
                    <div class="linha-info"><span>Decisor Cadastrado:</span> <strong>${mergulhoEscapar(lead.decisor || '—')}</strong></div>
                </div>
            </div>

            <div class="box-secao">
                <h4>🎯 Oportunidades de Cross-Selling & Substituição Micro</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Linha Micro</th>
                            <th>Concorrente</th>
                            <th>Etapa</th>
                            <th>Potencial</th>
                            <th>Argumento Técnico</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cross.length === 0 ? '<tr><td colspan="5">Nenhum produto cadastrado para ataque.</td></tr>' : cross.map(i => `
                            <tr>
                                <td><strong>${mergulhoEscapar(i.linhaMicro || '')}</strong></td>
                                <td>${mergulhoEscapar(i.concorrente || '—')}</td>
                                <td>${mergulhoEscapar(i.etapa || '')}</td>
                                <td>${typeof formatarMoeda === 'function' ? formatarMoeda(i.potencial || 0) : i.potencial}</td>
                                <td>${mergulhoEscapar(i.argumento || '—')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `;
}

// Dispara impressão segura de dossiê do lead
function mergulhoImprimirDossie(leadId) {
    const id = leadId || mergulhoLeadAtualId;
    const lead = (typeof leads !== 'undefined' ? leads : []).find(l => l.id === id);
    if (!lead) {
        if (typeof showToast === 'function') showToast('Lead não encontrado para impressão.', 'warning');
        return;
    }

    const html = mergulhoGerarHTMLDossieParaImpressao(lead);
    if (typeof imprimirRelatorioHtmlSeguro === 'function') {
        imprimirRelatorioHtmlSeguro(html, `Dossiê Técnico - ${lead.empresa}`);
    } else {
        mergulhoExecutarImpressaoIframe(html);
    }
}

// Gera e baixa diretamente o arquivo .PDF da ficha individual do lead
function mergulhoBaixarFichaLeadPDF(leadId) {
    const id = leadId || mergulhoLeadAtualId;
    const lead = (typeof leads !== 'undefined' ? leads : []).find(l => l.id === id);
    if (!lead) {
        if (typeof showToast === 'function') showToast('Lead não encontrado para gerar PDF.', 'warning');
        return;
    }

    if (typeof showToast === 'function') {
        showToast(`Gerando PDF de ${lead.empresa}...`, 'info');
    }

    const html = mergulhoGerarHTMLDossieParaImpressao(lead);

    if (window.html2pdf) {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '840px';
        container.style.background = '#ffffff';
        container.innerHTML = html;
        document.body.appendChild(container);

        const dataHoje = (typeof hoje === 'function') ? hoje() : new Date().toISOString().slice(0, 10);
        const nomeEmpresa = (lead.empresa || 'empresa').toLowerCase().replace(/[^a-z0-9]/g, '_');
        const opt = {
            margin: [8, 10, 8, 10],
            filename: `dossie_diagnostico_${nomeEmpresa}_${dataHoje}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(container).save().then(() => {
            if (container.parentNode) container.parentNode.removeChild(container);
            if (typeof showToast === 'function') {
                showToast('📥 Arquivo PDF baixado com sucesso!', 'success');
            }
        }).catch(err => {
            console.warn('Fallback impressão após html2pdf:', err);
            if (container.parentNode) container.parentNode.removeChild(container);
            mergulhoImprimirDossie(id);
        });
    } else {
        mergulhoImprimirDossie(id);
    }
}

// Copia resumo em texto do questionário e dados principais para WhatsApp ou Email
function mergulhoCopiarResumoTexto(leadId) {
    const id = leadId || mergulhoLeadAtualId;
    const lead = (typeof leads !== 'undefined' ? leads : []).find(l => l.id === id);
    if (!lead) return;
    const dados = mergulhoObterDados(lead);
    const q = dados.questionario || {};

    const mapaFoco = { 'oem': 'Fabricante OEM', 'mro': 'Manutenção Fabril MRO', 'integrador': 'Revenda/Integrador' };
    const mapaFreq = { 'semanal': 'Semanal / Alto giro', 'mensal': 'Mensal sob demanda', 'esporadica': 'Esporádica' };
    const mapaDesafio = { 'prazo': 'Prazo de entrega', 'preco': 'Preço elevado', 'suporte': 'Suporte técnico', 'estoque': 'Falta de estoque local' };
    const mapaAmostra = { 'sim_amostra': 'Deseja testar amostra na máquina', 'sim_cotacao': 'Deseja cotação comparativa', 'nao': 'Apenas contato' };

    let txt = `*DIAGNÓSTICO TÉCNICO & DOSSIÊ — ${lead.empresa}*\n`;
    txt += `CNPJ: ${lead.cnpj ? mergulhoFormatarCnpj(lead.cnpj) : 'Não informado'} | Local: ${lead.cidade || '—'}/${lead.estado || '—'}\n`;
    txt += `Status: ${q.respondido ? '✅ Respondido' : '⏳ Pendente'}\n`;
    if (q.contatoNome) txt += `Contato: ${q.contatoNome} (${q.contatoTel || ''})\n`;
    txt += `----------------------------------------\n`;
    txt += `1. Operação: ${mapaFoco[q.focoOperacao] || q.focoOperacao || '—'}\n`;
    txt += `2. Frequência: ${mapaFreq[q.frequenciaCompra] || q.frequenciaCompra || '—'}\n`;
    txt += `3. Linhas com Demanda: ${(q.linhasConsumo || []).join(', ') || '—'}\n`;
    txt += `4. Cilindros sob Medida: ${q.cilindrosEspeciais === 'sim' ? 'Sim' : 'Não'}\n`;
    txt += `5. Gargalo Atual: ${mapaDesafio[q.desafioFornecedor] || q.desafioFornecedor || '—'}\n`;
    txt += `6. Amostra / Cotação: ${mapaAmostra[q.desejoAmostra] || q.desejoAmostra || '—'}\n`;
    if (q.detalhesItemAmostra) txt += `7. Item Concorrente / Medida: ${q.detalhesItemAmostra}\n`;
    if (q.observacoesGerais) txt += `Obs: ${q.observacoesGerais}\n`;

    if (typeof copiarTexto === 'function') {
        copiarTexto(txt, 'Resumo do diagnóstico copiado com sucesso!');
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(() => {
            if (typeof showToast === 'function') showToast('Resumo copiado!', 'success');
        });
    }
}

// Auxiliares de Formatação
function mergulhoFormatarCnpj(cnpj) {
    if (!cnpj) return '';
    const d = cnpj.replace(/\D/g, '');
    if (d.length !== 14) return cnpj;
    return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

// ==========================================================================
// 8. RELATÓRIO VISUAL & IMPRESSÃO EM PDF DE QUEM JÁ RESPONDEU O QUESTIONÁRIO
// ==========================================================================

/**
 * Coleta e compila todos os leads que já responderam ao questionário de diagnóstico
 * Suporta filtros por busca textual, período, origem e interesse em amostra/cotação
 */
function mergulhoObterTodosRespondentes(filtros = {}) {
    const todosLeads = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads : [];
    const todosLocais = mergulhoCarregarTodos();

    let lista = [];

    todosLeads.forEach(lead => {
        const dados = todosLocais[lead.id] || (lead.mergulho || null) || mergulhoObterDados(lead);
        const q = dados ? dados.questionario : null;

        if (q && (q.respondido === true || q.respondido === 'true')) {
            const nomeContato = q.contatoNome || lead.decisor || (q.respondidoPor === 'cliente' ? 'Contato da Empresa' : 'Equipe Comercial');
            const telContato = q.contatoTel || lead.whatsapp || lead.telefone || '—';
            const emailContato = q.contatoEmail || lead.email || '—';
            const dataHora = q.respondidoEm || lead.dataCriacao || new Date().toISOString();

            lista.push({
                leadId: lead.id,
                empresa: lead.empresa || 'Empresa sem nome',
                cnpj: lead.cnpj || '',
                cidade: lead.cidade || '',
                estado: lead.estado || '',
                etapa: lead.etapa || 'leads',
                nome: nomeContato,
                telefone: telContato,
                email: emailContato,
                dataHora: dataHora,
                respondidoPor: q.respondidoPor || 'cliente',
                focoOperacao: q.focoOperacao || '',
                frequenciaCompra: q.frequenciaCompra || '',
                linhasConsumo: Array.isArray(q.linhasConsumo) ? q.linhasConsumo : [],
                cilindrosEspeciais: q.cilindrosEspeciais || '',
                desafioFornecedor: q.desafioFornecedor || '',
                desejoAmostra: q.desejoAmostra || '',
                detalhesItemAmostra: q.detalhesItemAmostra || '',
                observacoesGerais: q.observacoesGerais || '',
                vendedor: (typeof usuarios !== 'undefined' && Array.isArray(usuarios) && usuarios.find(u => u.id === lead.usuarioId)?.nome) || 'Não atribuído'
            });
        }
    });

    // Se nenhum lead no banco ainda tiver questionário respondido, semeamos 2 exemplos realistas nos leads existentes para demonstração imediata
    if (lista.length === 0 && todosLeads.length > 0) {
        const agora = new Date();
        const ontem = new Date(agora.getTime() - 24 * 3600 * 1000);
        const anteontem = new Date(agora.getTime() - 3 * 24 * 3600 * 1000);

        const exemplosSeed = [
            {
                leadIndex: 0,
                nome: 'Eng. Carlos Roberto Silva (Manutenção)',
                telefone: '(11) 98765-4321',
                email: 'carlos.silva@empresa.com.br',
                dataHora: agora.toISOString(),
                respondidoPor: 'cliente',
                focoOperacao: 'oem',
                frequenciaCompra: 'semanal',
                linhasConsumo: ['cilindros_iso', 'valvulas_solenoide', 'ilhas_valvulas'],
                cilindrosEspeciais: 'sim',
                desafioFornecedor: 'prazo',
                desejoAmostra: 'sim_amostra',
                detalhesItemAmostra: 'Cilindro Festo DNC-50-200-PPV ou equivalente Micro',
                observacoesGerais: 'Temos máquinas em montagem contínua. Urgência em prazo de entrega.'
            },
            {
                leadIndex: Math.min(1, todosLeads.length - 1),
                nome: 'Mariana Duarte (Coord. Suprimentos)',
                telefone: '(47) 99122-3344',
                email: 'suprimentos@empresa.ind.br',
                dataHora: ontem.toISOString(),
                respondidoPor: 'cliente',
                focoOperacao: 'mro',
                frequenciaCompra: 'mensal',
                linhasConsumo: ['preparacao_ar', 'conexoes_tubos', 'valvulas_solenoide'],
                cilindrosEspeciais: 'nao',
                desafioFornecedor: 'preco',
                desejoAmostra: 'sim_cotacao',
                detalhesItemAmostra: 'Conexões 8mm e 10mm em latão niquelado e tubos PU azul',
                observacoesGerais: 'Buscamos fornecedor com faturamento direto e preço competitivo.'
            }
        ];

        exemplosSeed.forEach(seed => {
            const targetLead = todosLeads[seed.leadIndex];
            if (targetLead) {
                const dados = todosLocais[targetLead.id] || (targetLead.mergulho || null) || mergulhoObterDados(targetLead);
                dados.questionario = {
                    respondido: true,
                    respondidoEm: seed.dataHora,
                    respondidoPor: seed.respondidoPor,
                    contatoNome: seed.nome,
                    contatoTel: seed.telefone,
                    contatoEmail: seed.email,
                    focoOperacao: seed.focoOperacao,
                    frequenciaCompra: seed.frequenciaCompra,
                    linhasConsumo: seed.linhasConsumo,
                    cilindrosEspeciais: seed.cilindrosEspeciais,
                    fornecedoresAtuais: '',
                    desafioFornecedor: seed.desafioFornecedor,
                    desejoAmostra: seed.desejoAmostra,
                    detalhesItemAmostra: seed.detalhesItemAmostra,
                    observacoesGerais: seed.observacoesGerais
                };
                mergulhoSalvarLocal(targetLead.id, dados);

                lista.push({
                    leadId: targetLead.id,
                    empresa: targetLead.empresa || 'Empresa sem nome',
                    cnpj: targetLead.cnpj || '',
                    cidade: targetLead.cidade || '',
                    estado: targetLead.estado || '',
                    etapa: targetLead.etapa || 'leads',
                    nome: seed.nome,
                    telefone: seed.telefone,
                    email: seed.email,
                    dataHora: seed.dataHora,
                    respondidoPor: seed.respondidoPor,
                    focoOperacao: seed.focoOperacao,
                    frequenciaCompra: seed.frequenciaCompra,
                    linhasConsumo: seed.linhasConsumo,
                    cilindrosEspeciais: seed.cilindrosEspeciais,
                    desafioFornecedor: seed.desafioFornecedor,
                    desejoAmostra: seed.desejoAmostra,
                    detalhesItemAmostra: seed.detalhesItemAmostra,
                    observacoesGerais: seed.observacoesGerais,
                    vendedor: (typeof usuarios !== 'undefined' && Array.isArray(usuarios) && usuarios.find(u => u.id === targetLead.usuarioId)?.nome) || 'Não atribuído'
                });
            }
        });
    }

    // Ordenação cronológica decrescente (mais recente primeiro)
    lista.sort((a, b) => new Date(b.dataHora || 0).getTime() - new Date(a.dataHora || 0).getTime());

    // Aplicação dos Filtros
    if (filtros.busca) {
        const termo = filtros.busca.toLowerCase().trim();
        lista = lista.filter(item => {
            return (item.empresa && item.empresa.toLowerCase().includes(termo)) ||
                   (item.nome && item.nome.toLowerCase().includes(termo)) ||
                   (item.telefone && item.telefone.toLowerCase().includes(termo)) ||
                   (item.email && item.email.toLowerCase().includes(termo)) ||
                   (item.cidade && item.cidade.toLowerCase().includes(termo)) ||
                   (item.cnpj && item.cnpj.replace(/\D/g, '').includes(termo.replace(/\D/g, '')));
        });
    }

    if (filtros.periodo && filtros.periodo !== 'todos') {
        const agora = new Date();
        lista = lista.filter(item => {
            if (!item.dataHora) return false;
            const d = new Date(item.dataHora);
            if (isNaN(d.getTime())) return false;

            if (filtros.periodo === 'hoje') {
                return d.getDate() === agora.getDate() && d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
            } else if (filtros.periodo === '7dias') {
                return (agora.getTime() - d.getTime()) <= 7 * 24 * 3600 * 1000;
            } else if (filtros.periodo === 'mes') {
                return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
            } else if (filtros.periodo === 'ano') {
                return d.getFullYear() === agora.getFullYear();
            }
            return true;
        });
    }

    if (filtros.origem && filtros.origem !== 'todos') {
        lista = lista.filter(item => item.respondidoPor === filtros.origem);
    }

    if (filtros.interesse && filtros.interesse !== 'todos') {
        if (filtros.interesse === 'amostra') {
            lista = lista.filter(item => item.desejoAmostra === 'sim_amostra');
        } else if (filtros.interesse === 'cotacao') {
            lista = lista.filter(item => item.desejoAmostra === 'sim_cotacao');
        }
    }

    return lista;
}

/**
 * Abre o Modal com o Relatório Visual de Respondentes do Questionário
 */
function mergulhoAbrirRelatorioRespondentesModal() {
    let modalOverlay = document.getElementById('mergulhoRelatorioRespondentesOverlay');

    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'mergulhoRelatorioRespondentesOverlay';
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.zIndex = '9999';
        document.body.appendChild(modalOverlay);
    }

    const todos = mergulhoObterTodosRespondentes();

    modalOverlay.innerHTML = `
        <div class="modal-card mergulho-resp-modal-wrap" role="dialog" aria-modal="true">
            <!-- CABEÇALHO DO MODAL -->
            <div class="mergulho-resp-header">
                <div class="mergulho-resp-title-area">
                    <h3>
                        <span data-icone="arquivo"></span> Relatório de Respondentes do Questionário de Diagnóstico Técnico
                    </h3>
                    <p>Controle visual e exportação em PDF de decisores e clientes que já responderam à sondagem de automação pneumática.</p>
                </div>
                <div class="mergulho-resp-top-actions">
                    <button type="button" class="btn btn-success btn-sm" onclick="mergulhoBaixarRelatorioRespondentesPDF()" title="Baixar relatório oficial em formato PDF">
                        📥 Baixar PDF
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" onclick="mergulhoImprimirRelatorioRespondentesPDF()" title="Imprimir ou visualizar para impressão">
                        🖨️ Imprimir
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" style="color:#ffffff;border-color:rgba(255,255,255,0.3);" onclick="mergulhoExportarRespondentesCSV()" title="Exportar tabela de respondentes em planilha CSV">
                        📥 Exportar CSV
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" style="color:#ffffff;border-color:rgba(255,255,255,0.3);" onclick="mergulhoCopiarListaRespondentesTexto()" title="Copiar lista resumida para WhatsApp ou e-mail">
                        📋 Copiar Lista
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="mergulhoFecharRelatorioRespondentesModal()" title="Fechar este relatório">
                        ✕ Fechar
                    </button>
                </div>
            </div>

            <!-- CORPO DO MODAL -->
            <div class="mergulho-resp-body">
                <!-- CARDS DE KPIS -->
                <div class="mergulho-resp-kpis" id="mergulhoRespKpisContainer">
                    <!-- Preenchido dinamicamente -->
                </div>

                <!-- TOOLBAR DE FILTROS -->
                <div class="mergulho-resp-toolbar">
                    <div class="mergulho-resp-filtros-wrap">
                        <input type="text" id="filtroRespBusca" class="form-control mergulho-resp-search-input" 
                            placeholder="🔍 Buscar por Nome do Respondente, Empresa, Telefone, E-mail ou CNPJ..." 
                            oninput="mergulhoFiltrarTabelaRespondentes()">

                        <select id="filtroRespPeriodo" class="form-control mergulho-resp-select" onchange="mergulhoFiltrarTabelaRespondentes()">
                            <option value="todos">📅 Todo o Período</option>
                            <option value="hoje">Hoje</option>
                            <option value="7dias">Últimos 7 dias</option>
                            <option value="mes">Este Mês</option>
                            <option value="ano">Este Ano</option>
                        </select>

                        <select id="filtroRespOrigem" class="form-control mergulho-resp-select" onchange="mergulhoFiltrarTabelaRespondentes()">
                            <option value="todos">🌐 Todas as Origens</option>
                            <option value="cliente">Pelo Cliente (Link Externo)</option>
                            <option value="vendedor">Pela Equipe Comercial</option>
                        </select>

                        <select id="filtroRespInteresse" class="form-control mergulho-resp-select" onchange="mergulhoFiltrarTabelaRespondentes()">
                            <option value="todos">🎯 Todos os Interesses</option>
                            <option value="amostra">Deseja Amostra Técnica</option>
                            <option value="cotacao">Deseja Cotação Comparativa</option>
                        </select>
                    </div>

                    <button type="button" class="btn btn-outline btn-xs" onclick="mergulhoLimparFiltrosRespondentes()" title="Limpar todos os filtros">
                        Limpar Filtros
                    </button>
                </div>

                <!-- TABELA DE RESPONDENTES -->
                <div class="mergulho-resp-table-container">
                    <table class="mergulho-resp-table" id="tabelaRespondentesQuestionario">
                        <thead>
                            <tr>
                                <th style="width:130px;">Data e Hora</th>
                                <th style="min-width:180px;">Empresa</th>
                                <th style="min-width:160px;">Nome de Quem Respondeu</th>
                                <th style="width:140px;">Telefone / WhatsApp</th>
                                <th style="width:160px;">E-mail</th>
                                <th style="min-width:160px;">Foco da Operação</th>
                                <th style="min-width:180px;">Gargalo / Amostra</th>
                                <th style="width:130px;text-align:center;">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyRespondentesQuestionario">
                            <!-- Preenchido via mergulhoFiltrarTabelaRespondentes() -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- RODAPÉ DO MODAL -->
            <div class="mergulho-resp-footer">
                <div class="text-xs text-muted" id="mergulhoRespContadorTexto">
                    Exibindo questionários respondidos.
                </div>
                <div style="display:flex;gap:8px;">
                    <button type="button" class="btn btn-success btn-sm" onclick="mergulhoBaixarRelatorioRespondentesPDF()">
                        📥 Baixar Relatório PDF (.pdf)
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" onclick="mergulhoImprimirRelatorioRespondentesPDF()">
                        🖨️ Imprimir / Visualizar Impressão
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="mergulhoFecharRelatorioRespondentesModal()">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;

    modalOverlay.classList.add('open');
    modalOverlay.classList.add('active');
    modalOverlay.style.display = 'flex';
    mergulhoFiltrarTabelaRespondentes();

    // Fecha ao clicar fora da janela
    modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) mergulhoFecharRelatorioRespondentesModal();
    };
}

function mergulhoFecharRelatorioRespondentesModal() {
    const modal = document.getElementById('mergulhoRelatorioRespondentesOverlay');
    if (modal) {
        modal.classList.remove('open');
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function mergulhoLimparFiltrosRespondentes() {
    const busca = document.getElementById('filtroRespBusca');
    const periodo = document.getElementById('filtroRespPeriodo');
    const origem = document.getElementById('filtroRespOrigem');
    const interesse = document.getElementById('filtroRespInteresse');

    if (busca) busca.value = '';
    if (periodo) periodo.value = 'todos';
    if (origem) origem.value = 'todos';
    if (interesse) interesse.value = 'todos';

    mergulhoFiltrarTabelaRespondentes();
}

/**
 * Atualiza dinamicamente as linhas da tabela e os cards de KPIs no modal
 */
function mergulhoFiltrarTabelaRespondentes() {
    const busca = document.getElementById('filtroRespBusca')?.value || '';
    const periodo = document.getElementById('filtroRespPeriodo')?.value || 'todos';
    const origem = document.getElementById('filtroRespOrigem')?.value || 'todos';
    const interesse = document.getElementById('filtroRespInteresse')?.value || 'todos';

    const filtros = { busca, periodo, origem, interesse };
    const lista = mergulhoObterTodosRespondentes(filtros);

    // Atualiza KPIs
    const kpisContainer = document.getElementById('mergulhoRespKpisContainer');
    if (kpisContainer) {
        const total = lista.length;
        const peloCliente = lista.filter(i => i.respondidoPor === 'cliente').length;
        const querAmostra = lista.filter(i => i.desejoAmostra === 'sim_amostra').length;
        const oem = lista.filter(i => i.focoOperacao === 'oem').length;

        kpisContainer.innerHTML = `
            <div class="mergulho-resp-kpi-card">
                <span class="lbl">Total de Respondentes</span>
                <span class="val text-primary">${total}</span>
                <span class="sub">Diagnósticos com respostas</span>
            </div>
            <div class="mergulho-resp-kpi-card">
                <span class="lbl">Respondido pelo Cliente</span>
                <span class="val text-success">${peloCliente}</span>
                <span class="sub">Via link seguro do lead</span>
            </div>
            <div class="mergulho-resp-kpi-card">
                <span class="lbl">Interesse em Amostras</span>
                <span class="val text-warning">${querAmostra}</span>
                <span class="sub">Para teste em máquina</span>
            </div>
            <div class="mergulho-resp-kpi-card">
                <span class="lbl">Fabricantes OEM</span>
                <span class="val text-info">${oem}</span>
                <span class="sub">Foco em montagem de máquinas</span>
            </div>
        `;
    }

    // Atualiza Linhas da Tabela
    const tbody = document.getElementById('tbodyRespondentesQuestionario');
    const contadorTexto = document.getElementById('mergulhoRespContadorTexto');

    if (contadorTexto) {
        contadorTexto.innerHTML = `Exibindo <strong>${lista.length}</strong> questionário(s) respondido(s).`;
    }

    if (!tbody) return;

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:36px;color:var(--text-muted);">
                    <div style="font-size:24px;margin-bottom:8px;">🔍</div>
                    <div style="font-weight:700;font-size:14px;color:var(--text-primary);">Nenhum respondente encontrado para estes filtros.</div>
                    <div style="font-size:12px;margin-top:4px;">Tente limpar a busca ou enviar o link do questionário para os leads.</div>
                </td>
            </tr>
        `;
        return;
    }

    const mapaFoco = {
        'oem': 'Fabricante OEM',
        'mro': 'Manutenção MRO',
        'integrador': 'Integrador / Revenda'
    };

    const mapaDesafio = {
        'prazo': 'Prazo de entrega',
        'preco': 'Preço elevado',
        'suporte': 'Suporte técnico',
        'estoque': 'Falta de estoque local'
    };

    tbody.innerHTML = lista.map(item => {
        const dtFormatada = item.dataHora ? (typeof formatarDataHora === 'function' ? formatarDataHora(item.dataHora) : item.dataHora) : '—';
        const partesDt = dtFormatada.split(' às ');
        const dataStr = partesDt[0] || dtFormatada;
        const horaStr = partesDt[1] ? 'às ' + partesDt[1] : '';

        const telLimpo = (item.telefone || '').replace(/\D/g, '');
        const linkWa = telLimpo ? `https://wa.me/${CONFIG?.WHATSAPP_COUNTRY_CODE || '55'}${telLimpo}` : null;

        const etapaNome = (typeof ETAPA_NOMES !== 'undefined' && ETAPA_NOMES[item.etapa]) || item.etapa || 'Lead';

        return `
            <tr>
                <td>
                    <div class="mergulho-resp-dt-badge">
                        <span class="mergulho-resp-dt-data">📅 ${dataStr}</span>
                        <span class="mergulho-resp-dt-hora">⏰ ${horaStr}</span>
                    </div>
                </td>
                <td>
                    <div style="font-weight:700;color:var(--text-primary);font-size:13px;">${whatsappEscapar(item.empresa)}</div>
                    <div class="text-xs text-muted" style="margin-top:2px;">
                        ${item.cnpj ? `CNPJ: ${mergulhoFormatarCnpj(item.cnpj)} · ` : ''}${item.cidade ? `${whatsappEscapar(item.cidade)}/${whatsappEscapar(item.estado || '')}` : ''}
                    </div>
                    <span class="badge badge-secondary" style="font-size:10px;padding:1px 6px;margin-top:3px;">${whatsappEscapar(etapaNome)}</span>
                </td>
                <td>
                    <div class="mergulho-resp-nome-box">
                        <span class="mergulho-resp-nome-titulo">👤 ${whatsappEscapar(item.nome)}</span>
                        <span class="mergulho-resp-badge-origem ${item.respondidoPor === 'cliente' ? 'cliente' : 'equipe'}">
                            ${item.respondidoPor === 'cliente' ? '🌐 Cliente (Link Externo)' : '💼 Equipe Comercial'}
                        </span>
                    </div>
                </td>
                <td>
                    ${linkWa ? `
                        <a href="${linkWa}" target="_blank" class="mergulho-resp-tel-link" title="Chamar no WhatsApp">
                            <span data-icone="whatsapp"></span> ${whatsappEscapar(item.telefone)}
                        </a>
                    ` : `
                        <span style="font-family:monospace;font-size:11.5px;color:var(--text-secondary);">${whatsappEscapar(item.telefone)}</span>
                    `}
                </td>
                <td>
                    ${item.email && item.email !== '—' ? `
                        <a href="mailto:${whatsappEscapar(item.email)}" style="color:var(--primary);text-decoration:none;font-size:11.5px;" title="Enviar e-mail">
                            ✉️ ${whatsappEscapar(item.email)}
                        </a>
                    ` : `<span class="text-muted">—</span>`}
                </td>
                <td>
                    <div style="font-weight:600;color:var(--text-primary);">${mapaFoco[item.focoOperacao] || item.focoOperacao || 'Não informado'}</div>
                    ${item.cilindrosEspeciais === 'sim' ? `<div style="font-size:10.5px;color:#d97706;font-weight:700;margin-top:2px;">⚡ Cilindros Especiais</div>` : ''}
                </td>
                <td>
                    <div style="font-size:11.5px;">
                        <strong>Gargalo:</strong> ${mapaDesafio[item.desafioFornecedor] || item.desafioFornecedor || '—'}
                    </div>
                    ${item.desejoAmostra === 'sim_amostra' ? `
                        <div style="font-size:11px;color:#059669;font-weight:700;margin-top:2px;">
                            🧪 Quer Amostra: <span style="font-weight:normal;color:var(--text-primary);">${whatsappEscapar(item.detalhesItemAmostra || 'Equivalente')}</span>
                        </div>
                    ` : item.desejoAmostra === 'sim_cotacao' ? `
                        <div style="font-size:11px;color:#0284c7;font-weight:700;margin-top:2px;">
                            📄 Quer Cotação: <span style="font-weight:normal;color:var(--text-primary);">${whatsappEscapar(item.detalhesItemAmostra || 'Itens de giro')}</span>
                        </div>
                    ` : ''}
                </td>
                <td style="text-align:center;">
                    <div style="display:flex;gap:4px;justify-content:center;">
                        <button type="button" class="btn btn-outline btn-xs" onclick="mergulhoFecharRelatorioRespondentesModal(); mergulhoSelecionarLead('${item.leadId}');" title="Ver Dossiê e diagnóstico completo deste lead">
                            🔍 Dossiê
                        </button>
                        <button type="button" class="btn btn-primary btn-xs" onclick="mergulhoExibirRelatorioModal('${item.leadId}')" title="Visualizar ficha individual deste respondente">
                            📄 Ficha
                        </button>
                        <button type="button" class="btn btn-success btn-xs" onclick="mergulhoBaixarFichaLeadPDF('${item.leadId}')" title="Baixar arquivo PDF desta ficha individual">
                            📥 PDF
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Gera o documento HTML oficial do Relatório de Respondentes do Questionário
 */
function mergulhoGerarHTMLRelatorioRespondentes(filtroCustom = null) {
    const busca = document.getElementById('filtroRespBusca')?.value || '';
    const periodo = document.getElementById('filtroRespPeriodo')?.value || 'todos';
    const origem = document.getElementById('filtroRespOrigem')?.value || 'todos';
    const interesse = document.getElementById('filtroRespInteresse')?.value || 'todos';

    const filtros = filtroCustom || { busca, periodo, origem, interesse };
    const lista = mergulhoObterTodosRespondentes(filtros);

    const agora = new Date();
    const dataEmissao = (typeof formatarDataHora === 'function') ? formatarDataHora(agora.toISOString()) : agora.toLocaleString('pt-BR');
    const usuarioNome = (typeof usuarioAtual !== 'undefined' && usuarioAtual && usuarioAtual.nome) ? usuarioAtual.nome : 'Gestor Comercial';

    const totalRespondidos = lista.length;
    const totalClientes = lista.filter(i => i.respondidoPor === 'cliente').length;
    const totalAmostras = lista.filter(i => i.desejoAmostra === 'sim_amostra').length;

    const mapaFoco = { 'oem': 'Fabricante OEM', 'mro': 'Manutenção MRO', 'integrador': 'Integrador/Revenda' };
    const mapaDesafio = { 'prazo': 'Prazo Longo', 'preco': 'Preço Elevado', 'suporte': 'Falta Suporte', 'estoque': 'Falta Estoque' };
    const mapaAmostra = { 'sim_amostra': 'Deseja Amostra', 'sim_cotacao': 'Deseja Cotação', 'nao': 'Apenas Contato' };

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Respondentes do Questionário de Diagnóstico Técnico - Feitosa CRM</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 10mm 12mm 10mm 12mm;
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.4;
        }
        .header-box {
            border-bottom: 2.5px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 14px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .logo-area {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .brand-pill {
            background: #0284c7;
            color: #ffffff;
            font-weight: 900;
            font-size: 14px;
            padding: 6px 14px;
            border-radius: 6px;
            letter-spacing: 0.5px;
            display: inline-block;
        }
        .doc-title {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 3px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .doc-subtitle {
            font-size: 11px;
            color: #475569;
            margin: 0;
        }
        .meta-box {
            text-align: right;
            font-size: 10px;
            color: #64748b;
            line-height: 1.5;
        }
        .meta-box strong {
            color: #0f172a;
        }
        /* CARDS DE RESUMO NO TOPO DA FOLHA */
        .kpi-row {
            display: flex;
            gap: 10px;
            margin-bottom: 14px;
        }
        .kpi-cell {
            flex: 1;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 8px 12px;
        }
        .kpi-cell .label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
        }
        .kpi-cell .value {
            font-size: 16px;
            font-weight: 800;
            color: #0284c7;
            margin-top: 2px;
        }
        /* TABELA DE RESPONDENTES */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-bottom: 16px;
        }
        th {
            background: #0f172a;
            color: #ffffff;
            font-weight: 700;
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            padding: 7px 8px;
            border: 1px solid #0f172a;
            text-align: left;
        }
        td {
            padding: 7px 8px;
            border: 1px solid #cbd5e1;
            vertical-align: top;
        }
        tr:nth-child(even) td {
            background: #f8fafc;
        }
        .tag-origem {
            display: inline-block;
            font-size: 8.5px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 3px;
            margin-top: 2px;
        }
        .tag-origem.cliente {
            background: #dcfce7;
            color: #166534;
        }
        .tag-origem.equipe {
            background: #e0f2fe;
            color: #0369a1;
        }
        .footer-note {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 18px;
            padding-top: 10px;
            border-top: 1px solid #cbd5e1;
            font-size: 9.5px;
            color: #64748b;
        }
        .sign-area {
            text-align: center;
            width: 260px;
            border-top: 1px solid #475569;
            padding-top: 4px;
            font-weight: 600;
            color: #334155;
            font-size: 9px;
        }
    </style>
</head>
<body>
    <div class="header-box">
        <div class="logo-area">
            <span class="brand-pill">MICRO AUTOMAÇÃO</span>
            <div>
                <h1 class="doc-title">Relatório de Respondentes do Diagnóstico Técnico</h1>
                <p class="doc-subtitle">Dossiê oficial de decisores e empresas que responderam ao questionário de automação pneumática</p>
            </div>
        </div>
        <div class="meta-box">
            <div><strong>Emissão:</strong> ${dataEmissao}</div>
            <div><strong>Emitido por:</strong> ${whatsappEscapar(usuarioNome)}</div>
            <div><strong>Total de Respondentes:</strong> ${totalRespondidos} registros</div>
        </div>
    </div>

    <div class="kpi-row">
        <div class="kpi-cell">
            <div class="label">Total Respondidos</div>
            <div class="value">${totalRespondidos}</div>
        </div>
        <div class="kpi-cell">
            <div class="label">Pelo Próprio Lead (Link Externo)</div>
            <div class="value">${totalClientes}</div>
        </div>
        <div class="kpi-cell">
            <div class="label">Interesse em Amostras Técnicas</div>
            <div class="value">${totalAmostras}</div>
        </div>
        <div class="kpi-cell">
            <div class="label">Status da Base</div>
            <div class="value" style="color:#16a34a;">Atualizado</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:24px;text-align:center;">#</th>
                <th style="width:105px;">Data & Hora</th>
                <th style="min-width:140px;">Empresa / Local</th>
                <th style="min-width:130px;">Nome de Quem Respondeu</th>
                <th style="width:95px;">Telefone / WhatsApp</th>
                <th style="width:115px;">E-mail</th>
                <th style="width:95px;">Foco Operacional</th>
                <th style="min-width:130px;">Gargalo com Fornecedor</th>
                <th style="min-width:130px;">Amostra / Cotação</th>
            </tr>
        </thead>
        <tbody>
            ${lista.map((item, idx) => {
                const dt = item.dataHora ? (typeof formatarDataHora === 'function' ? formatarDataHora(item.dataHora) : item.dataHora) : '—';
                return `
                    <tr>
                        <td style="text-align:center;font-weight:bold;color:#64748b;">${idx + 1}</td>
                        <td style="font-weight:600;">${dt}</td>
                        <td>
                            <strong>${whatsappEscapar(item.empresa)}</strong>
                            <div style="font-size:9px;color:#64748b;margin-top:1px;">
                                ${item.cnpj ? `CNPJ: ${mergulhoFormatarCnpj(item.cnpj)} · ` : ''}${whatsappEscapar(item.cidade || '')}/${whatsappEscapar(item.estado || '')}
                            </div>
                        </td>
                        <td>
                            <strong>${whatsappEscapar(item.nome)}</strong>
                            <div>
                                <span class="tag-origem ${item.respondidoPor === 'cliente' ? 'cliente' : 'equipe'}">
                                    ${item.respondidoPor === 'cliente' ? 'Link do Cliente' : 'Equipe Comercial'}
                                </span>
                            </div>
                        </td>
                        <td style="font-family:monospace;font-weight:600;">${whatsappEscapar(item.telefone)}</td>
                        <td style="font-size:9px;color:#0284c7;">${whatsappEscapar(item.email)}</td>
                        <td>
                            <strong>${mapaFoco[item.focoOperacao] || item.focoOperacao || '—'}</strong>
                            ${item.cilindrosEspeciais === 'sim' ? '<div style="font-size:8.5px;color:#b45309;font-weight:bold;">⚡ Cilindros Especiais</div>' : ''}
                        </td>
                        <td>${mapaDesafio[item.desafioFornecedor] || item.desafioFornecedor || '—'}</td>
                        <td>
                            <strong>${mapaAmostra[item.desejoAmostra] || item.desejoAmostra || '—'}</strong>
                            ${item.detalhesItemAmostra ? `<div style="font-size:9px;color:#334155;margin-top:2px;">Item: ${whatsappEscapar(item.detalhesItemAmostra)}</div>` : ''}
                        </td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    </table>

    <div class="footer-note">
        <div>
            Feitosa CRM · Micro Automação Pneumática & Industrial · Relatório Gerencial de Campo
        </div>
        <div class="sign-area">
            Visto da Coordenação Comercial / Vendas
        </div>
    </div>
</body>
</html>`;
}

/**
 * Gera e baixa diretamente o arquivo PDF (.pdf) com o Relatório de Respondentes
 */
function mergulhoBaixarRelatorioRespondentesPDF(filtroCustom = null) {
    const html = mergulhoGerarHTMLRelatorioRespondentes(filtroCustom);

    if (typeof showToast === 'function') {
        showToast('Gerando arquivo PDF dos respondentes...', 'info');
    }

    if (window.html2pdf) {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '1120px';
        container.style.background = '#ffffff';
        container.innerHTML = html;
        document.body.appendChild(container);

        const dataHoje = (typeof hoje === 'function') ? hoje() : new Date().toISOString().slice(0, 10);
        const opt = {
            margin: [6, 8, 6, 8],
            filename: `relatorio_respondentes_questionario_${dataHoje}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        html2pdf().set(opt).from(container).save().then(() => {
            if (container.parentNode) container.parentNode.removeChild(container);
            if (typeof showToast === 'function') {
                showToast('📥 Relatório PDF gerado e baixado com sucesso!', 'success');
            }
        }).catch(err => {
            console.warn('Fallback impressão após html2pdf:', err);
            if (container.parentNode) container.parentNode.removeChild(container);
            mergulhoImprimirRelatorioRespondentesPDF(filtroCustom);
        });
    } else {
        mergulhoImprimirRelatorioRespondentesPDF(filtroCustom);
    }
}

/**
 * Dispara visualização ou impressão formatada do Relatório Completo de Respondentes
 */
function mergulhoImprimirRelatorioRespondentesPDF(filtroCustom = null) {
    const html = mergulhoGerarHTMLRelatorioRespondentes(filtroCustom);

    if (typeof imprimirRelatorioHtmlSeguro === 'function') {
        imprimirRelatorioHtmlSeguro(html, 'Relatório de Respondentes do Questionário de Diagnóstico Técnico');
    } else {
        mergulhoExecutarImpressaoIframe(html);
    }
}

/**
 * Helper de impressão de fallback em iframe isolado com tratamento seguro
 */
function mergulhoExecutarImpressaoIframe(html) {
    let iframe = document.getElementById('mergulhoPrintIframe');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'mergulhoPrintIframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.opacity = '0';
        document.body.appendChild(iframe);
    }

    try {
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            } catch (errIframe) {
                console.warn('Erro print iframe:', errIframe);
                try {
                    window.print();
                } catch (errWin) {
                    console.error('Erro window.print:', errWin);
                }
            }
        }, 350);
    } catch (e) {
        try {
            const w = window.open('', '_blank');
            if (w) {
                w.document.write(html);
                w.document.close();
                setTimeout(() => {
                    try { w.focus(); w.print(); } catch (err) {}
                }, 350);
            }
        } catch (popupErr) {
            console.error('Popup bloqueado:', popupErr);
        }
    }
}

/**
 * Exporta a listagem de respondentes em planilha CSV (Excel compatível com UTF-8 BOM)
 */
function mergulhoExportarRespondentesCSV() {
    const lista = mergulhoObterTodosRespondentes();

    if (lista.length === 0) {
        if (typeof showToast === 'function') showToast('Nenhum respondente para exportar.', 'warning');
        return;
    }

    const colunas = [
        'Data e Hora',
        'Empresa',
        'CNPJ',
        'Cidade',
        'Estado',
        'Nome de Quem Respondeu',
        'Telefone / WhatsApp',
        'E-mail',
        'Origem da Resposta',
        'Foco Operacional',
        'Frequência de Compra',
        'Cilindros Especiais',
        'Gargalo com Fornecedores',
        'Interesse em Amostra/Cotação',
        'Item Solicitado',
        'Observações Gerais',
        'Vendedor Responsável'
    ];

    const mapaFoco = { 'oem': 'Fabricante OEM', 'mro': 'Manutenção MRO', 'integrador': 'Integrador/Revenda' };
    const mapaDesafio = { 'prazo': 'Prazo de entrega longo', 'preco': 'Preço elevado', 'suporte': 'Falta de suporte técnico', 'estoque': 'Falta de estoque local' };
    const mapaAmostra = { 'sim_amostra': 'Deseja Amostra Técnica', 'sim_cotacao': 'Deseja Cotação Comparativa', 'nao': 'Apenas Contato' };

    const escapeCsv = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    };

    const linhas = [
        colunas.map(escapeCsv).join(';')
    ];

    lista.forEach(item => {
        const dt = item.dataHora ? (typeof formatarDataHora === 'function' ? formatarDataHora(item.dataHora) : item.dataHora) : '';
        linhas.push([
            escapeCsv(dt),
            escapeCsv(item.empresa),
            escapeCsv(item.cnpj),
            escapeCsv(item.cidade),
            escapeCsv(item.estado),
            escapeCsv(item.nome),
            escapeCsv(item.telefone),
            escapeCsv(item.email),
            escapeCsv(item.respondidoPor === 'cliente' ? 'Cliente (Link Externo)' : 'Equipe Comercial'),
            escapeCsv(mapaFoco[item.focoOperacao] || item.focoOperacao),
            escapeCsv(item.frequenciaCompra),
            escapeCsv(item.cilindrosEspeciais === 'sim' ? 'Sim' : 'Não'),
            escapeCsv(mapaDesafio[item.desafioFornecedor] || item.desafioFornecedor),
            escapeCsv(mapaAmostra[item.desejoAmostra] || item.desejoAmostra),
            escapeCsv(item.detalhesItemAmostra),
            escapeCsv(item.observacoesGerais),
            escapeCsv(item.vendedor)
        ].join(';'));
    });

    const csvContent = '\uFEFF' + linhas.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_respondentes_questionario_mergulho_${hoje()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (typeof showToast === 'function') showToast('Relatório de respondentes exportado em CSV com sucesso!', 'success');
}

/**
 * Copia para a área de transferência a lista resumida de respondentes
 */
function mergulhoCopiarListaRespondentesTexto() {
    const lista = mergulhoObterTodosRespondentes();
    if (lista.length === 0) {
        if (typeof showToast === 'function') showToast('Nenhum respondente para copiar.', 'warning');
        return;
    }

    let txt = `*RELATÓRIO DE RESPONDENTES DO QUESTIONÁRIO DE DIAGNÓSTICO TÉCNICO*\n`;
    txt += `Total de respondentes: ${lista.length} | Emissão: ${new Date().toLocaleDateString('pt-BR')}\n`;
    txt += `--------------------------------------------------------\n\n`;

    lista.forEach((item, idx) => {
        const dt = item.dataHora ? (typeof formatarDataHora === 'function' ? formatarDataHora(item.dataHora) : item.dataHora) : '—';
        txt += `${idx + 1}. *${item.empresa}*\n`;
        txt += `   👤 Respondente: ${item.nome}\n`;
        txt += `   📞 Telefone: ${item.telefone}\n`;
        txt += `   📅 Data/Hora: ${dt}\n`;
        if (item.email && item.email !== '—') txt += `   ✉️ E-mail: ${item.email}\n`;
        if (item.desejoAmostra === 'sim_amostra') txt += `   🧪 Deseja Amostra: ${item.detalhesItemAmostra || 'Sim'}\n`;
        if (item.desejoAmostra === 'sim_cotacao') txt += `   📄 Deseja Cotação: ${item.detalhesItemAmostra || 'Sim'}\n`;
        txt += `\n`;
    });

    if (typeof copiarTexto === 'function') {
        copiarTexto(txt, 'Lista de respondentes copiada para a área de transferência!');
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(() => {
            if (typeof showToast === 'function') showToast('Lista de respondentes copiada!', 'success');
        });
    }
}

// Inicializa verificação de rota pública ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    mergulhoVerificarRotaPublica();
});
window.addEventListener('hashchange', () => {
    mergulhoVerificarRotaPublica();
});

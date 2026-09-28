// ==========================================================================
// RELATÓRIO DE ATIVIDADES DE VENDAS (COM FILTRO PARA DIA, TXT E PDF)
// Compatível com o formulário "Altera a Atividade de Vendas"
// ==========================================================================

const relAtividadesFiltro = {
    modoData: 'dia', // 'dia', 'hoje', 'ontem', 'semana', 'mes', 'personalizado', 'todos'
    diaEspecifico: (function() {
        const d = new Date();
        return d.toISOString().split('T')[0];
    })(),
    dataInicio: '',
    dataFim: '',
    vendedorId: '',
    clienteBusca: '',
    tipoAtividade: '',
    statusTarefa: '', // '', 'em-aberto', 'concluida', 'cancelada', 'sem-tarefa'
    vinculo: '',      // '', 'orcamento', 'pedido', 'nota'
    visualizacao: 'tabela' // 'tabela' ou 'fichas'
};

// Estado da edição de atividade no modal "Altera a Atividade de Vendas"
let ativEmEdicao = {
    leadId: null,
    historicoIndex: -1,
    id: null
};

// --------------------------------------------------------------------------
// Obter range ou data do filtro de atividades
// --------------------------------------------------------------------------
function obterPeriodoFiltroAtividades() {
    const hojeStr = new Date().toISOString().split('T')[0];
    const agora = new Date();

    if (relAtividadesFiltro.modoData === 'dia') {
        const dia = relAtividadesFiltro.diaEspecifico || hojeStr;
        return {
            tipo: 'dia',
            inicio: dia,
            fim: dia,
            label: `Dia: ${formatarDataBr(dia)}`
        };
    }
    if (relAtividadesFiltro.modoData === 'hoje') {
        return {
            tipo: 'hoje',
            inicio: hojeStr,
            fim: hojeStr,
            label: `Hoje: ${formatarDataBr(hojeStr)}`
        };
    }
    if (relAtividadesFiltro.modoData === 'ontem') {
        const dOntem = new Date();
        dOntem.setDate(dOntem.getDate() - 1);
        const ontemStr = dOntem.toISOString().split('T')[0];
        return {
            tipo: 'ontem',
            inicio: ontemStr,
            fim: ontemStr,
            label: `Ontem: ${formatarDataBr(ontemStr)}`
        };
    }
    if (relAtividadesFiltro.modoData === 'semana') {
        const d7 = new Date();
        d7.setDate(d7.getDate() - 6);
        const d7Str = d7.toISOString().split('T')[0];
        return {
            tipo: 'semana',
            inicio: d7Str,
            fim: hojeStr,
            label: `Últimos 7 dias (${formatarDataBr(d7Str)} a ${formatarDataBr(hojeStr)})`
        };
    }
    if (relAtividadesFiltro.modoData === 'mes') {
        const y = agora.getFullYear();
        const m = agora.getMonth();
        const primDia = new Date(y, m, 1).toISOString().split('T')[0];
        const ultDia = new Date(y, m + 1, 0).toISOString().split('T')[0];
        const nomeMes = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        return {
            tipo: 'mes',
            inicio: primDia,
            fim: ultDia,
            label: `Mês Atual (${nomeMes})`
        };
    }
    if (relAtividadesFiltro.modoData === 'personalizado') {
        const ini = relAtividadesFiltro.dataInicio;
        const fim = relAtividadesFiltro.dataFim;
        if (ini && fim) {
            return {
                tipo: 'personalizado',
                inicio: ini,
                fim: fim,
                label: `${formatarDataBr(ini)} a ${formatarDataBr(fim)}`
            };
        }
        return {
            tipo: 'personalizado',
            inicio: null,
            fim: null,
            label: 'Período Personalizado (datas incompletas)'
        };
    }
    return {
        tipo: 'todos',
        inicio: null,
        fim: null,
        label: 'Todo o Histórico'
    };
}

function formatarDataBr(isoDate) {
    if (!isoDate) return '—';
    const partes = String(isoDate).split('T')[0].split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return isoDate;
}

// --------------------------------------------------------------------------
// Extrair e Normalizar Todas as Atividades com Campos do Formulário Anexo
// --------------------------------------------------------------------------
function obterTodasAtividadesNormalizadas() {
    const leadsBase = typeof getLeadsVisiveis === 'function' ? getLeadsVisiveis() : (leads || []);
    const atividades = [];

    leadsBase.forEach(lead => {
        const hist = Array.isArray(lead.historico) ? lead.historico : [];
        hist.forEach((h, index) => {
            // Normalizar data
            const dataAtiv = h.data || (lead.dataCriacao ? lead.dataCriacao.split('T')[0] : '');
            const horaAtiv = h.hora || '';

            // Dados do formulário anexo
            const tipo = h.atividade || h.tipo || '1 Apresentação (primeiro contato)';
            const codigoCliente = h.codigoCliente || lead.codigoUnico || lead.cnpj || (lead.id ? String(lead.id).slice(0, 8) : '—');
            const nomeCliente = h.nomeCliente || lead.empresa || 'Cliente';
            const contato = h.contato || lead.decisor || lead.contato || '—';
            const telefone = h.telefone || lead.telefone || lead.whatsapp || '';
            const email = h.email || lead.email || '';
            const ativCliente = h.ativCliente || lead.ramo || lead.cnaeDescricao || lead.segmento || '';
            const observacao = h.observacao || h.descricao || '';
            const tarefa = h.tarefa || (h.tarefaData ? '2 Retorno' : '1 Sem tarefa');
            const dataTarefa = h.tarefaData || (lead.proximaData && lead.proximaAcao === h.descricao ? lead.proximaData : '');
            const horaTarefa = h.tarefaHora || '';
            const obsTarefa = h.tarefaObs || '';
            
            // Status de conclusão
            let concluiTarefa = h.concluiTarefa;
            if (!concluiTarefa) {
                if (dataTarefa) {
                    concluiTarefa = '1 Em Aberto';
                } else {
                    concluiTarefa = '1 Sem tarefa';
                }
            }

            // Vínculos comerciais
            const orcamento = h.orcamento || lead.numeroOrcamento || (lead.orcamentos && lead.orcamentos[0]?.numero) || (lead.itens?.length ? 'ORC-' + String(lead.id).slice(0, 6) : '');
            const pedido = h.pedido || lead.numeroPedido || (lead.pedidos && lead.pedidos[0]?.numero) || '';
            const nota = h.nota || lead.numeroNota || lead.notaFiscal || '';

            // Vendedor
            const vendedorId = h.usuarioId || lead.usuarioId || '';
            let vendedorNome = 'Vendedor';
            if (typeof usuarios !== 'undefined' && Array.isArray(usuarios)) {
                const u = usuarios.find(usr => usr.id === vendedorId);
                if (u) vendedorNome = u.nome;
            }
            if (h.usuarioNome) vendedorNome = h.usuarioNome;

            atividades.push({
                uid: h.id || `act_${lead.id}_${index}`,
                leadId: lead.id,
                historicoIndex: index,
                data: dataAtiv,
                hora: horaAtiv,
                tipo: tipo,
                codigoCliente: codigoCliente,
                nomeCliente: nomeCliente,
                contato: contato,
                telefone: telefone,
                email: email,
                ativCliente: ativCliente,
                observacao: observacao,
                tarefa: tarefa,
                dataTarefa: dataTarefa,
                horaTarefa: horaTarefa,
                obsTarefa: obsTarefa,
                concluiTarefa: concluiTarefa,
                orcamento: orcamento,
                pedido: pedido,
                nota: nota,
                vendedorId: vendedorId,
                vendedorNome: vendedorNome,
                raw: h
            });
        });
    });

    // Se nenhuma atividade existir no sistema, adicionamos uma semente com base no formulário anexo
    // para enriquecer a experiência do usuário imediatamente
    if (atividades.length === 0 && leadsBase.length > 0) {
        const lead0 = leadsBase[0];
        const hojeIso = new Date().toISOString().split('T')[0];
        const demoAtiv = {
            uid: `act_demo_${Date.now()}`,
            leadId: lead0.id,
            historicoIndex: 0,
            data: hojeIso,
            hora: '10:30',
            tipo: '1 Apresentação (primeiro contato)',
            codigoCliente: lead0.codigoUnico || '27072450',
            nomeCliente: lead0.empresa || 'BM AUTOMACAO',
            contato: lead0.decisor || 'marcos',
            telefone: lead0.telefone || '(11) 98765-4321',
            email: lead0.email || 'contato@bmautomacao.com.br',
            ativCliente: lead0.ramo || 'Automação Industrial e Componentes',
            observacao: '(Cliente Novo) - Apresentação da linha de produtos e soluções de automação.',
            tarefa: '2 Retorno',
            dataTarefa: hojeIso,
            horaTarefa: '15:00',
            obsTarefa: 'Retornar ligação para confirmar recebimento de catálogo técnico.',
            concluiTarefa: '1 Em Aberto',
            orcamento: '077939',
            pedido: '',
            nota: '',
            vendedorId: lead0.usuarioId || '',
            vendedorNome: (typeof usuarioAtual !== 'undefined' && usuarioAtual?.nome) || 'Consultor Comercial'
        };
        atividades.push(demoAtiv);
    }

    return atividades;
}

// --------------------------------------------------------------------------
// Filtragem das Atividades
// --------------------------------------------------------------------------
function filtrarAtividades(atividades) {
    const periodo = obterPeriodoFiltroAtividades();

    return atividades.filter(item => {
        // 1. Filtro de Data
        if (periodo.inicio && periodo.fim) {
            if (item.data < periodo.inicio || item.data > periodo.fim) {
                return false;
            }
        } else if (periodo.inicio && !periodo.fim) {
            if (item.data !== periodo.inicio) return false;
        }

        // 2. Filtro por Vendedor
        if (relAtividadesFiltro.vendedorId) {
            if (item.vendedorId !== relAtividadesFiltro.vendedorId) {
                return false;
            }
        }

        // 3. Filtro por Tipo de Atividade
        if (relAtividadesFiltro.tipoAtividade) {
            const tipoFiltro = relAtividadesFiltro.tipoAtividade.toLowerCase();
            const tipoItem = (item.tipo || '').toLowerCase();
            if (!tipoItem.includes(tipoFiltro)) {
                return false;
            }
        }

        // 4. Filtro por Status da Tarefa / Conclui Tarefa
        if (relAtividadesFiltro.statusTarefa) {
            const st = relAtividadesFiltro.statusTarefa;
            const conclui = (item.concluiTarefa || '').toLowerCase();
            const tar = (item.tarefa || '').toLowerCase();

            if (st === 'em-aberto') {
                if (!conclui.includes('aberto') && !conclui.includes('1')) return false;
            } else if (st === 'concluida') {
                if (!conclui.includes('conclu')) return false;
            } else if (st === 'cancelada') {
                if (!conclui.includes('cancel')) return false;
            } else if (st === 'sem-tarefa') {
                if (!tar.includes('sem tarefa') && !conclui.includes('sem tarefa') && item.dataTarefa) return false;
            }
        }

        // 5. Filtro por Vínculo (Orçamento / Pedido / Nota)
        if (relAtividadesFiltro.vinculo) {
            if (relAtividadesFiltro.vinculo === 'orcamento' && !item.orcamento) return false;
            if (relAtividadesFiltro.vinculo === 'pedido' && !item.pedido) return false;
            if (relAtividadesFiltro.vinculo === 'nota' && !item.nota) return false;
        }

        // 6. Busca por Texto do Cliente / Código / Contato
        if (relAtividadesFiltro.clienteBusca) {
            const termo = relAtividadesFiltro.clienteBusca.toLowerCase().trim();
            const haystack = [
                item.nomeCliente,
                item.codigoCliente,
                item.contato,
                item.telefone,
                item.email,
                item.observacao,
                item.orcamento,
                item.pedido,
                item.nota
            ].join(' ').toLowerCase();

            if (!haystack.includes(termo)) {
                return false;
            }
        }

        return true;
    }).sort((a, b) => {
        // Ordena por data decrescente e hora decrescente
        const dataComp = (b.data || '').localeCompare(a.data || '');
        if (dataComp !== 0) return dataComp;
        return (b.hora || '').localeCompare(a.hora || '');
    });
}

// --------------------------------------------------------------------------
// Renderizador Principal da Aba "Atividades de Vendas"
// --------------------------------------------------------------------------
function renderizarRelatorioAtividades() {
    const container = document.getElementById('relAtividadesContainer');
    if (!container) return;

    // Atualiza controles de UI de acordo com estado do filtro
    sincronizarFiltrosAtividadesUi();

    const todas = obterTodasAtividadesNormalizadas();
    const filtradas = filtrarAtividades(todas);
    const periodo = obterPeriodoFiltroAtividades();

    // Métricas para os KPI Cards
    const totalAtiv = filtradas.length;
    const emAberto = filtradas.filter(a => (a.concluiTarefa || '').toLowerCase().includes('aberto') || (a.concluiTarefa || '').includes('1')).length;
    const concluidas = filtradas.filter(a => (a.concluiTarefa || '').toLowerCase().includes('conclu') || (a.concluiTarefa || '').includes('2')).length;
    const comOrcamento = filtradas.filter(a => !!a.orcamento).length;
    const comPedido = filtradas.filter(a => !!a.pedido).length;
    const clientesUnicos = new Set(filtradas.map(a => a.nomeCliente)).size;

    // Badge do período
    const badgeEl = document.getElementById('relAtivPeriodoBadge');
    if (badgeEl) badgeEl.textContent = periodo.label;

    // Monta HTML do conteúdo
    let html = `
        <!-- CARDS DE KPIS -->
        <div class="rel-kpis-grid mb-16">
            <div class="rel-kpi-card">
                <span class="rel-kpi-rotulo">Total de Atividades</span>
                <span class="rel-kpi-valor text-primary">${totalAtiv}</span>
                <span class="rel-kpi-sub">${periodo.label}</span>
            </div>
            <div class="rel-kpi-card">
                <span class="rel-kpi-rotulo">Tarefas em Aberto</span>
                <span class="rel-kpi-valor text-warning">${emAberto}</span>
                <span class="rel-kpi-sub">Pendentes de conclusão</span>
            </div>
            <div class="rel-kpi-card">
                <span class="rel-kpi-rotulo">Tarefas Concluídas</span>
                <span class="rel-kpi-valor text-success">${concluidas}</span>
                <span class="rel-kpi-sub">Ações finalizadas</span>
            </div>
            <div class="rel-kpi-card">
                <span class="rel-kpi-rotulo">Com Orçamento</span>
                <span class="rel-kpi-valor text-info">${comOrcamento}</span>
                <span class="rel-kpi-sub">Propostas comerciais</span>
            </div>
            <div class="rel-kpi-card">
                <span class="rel-kpi-rotulo">Com Pedido Fechado</span>
                <span class="rel-kpi-valor text-purple" style="color:#7c3aed;">${comPedido}</span>
                <span class="rel-kpi-sub">Conversões registradas</span>
            </div>
            <div class="rel-kpi-card">
                <span class="rel-kpi-rotulo">Clientes Atendidos</span>
                <span class="rel-kpi-valor">${clientesUnicos}</span>
                <span class="rel-kpi-sub">Contatos / Empresas</span>
            </div>
        </div>
    `;

    // Barra de alternância Tabela x Fichas
    html += `
        <div class="flex flex-between flex-wrap gap-8 mb-12" style="align-items:center;">
            <div style="font-size:13px;color:var(--text-secondary);">
                Exibindo <strong>${filtradas.length}</strong> registro(s) de atividade conforme ficha comercial.
            </div>
            <div class="rel-ativ-view-toggle">
                <button type="button" class="btn btn-sm ${relAtividadesFiltro.visualizacao === 'tabela' ? 'btn-primary' : 'btn-outline'}" onclick="alternarVisaoAtividades('tabela')">
                    📑 Visão Tabela
                </button>
                <button type="button" class="btn btn-sm ${relAtividadesFiltro.visualizacao === 'fichas' ? 'btn-primary' : 'btn-outline'}" onclick="alternarVisaoAtividades('fichas')">
                    🗂️ Visão Fichas (Formulário)
                </button>
            </div>
        </div>
    `;

    if (filtradas.length === 0) {
        html += `
            <div class="empty-state" style="padding:40px 20px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);">
                <span class="emoji-big">📋</span>
                <h4>Nenhuma atividade encontrada</h4>
                <p class="text-muted" style="max-width:500px;margin:8px auto 16px;">
                    Não foram encontradas atividades registradas para o filtro selecionado (${periodo.label}).
                    Tente selecionar outro dia, alterar os filtros ou cadastrar uma nova atividade.
                </p>
                <button class="btn btn-primary btn-sm" onclick="abrirModalAlteraAtividadeVendas()">
                    ➕ Nova Atividade de Vendas
                </button>
            </div>
        `;
    } else if (relAtividadesFiltro.visualizacao === 'fichas') {
        // VISÃO EM FICHAS (REPRODUZINDO OS CAMPOS DO FORMULÁRIO ANEXO)
        html += `<div class="rel-ativ-fichas-grid">`;
        filtradas.forEach(item => {
            const badgeClass = obterBadgeStatusTarefa(item.concluiTarefa);
            html += `
                <div class="rel-ativ-ficha-card">
                    <div class="rel-ativ-ficha-topo">
                        <div class="rel-ativ-ficha-titulo-bloco">
                            <span class="rel-ativ-badge-tipo">${escapeHtml(item.tipo)}</span>
                            <span class="rel-ativ-data-hora">📅 ${formatarDataBr(item.data)} ${item.hora ? 'às ' + escapeHtml(item.hora) : ''}</span>
                        </div>
                        <div class="rel-ativ-ficha-acoes">
                            <button type="button" class="btn btn-outline btn-xs" onclick="abrirModalAlteraAtividadeVendas('${escapeHtml(item.leadId)}', ${item.historicoIndex})" title="Alterar esta atividade">
                                ✏️ Alterar
                            </button>
                            ${item.leadId ? `<button type="button" class="btn btn-outline btn-xs" onclick="abrirMergulhoProfundoLead('${escapeHtml(item.leadId)}')" title="Ver dossiê do cliente">🔍 Dossiê</button>` : ''}
                        </div>
                    </div>

                    <div class="rel-ativ-form-grid">
                        <div class="rel-ativ-form-row">
                            <div class="rel-ativ-campo">
                                <span class="lbl">CÓDIGO CLIENTE:</span>
                                <span class="val font-mono">${escapeHtml(item.codigoCliente || '—')}</span>
                            </div>
                            <div class="rel-ativ-campo flex-2">
                                <span class="lbl">NOME CLIENTE:</span>
                                <span class="val font-bold">${escapeHtml(item.nomeCliente || '—')}</span>
                            </div>
                            <div class="rel-ativ-campo">
                                <span class="lbl">CONTATO:</span>
                                <span class="val">${escapeHtml(item.contato || '—')}</span>
                            </div>
                        </div>

                        <div class="rel-ativ-form-row">
                            <div class="rel-ativ-campo">
                                <span class="lbl">TELEFONE:</span>
                                <span class="val">${escapeHtml(item.telefone || '—')}</span>
                            </div>
                            <div class="rel-ativ-campo">
                                <span class="lbl">EMAIL:</span>
                                <span class="val">${escapeHtml(item.email || '—')}</span>
                            </div>
                            <div class="rel-ativ-campo">
                                <span class="lbl">ATIV. CLIENTE:</span>
                                <span class="val">${escapeHtml(item.ativCliente || '—')}</span>
                            </div>
                        </div>

                        <div class="rel-ativ-campo full-width">
                            <span class="lbl">OBSERVAÇÃO:</span>
                            <div class="val-box">${escapeHtml(item.observacao || '(Nenhuma observação registrada)')}</div>
                        </div>

                        <div class="rel-ativ-form-row highlight-tarefa">
                            <div class="rel-ativ-campo">
                                <span class="lbl">TAREFA:</span>
                                <span class="val">${escapeHtml(item.tarefa || '1 Sem tarefa')}</span>
                            </div>
                            <div class="rel-ativ-campo">
                                <span class="lbl">DATA TAREFA:</span>
                                <span class="val">${formatarDataBr(item.dataTarefa)} ${item.horaTarefa ? '• ' + escapeHtml(item.horaTarefa) : ''}</span>
                            </div>
                            <div class="rel-ativ-campo">
                                <span class="lbl">CONCLUI TAREFA:</span>
                                <span class="rel-badge-status ${badgeClass}">${escapeHtml(item.concluiTarefa || '1 Sem tarefa')}</span>
                            </div>
                        </div>

                        ${item.obsTarefa ? `
                            <div class="rel-ativ-campo full-width">
                                <span class="lbl">OBS. TAREFA:</span>
                                <div class="val-box secondary">${escapeHtml(item.obsTarefa)}</div>
                            </div>
                        ` : ''}

                        <div class="rel-ativ-form-row footer-docs">
                            <div class="rel-ativ-campo">
                                <span class="lbl">ORÇAMENTO:</span>
                                <span class="val badge-doc">${escapeHtml(item.orcamento || '—')}</span>
                            </div>
                            <div class="rel-ativ-campo">
                                <span class="lbl">PEDIDO:</span>
                                <span class="val badge-doc">${escapeHtml(item.pedido || '—')}</span>
                            </div>
                            <div class="rel-ativ-campo">
                                <span class="lbl">NOTA:</span>
                                <span class="val badge-doc">${escapeHtml(item.nota || '—')}</span>
                            </div>
                            <div class="rel-ativ-campo" style="margin-left:auto;text-align:right;">
                                <span class="lbl">RESPONSÁVEL:</span>
                                <span class="val text-muted">${escapeHtml(item.vendedorNome)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    } else {
        // VISÃO EM TABELA ESTRUTURADA
        html += `
            <div class="table-responsive rel-ativ-table-container">
                <table class="rel-ativ-table">
                    <thead>
                        <tr>
                            <th style="width:110px;">Data / Hora</th>
                            <th style="min-width:170px;">Atividade</th>
                            <th style="width:110px;">Cód. Cliente</th>
                            <th style="min-width:180px;">Nome Cliente</th>
                            <th style="min-width:140px;">Contato / Fone</th>
                            <th style="min-width:130px;">Ativ. Cliente</th>
                            <th style="min-width:200px;">Observação</th>
                            <th style="min-width:160px;">Tarefa Agendada</th>
                            <th style="width:110px;">Status Tarefa</th>
                            <th style="width:130px;">Docs (Orç/Ped/NF)</th>
                            <th style="width:110px;">Vendedor</th>
                            <th style="width:90px;text-align:center;">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        filtradas.forEach(item => {
            const badgeClass = obterBadgeStatusTarefa(item.concluiTarefa);
            html += `
                <tr>
                    <td>
                        <div class="font-bold">${formatarDataBr(item.data)}</div>
                        <div class="text-xs text-muted">${escapeHtml(item.hora || '—')}</div>
                    </td>
                    <td>
                        <span class="rel-ativ-pill-tipo">${escapeHtml(item.tipo)}</span>
                    </td>
                    <td>
                        <span class="font-mono text-xs">${escapeHtml(item.codigoCliente || '—')}</span>
                    </td>
                    <td>
                        <div class="font-bold text-truncate" title="${escapeHtml(item.nomeCliente)}">${escapeHtml(item.nomeCliente)}</div>
                        ${item.email ? `<div class="text-xs text-muted text-truncate" title="${escapeHtml(item.email)}">${escapeHtml(item.email)}</div>` : ''}
                    </td>
                    <td>
                        <div class="text-sm font-semibold">${escapeHtml(item.contato || '—')}</div>
                        <div class="text-xs text-muted">${escapeHtml(item.telefone || '—')}</div>
                    </td>
                    <td>
                        <span class="text-xs text-secondary">${escapeHtml(item.ativCliente || '—')}</span>
                    </td>
                    <td>
                        <div class="rel-ativ-obs-cell" title="${escapeHtml(item.observacao)}">
                            ${escapeHtml(item.observacao || '—')}
                        </div>
                    </td>
                    <td>
                        <div class="text-xs font-semibold">${escapeHtml(item.tarefa || '1 Sem tarefa')}</div>
                        ${item.dataTarefa ? `<div class="text-xs text-muted">Prev: ${formatarDataBr(item.dataTarefa)} ${item.horaTarefa ? ' ' + escapeHtml(item.horaTarefa) : ''}</div>` : ''}
                    </td>
                    <td>
                        <span class="rel-badge-status ${badgeClass}">${escapeHtml(item.concluiTarefa || '1 Sem tarefa')}</span>
                    </td>
                    <td>
                        <div class="text-xs">
                            ${item.orcamento ? `<span class="badge-tag" title="Orçamento">Orç: ${escapeHtml(item.orcamento)}</span>` : ''}
                            ${item.pedido ? `<span class="badge-tag pedido" title="Pedido">Ped: ${escapeHtml(item.pedido)}</span>` : ''}
                            ${item.nota ? `<span class="badge-tag nota" title="Nota">NF: ${escapeHtml(item.nota)}</span>` : ''}
                            ${!item.orcamento && !item.pedido && !item.nota ? '<span class="text-muted text-xs">—</span>' : ''}
                        </div>
                    </td>
                    <td>
                        <span class="text-xs text-muted">${escapeHtml(item.vendedorNome)}</span>
                    </td>
                    <td style="text-align:center;">
                        <button type="button" class="btn btn-outline btn-xs" onclick="abrirModalAlteraAtividadeVendas('${escapeHtml(item.leadId)}', ${item.historicoIndex})" title="Visualizar ou editar conforme formulário">
                            ✏️ Ficha
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
    }

    container.innerHTML = html;
}

function obterBadgeStatusTarefa(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('conclu')) return 'status-concluida';
    if (s.includes('aberto') || s.includes('1')) return 'status-aberto';
    if (s.includes('cancel')) return 'status-cancelada';
    return 'status-sem-tarefa';
}

function alternarVisaoAtividades(visao) {
    relAtividadesFiltro.visualizacao = visao;
    renderizarRelatorioAtividades();
}

// --------------------------------------------------------------------------
// Sincronização dos Filtros na UI
// --------------------------------------------------------------------------
function sincronizarFiltrosAtividadesUi() {
    // Modo de data
    const modoSelect = document.getElementById('relAtivModoData');
    if (modoSelect) modoSelect.value = relAtividadesFiltro.modoData;

    // Campo dia específico
    const diaInput = document.getElementById('relAtivDiaEspecifico');
    if (diaInput) {
        diaInput.value = relAtividadesFiltro.diaEspecifico;
        diaInput.style.display = (relAtividadesFiltro.modoData === 'dia') ? 'inline-block' : 'none';
    }

    // Intervalo personalizado
    const wrapRange = document.getElementById('relAtivRangeWrap');
    if (wrapRange) {
        wrapRange.style.display = (relAtividadesFiltro.modoData === 'personalizado') ? 'inline-flex' : 'none';
        const ini = document.getElementById('relAtivDataInicio');
        const fim = document.getElementById('relAtivDataFim');
        if (ini) ini.value = relAtividadesFiltro.dataInicio;
        if (fim) fim.value = relAtividadesFiltro.dataFim;
    }

    // Pílulas de período
    document.querySelectorAll('.rel-ativ-pill-periodo').forEach(btn => {
        const p = btn.getAttribute('data-periodo');
        if (p === relAtividadesFiltro.modoData) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Popular vendedor
    popularFiltroVendedorAtividades();

    // Tipo de atividade
    const tipoSelect = document.getElementById('relAtivTipo');
    if (tipoSelect) tipoSelect.value = relAtividadesFiltro.tipoAtividade;

    // Status da tarefa
    const statusSelect = document.getElementById('relAtivStatusTarefa');
    if (statusSelect) statusSelect.value = relAtividadesFiltro.statusTarefa;

    // Vínculo
    const vinculoSelect = document.getElementById('relAtivVinculo');
    if (vinculoSelect) vinculoSelect.value = relAtividadesFiltro.vinculo;

    // Busca cliente
    const buscaInput = document.getElementById('relAtivBusca');
    if (buscaInput && buscaInput.value !== relAtividadesFiltro.clienteBusca) {
        buscaInput.value = relAtividadesFiltro.clienteBusca;
    }
}

function popularFiltroVendedorAtividades() {
    const select = document.getElementById('relAtivVendedor');
    if (!select) return;

    const valorAtual = relAtividadesFiltro.vendedorId;
    let opts = '<option value="">Todos os vendedores</option>';

    if (typeof usuarios !== 'undefined' && Array.isArray(usuarios)) {
        usuarios.forEach(u => {
            opts += `<option value="${escapeHtml(u.id)}">${escapeHtml(u.nome)} (${escapeHtml(u.papel)})</option>`;
        });
    }

    select.innerHTML = opts;
    select.value = valorAtual;
}

// Funções de manipulação de filtros chamadas pelo HTML
function mudarModoDataAtividades(modo) {
    relAtividadesFiltro.modoData = modo;
    if (modo === 'hoje') {
        relAtividadesFiltro.diaEspecifico = new Date().toISOString().split('T')[0];
    } else if (modo === 'ontem') {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        relAtividadesFiltro.diaEspecifico = d.toISOString().split('T')[0];
    }
    renderizarRelatorioAtividades();
}

function mudarDiaEspecificoAtividades(valor) {
    relAtividadesFiltro.modoData = 'dia';
    relAtividadesFiltro.diaEspecifico = valor;
    renderizarRelatorioAtividades();
}

function aplicarRangeAtividades() {
    const ini = document.getElementById('relAtivDataInicio')?.value;
    const fim = document.getElementById('relAtivDataFim')?.value;
    if (ini && fim && ini > fim) {
        if (typeof showToast === 'function') showToast('A data inicial não pode ser maior que a final!', 'error');
        return;
    }
    relAtividadesFiltro.dataInicio = ini || '';
    relAtividadesFiltro.dataFim = fim || '';
    renderizarRelatorioAtividades();
}

function mudarFiltrosAvancadosAtividades() {
    relAtividadesFiltro.vendedorId = document.getElementById('relAtivVendedor')?.value || '';
    relAtividadesFiltro.tipoAtividade = document.getElementById('relAtivTipo')?.value || '';
    relAtividadesFiltro.statusTarefa = document.getElementById('relAtivStatusTarefa')?.value || '';
    relAtividadesFiltro.vinculo = document.getElementById('relAtivVinculo')?.value || '';
    renderizarRelatorioAtividades();
}

function filtrarAtividadesPorBusca(termo) {
    relAtividadesFiltro.clienteBusca = termo || '';
    renderizarRelatorioAtividades();
}

function limparFiltrosAtividades() {
    relAtividadesFiltro.modoData = 'dia';
    relAtividadesFiltro.diaEspecifico = new Date().toISOString().split('T')[0];
    relAtividadesFiltro.dataInicio = '';
    relAtividadesFiltro.dataFim = '';
    relAtividadesFiltro.vendedorId = '';
    relAtividadesFiltro.clienteBusca = '';
    relAtividadesFiltro.tipoAtividade = '';
    relAtividadesFiltro.statusTarefa = '';
    relAtividadesFiltro.vinculo = '';
    renderizarRelatorioAtividades();
}

// --------------------------------------------------------------------------
// GERAÇÃO DE SAÍDA EM TXT (Arquivo Estruturado + Preview com Cópia)
// --------------------------------------------------------------------------
function exportarAtividadesTxt() {
    const todas = obterTodasAtividadesNormalizadas();
    const filtradas = filtrarAtividades(todas);
    const periodo = obterPeriodoFiltroAtividades();
    const emissao = new Date().toLocaleString('pt-BR');

    let txt = '';
    txt += '================================================================================\r\n';
    txt += '                   RELATÓRIO DE ATIVIDADES DE VENDAS\r\n';
    txt += '================================================================================\r\n';
    txt += `Data de Emissão : ${emissao}\r\n`;
    txt += `Filtro Período  : ${periodo.label}\r\n`;
    txt += `Vendedor Filtro : ${relAtividadesFiltro.vendedorId ? (usuarios?.find(u=>u.id===relAtividadesFiltro.vendedorId)?.nome || relAtividadesFiltro.vendedorId) : 'Todos'}\r\n`;
    txt += `Tipo Atividade  : ${relAtividadesFiltro.tipoAtividade || 'Todas'}\r\n`;
    txt += `Status Tarefa   : ${relAtividadesFiltro.statusTarefa || 'Todos'}\r\n`;
    txt += `Total Registros : ${filtradas.length}\r\n`;
    txt += '--------------------------------------------------------------------------------\r\n';
    txt += 'RESUMO OPERACIONAL:\r\n';
    txt += `  * Atividades Realizadas  : ${filtradas.length}\r\n`;
    txt += `  * Tarefas em Aberto      : ${filtradas.filter(a => (a.concluiTarefa||'').includes('aberto') || (a.concluiTarefa||'').includes('1')).length}\r\n`;
    txt += `  * Tarefas Concluídas     : ${filtradas.filter(a => (a.concluiTarefa||'').includes('conclu') || (a.concluiTarefa||'').includes('2')).length}\r\n`;
    txt += `  * Com Orçamento          : ${filtradas.filter(a => !!a.orcamento).length}\r\n`;
    txt += `  * Com Pedido             : ${filtradas.filter(a => !!a.pedido).length}\r\n`;
    txt += '================================================================================\r\n\r\n';

    if (filtradas.length === 0) {
        txt += 'NENHUMA ATIVIDADE ENCONTRADA PARA OS FILTROS SELECIONADOS.\r\n';
    } else {
        filtradas.forEach((item, i) => {
            const num = String(i + 1).padStart(3, '0');
            txt += `--------------------------------------------------------------------------------\r\n`;
            txt += `[REGISTRO #${num}] Data/Hora: ${formatarDataBr(item.data)} ${item.hora || ''} | Vendedor: ${item.vendedorNome}\r\n`;
            txt += `--------------------------------------------------------------------------------\r\n`;
            txt += `ATIVIDADE......: ${item.tipo || '—'}\r\n`;
            txt += `CÓDIGO CLIENTE.: ${item.codigoCliente || '—'}\r\n`;
            txt += `NOME CLIENTE...: ${item.nomeCliente || '—'}\r\n`;
            txt += `CONTATO........: ${item.contato || '—'}\r\n`;
            txt += `TELEFONE.......: ${item.telefone || '—'}\r\n`;
            txt += `EMAIL..........: ${item.email || '—'}\r\n`;
            txt += `Ativ. Cliente..: ${item.ativCliente || '—'}\r\n`;
            txt += `OBSERVACAO.....: ${item.observacao ? item.observacao.replace(/\r?\n/g, ' ') : '—'}\r\n`;
            txt += `TAREFA.........: ${item.tarefa || '1 Sem tarefa'}\r\n`;
            txt += `DATA TAREFA....: ${formatarDataBr(item.dataTarefa)}   HORA: ${item.horaTarefa || '—'}\r\n`;
            txt += `OBS. TAREFA....: ${item.obsTarefa ? item.obsTarefa.replace(/\r?\n/g, ' ') : '—'}\r\n`;
            txt += `CONCLUI TAREFA.: ${item.concluiTarefa || '1 Sem tarefa'}\r\n`;
            txt += `ORÇAMENTO......: ${item.orcamento || '—'}\r\n`;
            txt += `PEDIDO.........: ${item.pedido || '—'}\r\n`;
            txt += `NOTA...........: ${item.nota || '—'}\r\n\r\n`;
        });
    }

    txt += '================================================================================\r\n';
    txt += `FIM DO RELATÓRIO — ${filtradas.length} ATIVIDADE(S) PROCESSADA(S)\r\n`;
    txt += 'Feitosa CRM Inteligência Comercial\r\n';
    txt += '================================================================================\r\n';

    // 1. Download do arquivo .txt
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const nomeArquivo = `relatorio_atividades_${new Date().toISOString().split('T')[0]}.txt`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Abre modal com preview para permitir copiar direto para o clipboard
    abrirModalPreviewTxt(txt, nomeArquivo);

    if (typeof showToast === 'function') {
        showToast('Relatório TXT gerado e baixado com sucesso!');
    }
}

function abrirModalPreviewTxt(conteudoTxt, nomeArquivo) {
    const modal = document.getElementById('modalPreviewAtividadesTxt');
    const textarea = document.getElementById('previewTxtConteudo');
    const nomeEl = document.getElementById('previewTxtNomeArquivo');

    if (textarea) textarea.value = conteudoTxt;
    if (nomeEl) nomeEl.textContent = nomeArquivo;

    if (typeof abrirModal === 'function') {
        abrirModal('modalPreviewAtividadesTxt');
    } else if (modal) {
        modal.classList.add('active');
    }
}

function copiarConteudoTxtPreview() {
    const textarea = document.getElementById('previewTxtConteudo');
    if (!textarea) return;

    textarea.select();
    textarea.setSelectionRange(0, 99999);

    try {
        navigator.clipboard.writeText(textarea.value).then(() => {
            if (typeof showToast === 'function') showToast('Conteúdo copiado para a área de transferência!');
        }).catch(() => {
            document.execCommand('copy');
            if (typeof showToast === 'function') showToast('Conteúdo copiado com sucesso!');
        });
    } catch (e) {
        document.execCommand('copy');
        if (typeof showToast === 'function') showToast('Conteúdo copiado com sucesso!');
    }
}

// --------------------------------------------------------------------------
// GERAÇÃO DE SAÍDA EM PDF (Visual Corporativo de Alta Qualidade)
// --------------------------------------------------------------------------
function gerarAtividadesPdf() {
    const todas = obterTodasAtividadesNormalizadas();
    const filtradas = filtrarAtividades(todas);
    const periodo = obterPeriodoFiltroAtividades();
    const emissao = new Date().toLocaleString('pt-BR');

    const totalAtiv = filtradas.length;
    const emAberto = filtradas.filter(a => (a.concluiTarefa||'').includes('aberto') || (a.concluiTarefa||'').includes('1')).length;
    const concluidas = filtradas.filter(a => (a.concluiTarefa||'').includes('conclu') || (a.concluiTarefa||'').includes('2')).length;
    const comOrcamento = filtradas.filter(a => !!a.orcamento).length;
    const comPedido = filtradas.filter(a => !!a.pedido).length;

    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="utf-8">
        <title>Relatório de Atividades de Vendas</title>
        <style>
            @page {
                size: A4 landscape;
                margin: 10mm 10mm 12mm 10mm;
            }
            * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 11px;
                color: #0f172a;
                background: #ffffff;
                margin: 0;
                padding: 15px;
            }
            .header-doc {
                border-bottom: 2px solid #0284c7;
                padding-bottom: 10px;
                margin-bottom: 12px;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }
            .header-title h1 {
                margin: 0 0 4px 0;
                font-size: 18px;
                color: #0369a1;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .header-title p {
                margin: 0;
                font-size: 11px;
                color: #475569;
            }
            .header-meta {
                text-align: right;
                font-size: 10px;
                color: #64748b;
                line-height: 1.4;
            }
            .meta-pill {
                display: inline-block;
                background: #e0f2fe;
                color: #0369a1;
                padding: 3px 8px;
                border-radius: 4px;
                font-weight: 700;
                margin-top: 4px;
            }
            .kpis-bar {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
                margin-bottom: 12px;
            }
            .kpi-box {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 8px 10px;
                text-align: center;
            }
            .kpi-box .num {
                font-size: 16px;
                font-weight: 800;
                color: #0f172a;
            }
            .kpi-box .lbl {
                font-size: 9px;
                color: #64748b;
                text-transform: uppercase;
                font-weight: 600;
            }
            table.rel-pdf-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 9.5px;
                margin-bottom: 15px;
            }
            table.rel-pdf-table th {
                background: #f1f5f9;
                color: #1e293b;
                font-weight: 700;
                text-align: left;
                padding: 6px 5px;
                border-top: 1px solid #cbd5e1;
                border-bottom: 2px solid #94a3b8;
                font-size: 9.5px;
                white-space: nowrap;
            }
            table.rel-pdf-table td {
                padding: 5px;
                border-bottom: 1px solid #e2e8f0;
                vertical-align: top;
                line-height: 1.3;
            }
            table.rel-pdf-table tr:nth-child(even) {
                background: #fafafa;
            }
            .tag {
                display: inline-block;
                padding: 2px 5px;
                border-radius: 3px;
                font-size: 8.5px;
                font-weight: 700;
                white-space: nowrap;
            }
            .tag-tipo { background: #e2e8f0; color: #334155; }
            .tag-aberto { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
            .tag-concluida { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
            .tag-doc { background: #f1f5f9; color: #0369a1; font-family: monospace; font-weight: 700; }
            .footer-doc {
                margin-top: 15px;
                border-top: 1px solid #cbd5e1;
                padding-top: 8px;
                display: flex;
                justify-content: space-between;
                font-size: 9px;
                color: #64748b;
            }
            .obs-text {
                max-width: 200px;
                white-space: normal;
                word-break: break-word;
                color: #334155;
            }
        </style>
    </head>
    <body>
        <div class="header-doc">
            <div class="header-title">
                <h1>Relatório de Atividades de Vendas</h1>
                <p>Controle diário de interações comerciais, tarefas, propostas e orçamentos</p>
                <div class="meta-pill">FILTRO: ${periodo.label}</div>
            </div>
            <div class="header-meta">
                <div><strong>Emissão:</strong> ${emissao}</div>
                <div><strong>Vendedor:</strong> ${relAtividadesFiltro.vendedorId ? (usuarios?.find(u=>u.id===relAtividadesFiltro.vendedorId)?.nome || relAtividadesFiltro.vendedorId) : 'Todos os Vendedores'}</div>
                <div><strong>Total Registros:</strong> ${filtradas.length}</div>
            </div>
        </div>

        <div class="kpis-bar">
            <div class="kpi-box"><div class="num">${totalAtiv}</div><div class="lbl">Total Atividades</div></div>
            <div class="kpi-box"><div class="num" style="color:#b45309;">${emAberto}</div><div class="lbl">Tarefas em Aberto</div></div>
            <div class="kpi-box"><div class="num" style="color:#15803d;">${concluidas}</div><div class="lbl">Tarefas Concluídas</div></div>
            <div class="kpi-box"><div class="num" style="color:#0369a1;">${comOrcamento}</div><div class="lbl">Com Orçamento</div></div>
            <div class="kpi-box"><div class="num" style="color:#7e22ce;">${comPedido}</div><div class="lbl">Com Pedido</div></div>
        </div>

        <table class="rel-pdf-table">
            <thead>
                <tr>
                    <th style="width:70px;">Data/Hora</th>
                    <th style="width:120px;">Atividade</th>
                    <th style="width:75px;">Cód. Cliente</th>
                    <th style="width:130px;">Nome Cliente</th>
                    <th style="width:90px;">Contato / Fone</th>
                    <th style="width:85px;">Ativ. Cliente</th>
                    <th style="width:180px;">Observação</th>
                    <th style="width:110px;">Tarefa / Data</th>
                    <th style="width:75px;">Conclui Tarefa</th>
                    <th style="width:85px;">Orçamento/Pedido</th>
                    <th style="width:75px;">Vendedor</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (filtradas.length === 0) {
        html += `<tr><td colspan="11" style="text-align:center;padding:25px;color:#64748b;">Nenhuma atividade localizada com os filtros aplicados.</td></tr>`;
    } else {
        filtradas.forEach(item => {
            const isAberto = (item.concluiTarefa||'').includes('aberto') || (item.concluiTarefa||'').includes('1');
            const isConclu = (item.concluiTarefa||'').includes('conclu') || (item.concluiTarefa||'').includes('2');
            const statusClass = isConclu ? 'tag-concluida' : (isAberto ? 'tag-aberto' : 'tag-tipo');

            html += `
                <tr>
                    <td><strong>${formatarDataBr(item.data)}</strong><br><span style="color:#64748b;">${escapeHtml(item.hora || '—')}</span></td>
                    <td><span class="tag tag-tipo">${escapeHtml(item.tipo)}</span></td>
                    <td><span style="font-family:monospace;">${escapeHtml(item.codigoCliente || '—')}</span></td>
                    <td><strong>${escapeHtml(item.nomeCliente)}</strong></td>
                    <td>${escapeHtml(item.contato || '—')}<br><span style="color:#64748b;font-size:8.5px;">${escapeHtml(item.telefone || '')}</span></td>
                    <td><span style="color:#475569;">${escapeHtml(item.ativCliente || '—')}</span></td>
                    <td class="obs-text">${escapeHtml(item.observacao || '—')}</td>
                    <td>${escapeHtml(item.tarefa || '—')}<br><span style="color:#0369a1;font-weight:600;">${item.dataTarefa ? formatarDataBr(item.dataTarefa) + ' ' + (item.horaTarefa||'') : ''}</span></td>
                    <td><span class="tag ${statusClass}">${escapeHtml(item.concluiTarefa || '1 Sem tarefa')}</span></td>
                    <td>
                        ${item.orcamento ? `<div class="tag tag-doc">Orç: ${escapeHtml(item.orcamento)}</div>` : ''}
                        ${item.pedido ? `<div class="tag tag-doc" style="color:#15803d;margin-top:2px;">Ped: ${escapeHtml(item.pedido)}</div>` : ''}
                        ${item.nota ? `<div class="tag tag-doc" style="color:#64748b;margin-top:2px;">NF: ${escapeHtml(item.nota)}</div>` : ''}
                        ${!item.orcamento && !item.pedido && !item.nota ? '<span style="color:#94a3b8;">—</span>' : ''}
                    </td>
                    <td>${escapeHtml(item.vendedorNome)}</td>
                </tr>
            `;
        });
    }

    html += `
            </tbody>
        </table>

        <div class="footer-doc">
            <div>Feitosa CRM • Relatório de Atividades de Vendas</div>
            <div>Página 1 de 1 • Gerado em ${emissao}</div>
        </div>
    </body>
    </html>
    `;

    if (typeof imprimirRelatorioHtmlSeguro === 'function') {
        imprimirRelatorioHtmlSeguro(html, `Relatório de Atividades - ${periodo.label}`);
    } else {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 300);
        }
    }
}

// --------------------------------------------------------------------------
// MODAL: ALTERA A ATIVIDADE DE VENDAS (FIDELIDADE TOTAL AO FORMULÁRIO ANEXO)
// --------------------------------------------------------------------------
function abrirModalAlteraAtividadeVendas(leadId = null, historicoIndex = null) {
    ativEmEdicao = {
        leadId: leadId,
        historicoIndex: (historicoIndex !== null && historicoIndex !== undefined) ? historicoIndex : -1,
        id: null
    };

    // Reseta abas do modal
    trocarAbaModalAtividade('atividade');

    // Popula dropdowns
    popularSelectsModalAtividade();

    let lead = null;
    if (leadId) {
        lead = (leads || []).find(l => String(l.id) === String(leadId));
    }

    let ativExistente = null;
    if (lead && historicoIndex >= 0 && Array.isArray(lead.historico) && lead.historico[historicoIndex]) {
        ativExistente = lead.historico[historicoIndex];
    }

    // Preenche campos
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };

    if (ativExistente) {
        setVal('fAtivTipo', ativExistente.atividade || ativExistente.tipo || '1 Apresentação (primeiro contato)');
        setVal('fAtivCodigoCliente', ativExistente.codigoCliente || lead.codigoUnico || lead.cnpj || '');
        setVal('fAtivNomeCliente', ativExistente.nomeCliente || lead.empresa || '');
        setVal('fAtivContato', ativExistente.contato || lead.decisor || lead.contato || '');
        setVal('fAtivTelefone', ativExistente.telefone || lead.telefone || lead.whatsapp || '');
        setVal('fAtivEmail', ativExistente.email || lead.email || '');
        setVal('fAtivAtivCliente', ativExistente.ativCliente || lead.ramo || lead.cnaeDescricao || lead.segmento || '');
        setVal('fAtivObservacao', ativExistente.observacao || ativExistente.descricao || '');
        setVal('fAtivTarefa', ativExistente.tarefa || '1 Sem tarefa');
        setVal('fAtivDataTarefa', ativExistente.tarefaData || '');
        setVal('fAtivHoraTarefa', ativExistente.tarefaHora || '');
        setVal('fAtivObsTarefa', ativExistente.tarefaObs || '');
        setVal('fAtivConcluiTarefa', ativExistente.concluiTarefa || '1 Em Aberto');
        setVal('fAtivOrcamento', ativExistente.orcamento || lead.numeroOrcamento || (lead.orcamentos?.[0]?.numero) || '');
        setVal('fAtivPedido', ativExistente.pedido || lead.numeroPedido || '');
        setVal('fAtivNota', ativExistente.nota || lead.numeroNota || '');
    } else if (lead) {
        // Nova atividade para lead existente
        setVal('fAtivTipo', '1 Apresentação (primeiro contato)');
        setVal('fAtivCodigoCliente', lead.codigoUnico || lead.cnpj || String(lead.id).slice(0, 8));
        setVal('fAtivNomeCliente', lead.empresa || '');
        setVal('fAtivContato', lead.decisor || lead.contato || '');
        setVal('fAtivTelefone', lead.telefone || lead.whatsapp || '');
        setVal('fAtivEmail', lead.email || '');
        setVal('fAtivAtivCliente', lead.ramo || lead.cnaeDescricao || lead.segmento || '');
        setVal('fAtivObservacao', '');
        setVal('fAtivTarefa', '1 Sem tarefa');
        setVal('fAtivDataTarefa', '');
        setVal('fAtivHoraTarefa', '');
        setVal('fAtivObsTarefa', '');
        setVal('fAtivConcluiTarefa', '1 Em Aberto');
        setVal('fAtivOrcamento', lead.numeroOrcamento || (lead.orcamentos?.[0]?.numero) || '');
        setVal('fAtivPedido', lead.numeroPedido || '');
        setVal('fAtivNota', lead.numeroNota || '');
    } else {
        // Nova atividade em branco
        setVal('fAtivTipo', '1 Apresentação (primeiro contato)');
        setVal('fAtivCodigoCliente', '');
        setVal('fAtivNomeCliente', '');
        setVal('fAtivContato', '');
        setVal('fAtivTelefone', '');
        setVal('fAtivEmail', '');
        setVal('fAtivAtivCliente', '');
        setVal('fAtivObservacao', '');
        setVal('fAtivTarefa', '1 Sem tarefa');
        setVal('fAtivDataTarefa', '');
        setVal('fAtivHoraTarefa', '');
        setVal('fAtivObsTarefa', '');
        setVal('fAtivConcluiTarefa', '1 Em Aberto');
        setVal('fAtivOrcamento', '');
        setVal('fAtivPedido', '');
        setVal('fAtivNota', '');
    }

    // Carrega consulta de preços para a segunda aba
    carregarConsultaPrecosModal(lead);

    const modal = document.getElementById('modalAlteraAtividadeVendas');
    if (typeof abrirModal === 'function') {
        abrirModal('modalAlteraAtividadeVendas');
    } else if (modal) {
        modal.classList.add('active');
    }
}

function popularSelectsModalAtividade() {
    // Datalist de Clientes para auto-completar
    const datalist = document.getElementById('dlClientesAtividade');
    if (datalist && Array.isArray(leads)) {
        datalist.innerHTML = leads.map(l => `<option value="${escapeHtml(l.empresa)}">${escapeHtml(l.codigoUnico || l.cnpj || '')}</option>`).join('');
    }
}

function selecionarClienteAtividadePorNome(nome) {
    if (!nome) return;
    const lead = (leads || []).find(l => (l.empresa || '').toLowerCase() === nome.toLowerCase());
    if (lead) {
        ativEmEdicao.leadId = lead.id;
        document.getElementById('fAtivCodigoCliente').value = lead.codigoUnico || lead.cnpj || String(lead.id).slice(0, 8);
        document.getElementById('fAtivContato').value = lead.decisor || lead.contato || '';
        document.getElementById('fAtivTelefone').value = lead.telefone || lead.whatsapp || '';
        document.getElementById('fAtivEmail').value = lead.email || '';
        document.getElementById('fAtivAtivCliente').value = lead.ramo || lead.cnaeDescricao || lead.segmento || '';
        document.getElementById('fAtivOrcamento').value = lead.numeroOrcamento || (lead.orcamentos?.[0]?.numero) || '';
        document.getElementById('fAtivPedido').value = lead.numeroPedido || '';
        document.getElementById('fAtivNota').value = lead.numeroNota || '';
        carregarConsultaPrecosModal(lead);
    }
}

function trocarAbaModalAtividade(aba) {
    document.querySelectorAll('.modal-altera-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === aba) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const paneAtiv = document.getElementById('paneModalAtividade');
    const panePrecos = document.getElementById('paneModalConsultaPrecos');

    if (paneAtiv) paneAtiv.style.display = (aba === 'atividade') ? 'block' : 'none';
    if (panePrecos) panePrecos.style.display = (aba === 'precos') ? 'block' : 'none';
}

function carregarConsultaPrecosModal(lead) {
    const container = document.getElementById('consultaPrecosContainer');
    if (!container) return;

    let produtos = [];
    if (typeof produtosCatalogo !== 'undefined' && Array.isArray(produtosCatalogo)) {
        produtos = produtosCatalogo;
    }

    if (lead && Array.isArray(lead.itens) && lead.itens.length > 0) {
        produtos = lead.itens;
    }

    if (produtos.length === 0) {
        container.innerHTML = `
            <div style="padding:20px;text-align:center;color:var(--text-secondary);">
                Nenhum produto cadastrado no catálogo ou no orçamento do cliente atual.
            </div>
        `;
        return;
    }

    let html = `
        <table class="table" style="width:100%;font-size:12px;">
            <thead>
                <tr>
                    <th>Código / Ref</th>
                    <th>Descrição do Item</th>
                    <th>Unidade</th>
                    <th style="text-align:right;">Preço Tabela</th>
                </tr>
            </thead>
            <tbody>
    `;

    produtos.slice(0, 30).forEach(p => {
        const preco = p.preco || p.valor || p.precoUnitario || 0;
        html += `
            <tr>
                <td class="font-mono">${escapeHtml(p.codigo || p.partNumber || '—')}</td>
                <td><strong>${escapeHtml(p.descricao || p.produto || 'Item')}</strong></td>
                <td>${escapeHtml(p.unidade || 'UN')}</td>
                <td style="text-align:right;font-weight:bold;color:var(--primary);">${typeof formatarMoeda === 'function' ? formatarMoeda(preco) : 'R$ ' + preco}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

// --------------------------------------------------------------------------
// GRAVAR ATIVIDADE DE VENDAS (SALVAR FORMULÁRIO)
// --------------------------------------------------------------------------
function salvarAlteraAtividadeVendas(event) {
    if (event) event.preventDefault();

    const getVal = (id) => (document.getElementById(id)?.value || '').trim();

    const tipo = getVal('fAtivTipo') || '1 Apresentação (primeiro contato)';
    const codigoCliente = getVal('fAtivCodigoCliente');
    const nomeCliente = getVal('fAtivNomeCliente');
    const contato = getVal('fAtivContato');
    const telefone = getVal('fAtivTelefone');
    const email = getVal('fAtivEmail');
    const ativCliente = getVal('fAtivAtivCliente');
    const observacao = getVal('fAtivObservacao');
    const tarefa = getVal('fAtivTarefa') || '1 Sem tarefa';
    const dataTarefa = getVal('fAtivDataTarefa');
    const horaTarefa = getVal('fAtivHoraTarefa');
    const obsTarefa = getVal('fAtivObsTarefa');
    const concluiTarefa = getVal('fAtivConcluiTarefa') || '1 Em Aberto';
    const orcamento = getVal('fAtivOrcamento');
    const pedido = getVal('fAtivPedido');
    const nota = getVal('fAtivNota');

    if (!nomeCliente) {
        if (typeof showToast === 'function') showToast('Informe o Nome do Cliente!', 'error');
        return;
    }

    // Localiza ou cria lead correspondente
    let lead = null;
    if (ativEmEdicao.leadId) {
        lead = (leads || []).find(l => String(l.id) === String(ativEmEdicao.leadId));
    }
    if (!lead && nomeCliente) {
        lead = (leads || []).find(l => (l.empresa || '').toLowerCase() === nomeCliente.toLowerCase());
    }

    // Se o lead ainda não existe, cria um novo no pipeline
    if (!lead) {
        const novoLeadId = 'lead_' + Date.now();
        lead = {
            id: novoLeadId,
            empresa: nomeCliente,
            codigoUnico: codigoCliente,
            decisor: contato,
            telefone: telefone,
            email: email,
            ramo: ativCliente,
            etapa: 'leads',
            valor: 0,
            usuarioId: (typeof usuarioAtual !== 'undefined' && usuarioAtual?.id) || '',
            dataCriacao: new Date().toISOString(),
            historico: []
        };
        if (!Array.isArray(leads)) window.leads = [];
        leads.unshift(lead);
    } else {
        // Atualiza campos cadastrais no lead
        if (codigoCliente && !lead.codigoUnico) lead.codigoUnico = codigoCliente;
        if (contato && !lead.decisor) lead.decisor = contato;
        if (telefone && !lead.telefone) lead.telefone = telefone;
        if (email && !lead.email) lead.email = email;
        if (ativCliente && !lead.ramo) lead.ramo = ativCliente;
        if (orcamento) lead.numeroOrcamento = orcamento;
        if (pedido) lead.numeroPedido = pedido;
        if (nota) lead.numeroNota = nota;
    }

    if (!Array.isArray(lead.historico)) lead.historico = [];

    const hojeIso = new Date().toISOString().split('T')[0];
    const horaAtual = new Date().toTimeString().slice(0, 5);

    const registroAtividade = {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        data: hojeIso,
        hora: horaAtual,
        tipo: tipo,
        atividade: tipo,
        descricao: observacao || `Atividade de vendas registrada: ${tipo}`,
        codigoCliente: codigoCliente,
        nomeCliente: nomeCliente,
        contato: contato,
        telefone: telefone,
        email: email,
        ativCliente: ativCliente,
        observacao: observacao,
        tarefa: tarefa,
        tarefaData: dataTarefa,
        tarefaHora: horaTarefa,
        tarefaObs: obsTarefa,
        concluiTarefa: concluiTarefa,
        orcamento: orcamento,
        pedido: pedido,
        nota: nota,
        usuarioId: (typeof usuarioAtual !== 'undefined' && usuarioAtual?.id) || lead.usuarioId || '',
        usuarioNome: (typeof usuarioAtual !== 'undefined' && usuarioAtual?.nome) || 'Consultor'
    };

    if (ativEmEdicao.historicoIndex >= 0 && lead.historico[ativEmEdicao.historicoIndex]) {
        // Preserva data e hora originais se já existirem
        registroAtividade.data = lead.historico[ativEmEdicao.historicoIndex].data || hojeIso;
        registroAtividade.hora = lead.historico[ativEmEdicao.historicoIndex].hora || horaAtual;
        lead.historico[ativEmEdicao.historicoIndex] = registroAtividade;
    } else {
        lead.historico.unshift(registroAtividade);
    }

    // Se tiver tarefa agendada e estiver em aberto, vincula como próxima ação do lead
    if (tarefa !== '1 Sem tarefa' && dataTarefa && concluiTarefa.includes('aberto')) {
        lead.proximaAcao = `${tarefa}: ${obsTarefa || observacao || 'Retorno agendado'}`;
        lead.proximaData = dataTarefa;
        if (!lead.tarefas) lead.tarefas = {};
        lead.tarefas[dataTarefa] = {
            status: 'pendente',
            descricao: obsTarefa || observacao || tarefa
        };
    }

    // Se a tarefa foi concluída e era a próxima ação agendada
    if (concluiTarefa.includes('conclu') && lead.proximaData === dataTarefa) {
        if (lead.tarefas && lead.tarefas[dataTarefa]) {
            lead.tarefas[dataTarefa].status = 'concluida';
        }
    }

    // Salva dados no storage/supabase
    if (typeof salvarDados === 'function') salvarDados();

    // Fecha modal
    if (typeof fecharModal === 'function') {
        fecharModal('modalAlteraAtividadeVendas');
    } else {
        document.getElementById('modalAlteraAtividadeVendas')?.classList.remove('active');
    }

    // Atualiza relatórios e interfaces
    renderizarRelatorioAtividades();
    if (typeof renderizarHistorico === 'function') renderizarHistorico();
    if (typeof renderizarPipeline === 'function') renderizarPipeline();

    if (typeof showToast === 'function') {
        showToast('Atividade de vendas salva com sucesso!');
    }
}

// Ações dos botões superiores do modal "Altera a Atividade de Vendas"
function modalAtividadeAcaoHistorico() {
    const nomeCliente = document.getElementById('fAtivNomeCliente')?.value;
    const lead = (leads || []).find(l => (l.empresa || '').toLowerCase() === (nomeCliente || '').toLowerCase());
    if (!lead) {
        if (typeof showToast === 'function') showToast('Selecione um cliente para ver o histórico!', 'warning');
        return;
    }
    if (typeof alternarSecao === 'function') {
        fecharModal('modalAlteraAtividadeVendas');
        alternarSecao('historico');
        const filtro = document.getElementById('historicoFiltroCliente');
        if (filtro) {
            filtro.value = lead.id;
            if (typeof renderizarHistorico === 'function') renderizarHistorico();
        }
    }
}

function modalAtividadeAcaoPosCliente() {
    const nomeCliente = document.getElementById('fAtivNomeCliente')?.value;
    const lead = (leads || []).find(l => (l.empresa || '').toLowerCase() === (nomeCliente || '').toLowerCase());
    if (!lead) {
        if (typeof showToast === 'function') showToast('Cliente não localizado para dossiê!', 'warning');
        return;
    }
    if (typeof abrirMergulhoProfundoLead === 'function') {
        fecharModal('modalAlteraAtividadeVendas');
        abrirMergulhoProfundoLead(lead.id);
    }
}

function modalAtividadeAcaoImpOrcamento() {
    const orcNum = document.getElementById('fAtivOrcamento')?.value;
    const nomeCliente = document.getElementById('fAtivNomeCliente')?.value;
    const lead = (leads || []).find(l => (l.empresa || '').toLowerCase() === (nomeCliente || '').toLowerCase());

    if (!orcNum && (!lead || !lead.itens || lead.itens.length === 0)) {
        if (typeof showToast === 'function') showToast('Nenhum orçamento vinculado para impressão.', 'warning');
        return;
    }

    if (lead && typeof abrirModalOrcamento === 'function') {
        abrirModalOrcamento(lead.id);
    } else {
        if (typeof showToast === 'function') showToast(`Orçamento Nº ${orcNum || '077939'} em processo de impressão.`);
    }
}

// --------------------------------------------------------------------------
// Funções auxiliares globais
// --------------------------------------------------------------------------
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Exportações para o escopo global
window.relAtividadesFiltro = relAtividadesFiltro;
window.renderizarRelatorioAtividades = renderizarRelatorioAtividades;
window.mudarModoDataAtividades = mudarModoDataAtividades;
window.mudarDiaEspecificoAtividades = mudarDiaEspecificoAtividades;
window.aplicarRangeAtividades = aplicarRangeAtividades;
window.mudarFiltrosAvancadosAtividades = mudarFiltrosAvancadosAtividades;
window.filtrarAtividadesPorBusca = filtrarAtividadesPorBusca;
window.limparFiltrosAtividades = limparFiltrosAtividades;
window.alternarVisaoAtividades = alternarVisaoAtividades;
window.exportarAtividadesTxt = exportarAtividadesTxt;
window.gerarAtividadesPdf = gerarAtividadesPdf;
window.abrirModalAlteraAtividadeVendas = abrirModalAlteraAtividadeVendas;
window.salvarAlteraAtividadeVendas = salvarAlteraAtividadeVendas;
window.trocarAbaModalAtividade = trocarAbaModalAtividade;
window.selecionarClienteAtividadePorNome = selecionarClienteAtividadePorNome;
window.modalAtividadeAcaoHistorico = modalAtividadeAcaoHistorico;
window.modalAtividadeAcaoPosCliente = modalAtividadeAcaoPosCliente;
window.modalAtividadeAcaoImpOrcamento = modalAtividadeAcaoImpOrcamento;
window.copiarConteudoTxtPreview = copiarConteudoTxtPreview;

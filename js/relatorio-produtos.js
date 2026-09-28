// ==========================================================================
// RELATÓRIO: PRODUTOS MAIS ORÇADOS E MAIS VENDIDOS
// Filtros: Período (Datas), Classificação do Lead, Vendedor e Busca
// ==========================================================================

const relProdutosFiltro = {
    periodoTipo: 'mes', // 'hoje', 'semana', 'mes', 'trimestre', 'semestre', 'ano', 'todos', 'personalizado'
    offset: 0,
    dataInicio: '',
    dataFim: '',
    classificacao: '', // 'consumidor', 'revendedor', 'distribuidor', 'industrializacao', 'outros'
    vendedorId: '',
    busca: '',
    ordenacao: 'orcadosQtdDesc' // 'orcadosQtdDesc', 'orcadosValorDesc', 'vendidosQtdDesc', 'vendidosValorDesc', 'conversaoDesc', 'nomeAsc'
};

function obterRangePeriodoProdutos() {
    if (typeof getRangePeriodo === 'function') {
        if (relProdutosFiltro.periodoTipo === 'personalizado') {
            const inicioStr = relProdutosFiltro.dataInicio;
            const fimStr = relProdutosFiltro.dataFim;
            if (!inicioStr || !fimStr) {
                return { inicio: null, fim: null, label: 'Selecione as duas datas', invalido: true };
            }
            if (inicioStr > fimStr) {
                return { inicio: null, fim: null, label: 'Data início posterior à data fim', invalido: true };
            }
            return {
                inicio: new Date(`${inicioStr}T00:00:00`),
                fim: new Date(`${fimStr}T23:59:59`),
                label: `${formatarData(inicioStr)} a ${formatarData(fimStr)}`,
                invalido: false
            };
        }
        const range = getRangePeriodo(relProdutosFiltro.periodoTipo, relProdutosFiltro.offset);
        return { ...range, invalido: false };
    }
    return { inicio: null, fim: null, label: 'Todo o período', invalido: false };
}

function processarEstatisticasProdutos() {
    const range = obterRangePeriodoProdutos();
    const leadsBase = (typeof getLeadsRelatorio === 'function' ? getLeadsRelatorio() : (leads || []));

    // Mapa acumulador por chave única do produto (código ou descrição normalizada)
    const mapaProdutos = new Map();

    const getChave = (item) => {
        if (item.codigo && String(item.codigo).trim().length > 2) {
            return 'COD:' + String(item.codigo).trim().toUpperCase();
        }
        return 'DESC:' + String(item.descricao || 'Sem Descrição').trim().toUpperCase();
    };

    leadsBase.forEach(lead => {
        // 1. Filtro de Classificação
        if (relProdutosFiltro.classificacao && (lead.classificacao || 'outros') !== relProdutosFiltro.classificacao) {
            return;
        }

        // 2. Filtro de Vendedor
        if (relProdutosFiltro.vendedorId && lead.usuarioId !== relProdutosFiltro.vendedorId) {
            return;
        }

        // Extrai itens do orçamento ou do lead
        const itens = Array.isArray(lead.itens) && lead.itens.length > 0
            ? lead.itens
            : (lead.orcamentoPdfPrincipal?.dadosExtraidos?.itens || []);

        if (!itens || itens.length === 0) return;

        // Verifica pertinência por data para Orçados
        // Data base do orçamento: dataCriacao, dataEntradaEtapa ou data do anexo
        const dataCriacaoLead = lead.dataCriacao || lead.dataEntradaEtapa;
        const estaNoPeriodoOrcamento = (!range.inicio || !range.fim || range.invalido || relProdutosFiltro.periodoTipo === 'todos')
            ? true
            : (typeof dataNoPeriodo === 'function' ? dataNoPeriodo(dataCriacaoLead, range.inicio, range.fim) : true);

        // Verifica pertinência por data para Vendidos (etapa === 'pedido')
        const dataFechamento = typeof getDataFechamentoPedido === 'function' ? getDataFechamentoPedido(lead) : (lead.dataPedido || lead.dataEntradaPedido || lead.dataCriacao);
        const estaNoPeriodoVenda = lead.etapa === 'pedido' && ((!range.inicio || !range.fim || range.invalido || relProdutosFiltro.periodoTipo === 'todos')
            ? true
            : (typeof dataNoPeriodo === 'function' ? dataNoPeriodo(dataFechamento, range.inicio, range.fim) : true));

        itens.forEach(it => {
            const desc = (it.descricao || it.produto || 'Item de Orçamento').trim();
            const cod = (it.codigo || it.partNumber || '').trim();
            const chave = getChave(it);

            const qtd = Number(it.quantidade || it.qtd || 1) || 1;
            const precoUnit = Number(it.preco || it.valor || it.precoUnitario || 0) || 0;
            const subtotal = Number(it.total || (precoUnit * qtd)) || 0;

            if (!mapaProdutos.has(chave)) {
                mapaProdutos.set(chave, {
                    chave,
                    codigo: cod,
                    descricao: desc,
                    unidade: it.unidade || 'UN',
                    ncm: it.classifFiscal || it.ncm || '',
                    qtdOrcada: 0,
                    valorOrcado: 0,
                    vezesOrcado: 0,
                    qtdVendida: 0,
                    valorVendido: 0,
                    vezesVendido: 0,
                    leadsOrcados: new Set(),
                    leadsVendidos: new Set(),
                    precoMedio: precoUnit
                });
            }

            const reg = mapaProdutos.get(chave);
            if (!reg.codigo && cod) reg.codigo = cod;
            if (it.classifFiscal && !reg.ncm) reg.ncm = it.classifFiscal;

            // Se está no período do orçamento
            if (estaNoPeriodoOrcamento) {
                reg.qtdOrcada += qtd;
                reg.valorOrcado += subtotal;
                reg.vezesOrcado += 1;
                reg.leadsOrcados.add(lead.empresa || lead.id);
            }

            // Se fechou em pedido e está no período de venda
            if (estaNoPeriodoVenda) {
                reg.qtdVendida += qtd;
                reg.valorVendido += subtotal;
                reg.vezesVendido += 1;
                reg.leadsVendidos.add(lead.empresa || lead.id);
            }
        });
    });

    let lista = Array.from(mapaProdutos.values());

    // Filtra itens com ao menos 1 orçamento ou venda no período
    lista = lista.filter(p => (p.qtdOrcada > 0 || p.qtdVendida > 0));

    // Filtro de busca textual
    if (relProdutosFiltro.busca) {
        const termo = relProdutosFiltro.busca.toLowerCase().trim();
        lista = lista.filter(p =>
            p.descricao.toLowerCase().includes(termo) ||
            (p.codigo && p.codigo.toLowerCase().includes(termo)) ||
            (p.ncm && p.ncm.toLowerCase().includes(termo))
        );
    }

    // Calcula taxas de conversão (itens vendidos / itens orçados)
    lista.forEach(p => {
        p.taxaConversao = p.qtdOrcada > 0 ? Math.min(100, (p.qtdVendida / p.qtdOrcada) * 100) : 0;
        p.precoMedioUnitario = p.qtdOrcada > 0 ? (p.valorOrcado / p.qtdOrcada) : (p.qtdVendida > 0 ? p.valorVendido / p.qtdVendida : 0);
    });

    // Ordenação
    lista.sort((a, b) => {
        switch (relProdutosFiltro.ordenacao) {
            case 'orcadosQtdDesc':
                return b.qtdOrcada - a.qtdOrcada || b.valorOrcado - a.valorOrcado;
            case 'orcadosValorDesc':
                return b.valorOrcado - a.valorOrcado || b.qtdOrcada - a.qtdOrcada;
            case 'vendidosQtdDesc':
                return b.qtdVendida - a.qtdVendida || b.valorVendido - a.valorVendido;
            case 'vendidosValorDesc':
                return b.valorVendido - a.valorVendido || b.qtdVendida - a.qtdVendida;
            case 'conversaoDesc':
                return b.taxaConversao - a.taxaConversao || b.qtdVendida - a.qtdVendida;
            case 'nomeAsc':
                return a.descricao.localeCompare(b.descricao);
            default:
                return b.qtdOrcada - a.qtdOrcada;
        }
    });

    return { lista, range };
}

function renderizarRelatorioProdutos() {
    const painel = document.getElementById('relProdutosPainel');
    if (!painel) return;

    atualizarUiPeriodoProdutos();
    popularFiltroVendedorProdutos();

    const { lista, range } = processarEstatisticasProdutos();

    // Totais Consolidados
    const totalQtdOrcada = lista.reduce((acc, p) => acc + p.qtdOrcada, 0);
    const totalValorOrcado = lista.reduce((acc, p) => acc + p.valorOrcado, 0);
    const totalQtdVendida = lista.reduce((acc, p) => acc + p.qtdVendida, 0);
    const totalValorVendido = lista.reduce((acc, p) => acc + p.valorVendido, 0);
    const taxaGeralConversao = totalQtdOrcada > 0 ? ((totalQtdVendida / totalQtdOrcada) * 100) : 0;

    // Top 5 Orçados e Top 5 Vendidos para os Cards Comparativos
    const topOrcados = [...lista].sort((a, b) => b.qtdOrcada - a.qtdOrcada).slice(0, 5);
    const topVendidos = [...lista].sort((a, b) => b.qtdVendida - a.qtdVendida).slice(0, 5);

    let html = `
        <!-- Cards KPI de Resumo de Produtos -->
        <div class="rel-fluid-grid-3 mb-16" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;">
            <div class="relatorio-card" style="padding:16px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);box-shadow:var(--shadow-sm);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;">Volume Orçado</span>
                    <span style="font-size:18px;">📋</span>
                </div>
                <div style="font-size:22px;font-weight:700;color:var(--primary);">${totalQtdOrcada.toLocaleString('pt-BR')} <span style="font-size:13px;font-weight:500;color:var(--text-secondary);">unidades</span></div>
                <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-top:4px;">${formatarMoeda(totalValorOrcado)}</div>
            </div>

            <div class="relatorio-card" style="padding:16px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);box-shadow:var(--shadow-sm);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;">Volume Vendido (Fechado)</span>
                    <span style="font-size:18px;">✅</span>
                </div>
                <div style="font-size:22px;font-weight:700;color:#10b981;">${totalQtdVendida.toLocaleString('pt-BR')} <span style="font-size:13px;font-weight:500;color:var(--text-secondary);">unidades</span></div>
                <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-top:4px;">${formatarMoeda(totalValorVendido)}</div>
            </div>

            <div class="relatorio-card" style="padding:16px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);box-shadow:var(--shadow-sm);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;">Conversão de Produtos</span>
                    <span style="font-size:18px;">🎯</span>
                </div>
                <div style="font-size:22px;font-weight:700;color:${taxaGeralConversao >= 50 ? '#10b981' : '#f59e0b'};">${taxaGeralConversao.toFixed(1)}%</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Proporção de peças vendidas vs. orçadas</div>
            </div>

            <div class="relatorio-card" style="padding:16px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);box-shadow:var(--shadow-sm);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;">Itens Distintos</span>
                    <span style="font-size:18px;">📦</span>
                </div>
                <div style="font-size:22px;font-weight:700;color:var(--text-primary);">${lista.length}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">SKUs catalogados com movimentação</div>
            </div>
        </div>

        <!-- Destaques: Top 5 Mais Orçados vs Top 5 Mais Vendidos -->
        <div class="rel-fluid-grid-2 mb-16" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;">
            <!-- Top Mais Orçados -->
            <div class="relatorio-card" style="padding:16px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);">
                <h4 style="margin:0 0 12px 0;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;color:var(--text-primary);">
                    <span>🔥 Top 5 Produtos Mais Orçados</span>
                </h4>
                ${topOrcados.length === 0 ? '<p class="text-xs text-muted">Nenhum produto orçado no período.</p>' : `
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        ${topOrcados.map((item, idx) => {
                            const barPct = totalQtdOrcada > 0 ? Math.min(100, Math.round((item.qtdOrcada / (topOrcados[0].qtdOrcada || 1)) * 100)) : 0;
                            return `
                                <div>
                                    <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;">
                                        <span style="font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%;">
                                            #${idx + 1} ${item.descricao}
                                        </span>
                                        <span style="font-weight:700;color:var(--primary);">${item.qtdOrcada} ${item.unidade} (${formatarMoeda(item.valorOrcado)})</span>
                                    </div>
                                    <div style="background:var(--bg-input,#f1f5f9);height:6px;border-radius:3px;overflow:hidden;">
                                        <div style="width:${barPct}%;height:100%;background:var(--primary);border-radius:3px;"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>

            <!-- Top Mais Vendidos -->
            <div class="relatorio-card" style="padding:16px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);">
                <h4 style="margin:0 0 12px 0;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;color:var(--text-primary);">
                    <span>🏆 Top 5 Produtos Mais Vendidos</span>
                </h4>
                ${topVendidos.filter(p => p.qtdVendida > 0).length === 0 ? '<p class="text-xs text-muted">Nenhum pedido com produtos fechado no período.</p>' : `
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        ${topVendidos.filter(p => p.qtdVendida > 0).map((item, idx) => {
                            const barPct = topVendidos[0].qtdVendida > 0 ? Math.min(100, Math.round((item.qtdVendida / topVendidos[0].qtdVendida) * 100)) : 0;
                            return `
                                <div>
                                    <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;">
                                        <span style="font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%;">
                                            #${idx + 1} ${item.descricao}
                                        </span>
                                        <span style="font-weight:700;color:#10b981;">${item.qtdVendida} ${item.unidade} (${formatarMoeda(item.valorVendido)})</span>
                                    </div>
                                    <div style="background:var(--bg-input,#f1f5f9);height:6px;border-radius:3px;overflow:hidden;">
                                        <div style="width:${barPct}%;height:100%;background:#10b981;border-radius:3px;"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        </div>

        <!-- Tabela Completa e Detalhada com Ordenação Interativa -->
        <div class="relatorio-card" style="padding:0;overflow:hidden;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);">
            <div style="padding:14px 18px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <h4 style="margin:0;font-size:15px;font-weight:700;color:var(--text-primary);">
                    Detalhamento dos Produtos (${lista.length} itens)
                </h4>
                <div style="font-size:12px;color:var(--text-muted);">
                    Clique nos cabeçalhos ou use o seletor acima para reordenar
                </div>
            </div>

            <div class="table-wrapper" style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
                    <thead>
                        <tr style="background:var(--bg-input,#f8fafc);border-bottom:2px solid var(--border-color);text-align:left;">
                            <th style="padding:10px 14px;width:35px;text-align:center;">#</th>
                            <th style="padding:10px 14px;min-width:220px;">Descrição do Produto</th>
                            <th style="padding:10px 14px;min-width:110px;">Código / Part Nº</th>
                            <th style="padding:10px 14px;min-width:90px;">NCM</th>
                            <th style="padding:10px 14px;text-align:right;">Preço Médio</th>
                            <th style="padding:10px 14px;text-align:center;background:rgba(45,72,99,0.06);font-weight:700;">Qtd. Orçada</th>
                            <th style="padding:10px 14px;text-align:right;background:rgba(45,72,99,0.06);">Total Orçado</th>
                            <th style="padding:10px 14px;text-align:center;background:rgba(16,185,129,0.08);font-weight:700;color:#065f46;">Qtd. Vendida</th>
                            <th style="padding:10px 14px;text-align:right;background:rgba(16,185,129,0.08);font-weight:700;color:#065f46;">Total Vendido</th>
                            <th style="padding:10px 14px;text-align:center;font-weight:700;">Conversão (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lista.length === 0 ? `
                            <tr>
                                <td colspan="10" style="padding:32px;text-align:center;color:var(--text-muted);">
                                    Nenhum produto encontrado com os filtros aplicados neste período.
                                </td>
                            </tr>
                        ` : lista.map((p, idx) => {
                            const taxaCor = p.taxaConversao >= 50 ? '#10b981' : (p.taxaConversao > 0 ? '#f59e0b' : 'var(--text-muted)');
                            return `
                                <tr style="border-bottom:1px solid var(--border-color);">
                                    <td style="padding:10px 14px;text-align:center;font-weight:600;color:var(--text-muted);">${idx + 1}</td>
                                    <td style="padding:10px 14px;">
                                        <div style="font-weight:600;color:var(--text-primary);">${p.descricao}</div>
                                        <div class="text-xs text-muted">${p.leadsOrcados.size} empresa(s) orçaram</div>
                                    </td>
                                    <td style="padding:10px 14px;font-family:monospace;color:var(--text-secondary);">${p.codigo || '—'}</td>
                                    <td style="padding:10px 14px;font-family:monospace;font-size:11px;color:var(--text-muted);">${p.ncm || '—'}</td>
                                    <td style="padding:10px 14px;text-align:right;">${formatarMoeda(p.precoMedioUnitario)}</td>
                                    <td style="padding:10px 14px;text-align:center;font-weight:700;background:rgba(45,72,99,0.03);">${p.qtdOrcada} ${p.unidade}</td>
                                    <td style="padding:10px 14px;text-align:right;background:rgba(45,72,99,0.03);">${formatarMoeda(p.valorOrcado)}</td>
                                    <td style="padding:10px 14px;text-align:center;font-weight:700;color:#10b981;background:rgba(16,185,129,0.03);">${p.qtdVendida} ${p.unidade}</td>
                                    <td style="padding:10px 14px;text-align:right;font-weight:700;color:#10b981;background:rgba(16,185,129,0.03);">${formatarMoeda(p.valorVendido)}</td>
                                    <td style="padding:10px 14px;text-align:center;font-weight:700;color:${taxaCor};">
                                        ${p.taxaConversao.toFixed(1)}%
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    ${lista.length > 0 ? `
                        <tfoot>
                            <tr style="background:var(--bg-input,#f1f5f9);font-weight:700;border-top:2px solid var(--border-color);">
                                <td colspan="5" style="padding:12px 14px;text-align:right;">TOTAIS:</td>
                                <td style="padding:12px 14px;text-align:center;">${totalQtdOrcada}</td>
                                <td style="padding:12px 14px;text-align:right;">${formatarMoeda(totalValorOrcado)}</td>
                                <td style="padding:12px 14px;text-align:center;color:#065f46;">${totalQtdVendida}</td>
                                <td style="padding:12px 14px;text-align:right;color:#065f46;">${formatarMoeda(totalValorVendido)}</td>
                                <td style="padding:12px 14px;text-align:center;color:#065f46;">${taxaGeralConversao.toFixed(1)}%</td>
                            </tr>
                        </tfoot>
                    ` : ''}
                </table>
            </div>
        </div>
    `;

    painel.innerHTML = html;
}

function mudarPeriodoProdutosRapido(tipo) {
    relProdutosFiltro.periodoTipo = tipo;
    relProdutosFiltro.offset = 0;

    const personalizadoBox = document.getElementById('relProdutosPersonalizadoBox');
    if (personalizadoBox) {
        personalizadoBox.style.display = tipo === 'personalizado' ? 'flex' : 'none';
    }

    renderizarRelatorioProdutos();
}

function mudarOffsetProdutos(delta) {
    relProdutosFiltro.offset += delta;
    renderizarRelatorioProdutos();
}

function aplicarFiltroProdutosPersonalizado() {
    const inicio = document.getElementById('relProdutosDataInicio')?.value;
    const fim = document.getElementById('relProdutosDataFim')?.value;
    relProdutosFiltro.dataInicio = inicio || '';
    relProdutosFiltro.dataFim = fim || '';
    renderizarRelatorioProdutos();
}

function mudarFiltrosProdutosPainel() {
    relProdutosFiltro.busca = document.getElementById('relProdutosBusca')?.value || '';
    relProdutosFiltro.classificacao = document.getElementById('relProdutosFiltroClassificacao')?.value || '';
    relProdutosFiltro.vendedorId = document.getElementById('relProdutosFiltroVendedor')?.value || '';
    relProdutosFiltro.ordenacao = document.getElementById('relProdutosOrdenacao')?.value || 'orcadosQtdDesc';
    renderizarRelatorioProdutos();
}

function atualizarUiPeriodoProdutos() {
    const botoes = document.querySelectorAll('.rel-produtos-pills .rel-pill-btn');
    botoes.forEach(btn => {
        if (btn.getAttribute('data-periodo') === relProdutosFiltro.periodoTipo) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const labelEl = document.getElementById('relProdutosPeriodoLabel');
    const range = obterRangePeriodoProdutos();
    if (labelEl) labelEl.textContent = range.label || 'Período';
}

function popularFiltroVendedorProdutos() {
    const select = document.getElementById('relProdutosFiltroVendedor');
    if (!select) return;

    const ehAdmin = usuarioAtual && usuarioAtual.papel === 'admin';
    if (!ehAdmin) {
        select.style.display = 'none';
        return;
    }

    select.style.display = 'inline-block';
    const atual = relProdutosFiltro.vendedorId;
    if (select.children.length <= 1) {
        select.innerHTML = '<option value="">Todos os vendedores</option>' +
            usuarios.map(u => `<option value="${u.id}">${u.nome || u.email}</option>`).join('');
    }
    select.value = atual;
}

// Exportação em CSV
function exportarCsvProdutos() {
    const { lista, range } = processarEstatisticasProdutos();
    if (lista.length === 0) {
        showToast('Nenhum dado para exportar com os filtros atuais.', 'error');
        return;
    }

    let csv = 'Descricao;Codigo;NCM;Qtd_Orcada;Valor_Orcado;Qtd_Vendida;Valor_Vendido;Taxa_Conversao_Pct\n';
    lista.forEach(p => {
        csv += `"${(p.descricao || '').replace(/"/g, '""')}";` +
            `"${p.codigo || ''}";` +
            `"${p.ncm || ''}";` +
            `${p.qtdOrcada};` +
            `${p.valorOrcado.toFixed(2).replace('.', ',')};` +
            `${p.qtdVendida};` +
            `${p.valorVendido.toFixed(2).replace('.', ',')};` +
            `${p.taxaConversao.toFixed(1).replace('.', ',')}%\n`;
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_produtos_mais_orcados_vendidos_${hoje()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Relatório de produtos exportado em CSV com sucesso!');
}

// Impressão em PDF
function imprimirRelatorioProdutos() {
    const { lista, range } = processarEstatisticasProdutos();
    if (lista.length === 0) {
        showToast('Nenhum produto para imprimir com os filtros atuais.', 'error');
        return;
    }

    const marcaEmpresa = (typeof empresaAtual !== 'undefined' && empresaAtual) ? empresaAtual : { nome: 'Feitosa CRM', cnpj: '' };
    const totalQtdOrcada = lista.reduce((acc, p) => acc + p.qtdOrcada, 0);
    const totalValorOrcado = lista.reduce((acc, p) => acc + p.valorOrcado, 0);
    const totalQtdVendida = lista.reduce((acc, p) => acc + p.qtdVendida, 0);
    const totalValorVendido = lista.reduce((acc, p) => acc + p.valorVendido, 0);

    const linhas = lista.map((p, idx) => `
        <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td><strong>${p.descricao}</strong></td>
            <td>${p.codigo || '—'}</td>
            <td>${p.ncm || '—'}</td>
            <td style="text-align:right;">${formatarMoeda(p.precoMedioUnitario)}</td>
            <td style="text-align:center;font-weight:700;">${p.qtdOrcada} ${p.unidade}</td>
            <td style="text-align:right;">${formatarMoeda(p.valorOrcado)}</td>
            <td style="text-align:center;font-weight:700;color:#065f46;">${p.qtdVendida} ${p.unidade}</td>
            <td style="text-align:right;font-weight:700;color:#065f46;">${formatarMoeda(p.valorVendido)}</td>
            <td style="text-align:center;font-weight:700;">${p.taxaConversao.toFixed(1)}%</td>
        </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório de Produtos Mais Orçados e Mais Vendidos</title>
<style>
    body { font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; padding: 24px; color: #1a2332; line-height: 1.4; }
    h1 { font-size: 20px; margin: 0 0 4px; color: #2d4863; }
    .meta { font-size: 11px; color: #64748b; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
    th { background: #f1f5f9; font-weight: 700; color: #334155; }
    tr:nth-child(even) { background: #f8fafc; }
    tfoot td { font-weight: 700; background: #e2e8f0; }
    .grid-kpi { display: flex; gap: 16px; margin-bottom: 16px; }
    .card-kpi { border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; flex: 1; background: #fafafa; }
    .card-kpi strong { display: block; font-size: 15px; margin-top: 4px; color: #2d4863; }
    @media print { body { padding: 0; } @page { margin: 1cm; size: landscape; } }
</style>
</head><body>
    <h1>Produtos Mais Orçados e Vendidos — ${marcaEmpresa.nome || 'CRM'}</h1>
    ${marcaEmpresa.cnpj ? `<div class="meta">CNPJ: ${marcaEmpresa.cnpj}</div>` : ''}
    <div class="meta">
        Período: <strong>${range.label}</strong> • Classificação: <strong>${relProdutosFiltro.classificacao || 'Todas'}</strong> • Gerado em ${formatarData(hoje())} às ${new Date().toTimeString().slice(0, 5)}
    </div>

    <div class="grid-kpi">
        <div class="card-kpi"><span>Total Peças Orçadas</span><strong>${totalQtdOrcada} (${formatarMoeda(totalValorOrcado)})</strong></div>
        <div class="card-kpi"><span>Total Peças Vendidas</span><strong style="color:#065f46;">${totalQtdVendida} (${formatarMoeda(totalValorVendido)})</strong></div>
        <div class="card-kpi"><span>Conversão Geral</span><strong>${totalQtdOrcada > 0 ? ((totalQtdVendida / totalQtdOrcada) * 100).toFixed(1) : 0}%</strong></div>
        <div class="card-kpi"><span>Total SKUs</span><strong>${lista.length}</strong></div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:30px;">#</th>
                <th>Descrição do Produto</th>
                <th>Código</th>
                <th>NCM</th>
                <th style="text-align:right;">Preço Médio</th>
                <th style="text-align:center;">Qtd. Orçada</th>
                <th style="text-align:right;">Total Orçado</th>
                <th style="text-align:center;">Qtd. Vendida</th>
                <th style="text-align:right;">Total Vendido</th>
                <th style="text-align:center;">Conversão</th>
            </tr>
        </thead>
        <tbody>${linhas}</tbody>
        <tfoot>
            <tr>
                <td colspan="5" style="text-align:right;">TOTAIS:</td>
                <td style="text-align:center;">${totalQtdOrcada}</td>
                <td style="text-align:right;">${formatarMoeda(totalValorOrcado)}</td>
                <td style="text-align:center;">${totalQtdVendida}</td>
                <td style="text-align:right;">${formatarMoeda(totalValorVendido)}</td>
                <td style="text-align:center;">${totalQtdOrcada > 0 ? ((totalQtdVendida / totalQtdOrcada) * 100).toFixed(1) : 0}%</td>
            </tr>
        </tfoot>
    </table>
</body></html>`;

    if (typeof imprimirRelatorioHtmlSeguro === 'function') {
        imprimirRelatorioHtmlSeguro(html, `Relatório de Produtos Mais Orçados e Vendidos - ${new Date().toLocaleDateString('pt-BR')}`);
    } else {
        const janela = window.open('', '_blank');
        if (!janela) {
            showToast('Permita pop-ups para gerar o relatório impresso.', 'error');
            return;
        }
        janela.document.write(html);
        janela.document.close();
        setTimeout(() => { janela.focus(); janela.print(); }, 350);
    }
}

// Exportações Globais
window.relProdutosFiltro = relProdutosFiltro;
window.renderizarRelatorioProdutos = renderizarRelatorioProdutos;
window.mudarPeriodoProdutosRapido = mudarPeriodoProdutosRapido;
window.mudarOffsetProdutos = mudarOffsetProdutos;
window.aplicarFiltroProdutosPersonalizado = aplicarFiltroProdutosPersonalizado;
window.mudarFiltrosProdutosPainel = mudarFiltrosProdutosPainel;
window.exportarCsvProdutos = exportarCsvProdutos;
window.imprimirRelatorioProdutos = imprimirRelatorioProdutos;

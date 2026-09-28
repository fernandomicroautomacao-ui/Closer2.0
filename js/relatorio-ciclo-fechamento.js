// =============================================================================
// RELATÓRIO 3: CICLO MÉDIO DE FECHAMENTO (AGING ORÇAMENTO ➔ PEDIDO DE VENDA)
// Análise do tempo em dias entre a emissão da proposta e o fechamento do pedido
// Em valores absolutos acumulados, destacando:
//   - Tempo médio global de fechamento (dias)
//   - Tempo médio por faixa de valor do orçamento
//   - Propostas abertas em risco (que já estouraram o prazo médio)
//   - Tabela detalhada de cada negócio confrontado
// =============================================================================

let relCicloFiltro = {
    status: '', // 'fechado', 'aberto_no_prazo', 'aberto_em_risco', ''
    faixaValor: '', // 'ate5k', '5k_20k', '20k_50k', 'acima50k', ''
    vendedor: '',
    busca: '',
    ordenacao: 'diasDesc' // 'diasDesc', 'diasAsc', 'valorDesc', 'recente'
};

let relCicloCache = null;

function calcularDiferencaDias(dataInicioStr, dataFimStr) {
    if (!dataInicioStr) return 0;
    try {
        const d1 = new Date(dataInicioStr.split('T')[0] + 'T00:00:00');
        const d2 = dataFimStr ? new Date(dataFimStr.split('T')[0] + 'T00:00:00') : new Date();
        const diffMs = d2 - d1;
        const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(0, dias);
    } catch (e) {
        return 0;
    }
}

function processarDadosCicloFechamento() {
    const lista = [];

    // 1. Coletar todos os orçamentos e pedidos com valor > 0
    (leads || []).forEach(lead => {
        if (lead.deletado || lead.excluido) return;

        const ehPedido = (lead.etapa === 'pedido');
        let orcValor = Number(lead.valor || (lead.orcamentoPdfPrincipal?.dadosExtraidos?.totalComImpostos) || 0);
        const pedValor = ehPedido ? Number(lead.valor || (lead.pedidos?.[0]?.valor) || 0) : 0;

        if (ehPedido && orcValor <= 0 && pedValor > 0) {
            orcValor = pedValor;
        }

        // REGRA DE ELIMINAÇÃO: Zero reais em cotação não entra
        if (orcValor <= 0 && pedValor <= 0) return;

        const dataOrc = (lead.dataCriacao || '').split('T')[0] || (lead.criadoEm || '').split('T')[0];
        if (!dataOrc) return;

        let dataFechamento = null;
        if (ehPedido) {
            dataFechamento = (lead.dataPedido || lead.pedidos?.[0]?.data || lead.atualizadoEm || lead.dataCriacao || '').split('T')[0];
        }

        const diasCiclo = ehPedido
            ? calcularDiferencaDias(dataOrc, dataFechamento)
            : calcularDiferencaDias(dataOrc, null); // Em aberto: dias desde a criação

        // Faixa de valor
        let faixa = 'ate5k';
        let faixaLabel = 'Até R$ 5.000';
        if (orcValor > 50000) {
            faixa = 'acima50k';
            faixaLabel = 'Acima de R$ 50.000';
        } else if (orcValor > 20000) {
            faixa = '20k_50k';
            faixaLabel = 'R$ 20.000 a R$ 50.000';
        } else if (orcValor > 5000) {
            faixa = '5k_20k';
            faixaLabel = 'R$ 5.000 a R$ 20.000';
        }

        const orcNumero = lead.numeroOrcamento || (lead.orcamentoPdfPrincipal?.dadosExtraidos?.numeroOrcamento) || `ORC-${lead.id.slice(0, 6).toUpperCase()}`;
        const pedNumero = ehPedido ? (lead.numeroPedido || (lead.pedidos?.[0]?.numero) || `PED-${lead.id.slice(0, 6).toUpperCase()}`) : '—';

        lista.push({
            id: lead.id,
            empresa: lead.empresa || 'Cliente Sem Nome',
            cnpj: lead.cnpj || '—',
            usuarioId: lead.usuarioId || '',
            decisor: lead.decisor || '—',
            orcNumero,
            orcData: dataOrc,
            orcValor,
            pedNumero,
            pedData: dataFechamento || '—',
            pedValor,
            ehPedido,
            diasCiclo,
            faixa,
            faixaLabel,
            statusTipo: ehPedido ? 'fechado' : 'aberto',
            emRisco: false // será calculado com base na média da faixa
        });
    });

    // 2. Calcular tempo médio geral e por faixa para os já fechados
    const pedidosFechados = lista.filter(item => item.ehPedido);
    const mediaGeralDias = pedidosFechados.length > 0
        ? Math.round(pedidosFechados.reduce((acc, item) => acc + item.diasCiclo, 0) / pedidosFechados.length)
        : 15; // default 15 dias

    const mediasPorFaixa = {
        ate5k: { soma: 0, count: 0, media: 7 },
        '5k_20k': { soma: 0, count: 0, media: 15 },
        '20k_50k': { soma: 0, count: 0, media: 25 },
        acima50k: { soma: 0, count: 0, media: 35 }
    };

    pedidosFechados.forEach(p => {
        if (mediasPorFaixa[p.faixa]) {
            mediasPorFaixa[p.faixa].soma += p.diasCiclo;
            mediasPorFaixa[p.faixa].count += 1;
        }
    });

    Object.keys(mediasPorFaixa).forEach(f => {
        if (mediasPorFaixa[f].count > 0) {
            mediasPorFaixa[f].media = Math.round(mediasPorFaixa[f].soma / mediasPorFaixa[f].count);
        }
    });

    // 3. Identificar propostas abertas em risco (ultrapassaram a média de sua faixa)
    lista.forEach(item => {
        const mediaEsperada = mediasPorFaixa[item.faixa]?.media || mediaGeralDias;
        if (!item.ehPedido && item.diasCiclo > mediaEsperada) {
            item.emRisco = true;
            item.statusTipo = 'aberto_em_risco';
        } else if (!item.ehPedido) {
            item.statusTipo = 'aberto_no_prazo';
        }
    });

    // 4. Aplicar Filtros
    let filtrados = lista;

    if (relCicloFiltro.status) {
        filtrados = filtrados.filter(item => item.statusTipo === relCicloFiltro.status);
    }
    if (relCicloFiltro.faixaValor) {
        filtrados = filtrados.filter(item => item.faixa === relCicloFiltro.faixaValor);
    }
    if (relCicloFiltro.vendedor) {
        filtrados = filtrados.filter(item => item.usuarioId === relCicloFiltro.vendedor);
    }
    if (relCicloFiltro.busca) {
        const t = relCicloFiltro.busca.toLowerCase();
        filtrados = filtrados.filter(item =>
            item.empresa.toLowerCase().includes(t) ||
            item.orcNumero.toLowerCase().includes(t) ||
            item.pedNumero.toLowerCase().includes(t) ||
            item.cnpj.toLowerCase().includes(t)
        );
    }

    // 5. Ordenação
    filtrados.sort((a, b) => {
        if (relCicloFiltro.ordenacao === 'diasDesc') return b.diasCiclo - a.diasCiclo;
        if (relCicloFiltro.ordenacao === 'diasAsc') return a.diasCiclo - b.diasCiclo;
        if (relCicloFiltro.ordenacao === 'valorDesc') return b.orcValor - a.orcValor;
        if (relCicloFiltro.ordenacao === 'recente') return (b.orcData || '').localeCompare(a.orcData || '');
        return b.diasCiclo - a.diasCiclo;
    });

    // 6. KPIs Consolidados
    const propostasEmRisco = lista.filter(item => item.emRisco);
    const valorEmRisco = propostasEmRisco.reduce((acc, item) => acc + item.orcValor, 0);

    const fechamentoMaisRapido = pedidosFechados.length > 0 ? Math.min(...pedidosFechados.map(p => p.diasCiclo)) : 0;
    const fechamentoMaisLongo = pedidosFechados.length > 0 ? Math.max(...pedidosFechados.map(p => p.diasCiclo)) : 0;

    relCicloCache = {
        todos: lista,
        filtrados,
        kpis: {
            totalPropostas: lista.length,
            totalFechadas: pedidosFechados.length,
            mediaGeralDias,
            fechamentoMaisRapido,
            fechamentoMaisLongo,
            qtdEmRisco: propostasEmRisco.length,
            valorEmRisco,
            mediasPorFaixa
        }
    };

    return relCicloCache;
}

function mudarFiltrosCicloFechamento() {
    const sSelect = document.getElementById('relCicloFiltroStatus');
    const fSelect = document.getElementById('relCicloFiltroFaixa');
    const vSelect = document.getElementById('relCicloFiltroVendedor');
    const oSelect = document.getElementById('relCicloOrdenacao');
    const bInput = document.getElementById('relCicloBusca');

    if (sSelect) relCicloFiltro.status = sSelect.value;
    if (fSelect) relCicloFiltro.faixaValor = fSelect.value;
    if (vSelect) relCicloFiltro.vendedor = vSelect.value;
    if (oSelect) relCicloFiltro.ordenacao = oSelect.value;
    if (bInput) relCicloFiltro.busca = bInput.value.trim();

    renderizarPainelCicloFechamento();
}

function renderizarRelatorioCicloFechamento() {
    processarDadosCicloFechamento();
    popularSelectVendedoresCiclo();
    renderizarPainelCicloFechamento();
}

function popularSelectVendedoresCiclo() {
    const select = document.getElementById('relCicloFiltroVendedor');
    if (!select || !Array.isArray(usuarios)) return;

    const atual = relCicloFiltro.vendedor;
    let html = '<option value="">Todos os responsáveis</option>';
    usuarios.forEach(u => {
        html += `<option value="${u.id}" ${atual === u.id ? 'selected' : ''}>${u.nome || u.email}</option>`;
    });
    select.innerHTML = html;
}

function renderizarPainelCicloFechamento() {
    const painel = document.getElementById('relCicloFechamentoPainel');
    if (!painel) return;

    const dados = processarDadosCicloFechamento();
    const { kpis, filtrados } = dados;

    let html = `
        <!-- CARDS DE KPIS DO CICLO -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:16px;">
            <div style="background:var(--bg-card);border:1px solid #0b57d0;border-radius:var(--radius);padding:14px;box-shadow:var(--shadow-sm);">
                <div style="font-size:11px;font-weight:700;color:#0b57d0;text-transform:uppercase;margin-bottom:4px;">⏱️ Ciclo Médio Geral</div>
                <div style="font-size:22px;font-weight:800;color:#0b57d0;">${kpis.mediaGeralDias} dias</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">
                    Da cotação ao pedido fechado (mín ${kpis.fechamentoMaisRapido}d / máx ${kpis.fechamentoMaisLongo}d)
                </div>
            </div>

            <div style="background:var(--bg-card);border:1px solid #c5221f;border-radius:var(--radius);padding:14px;box-shadow:var(--shadow-sm);">
                <div style="font-size:11px;font-weight:700;color:#c5221f;text-transform:uppercase;margin-bottom:4px;">🚨 Propostas em Risco</div>
                <div style="font-size:22px;font-weight:800;color:#c5221f;">${kpis.qtdEmRisco} cotações</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">
                    <strong>${formatarMoeda(kpis.valorEmRisco)}</strong> ultrapassaram a média esperada
                </div>
            </div>

            <div style="background:var(--bg-card);border:1px solid #137333;border-radius:var(--radius);padding:14px;box-shadow:var(--shadow-sm);">
                <div style="font-size:11px;font-weight:700;color:#137333;text-transform:uppercase;margin-bottom:4px;">✅ Pedidos Efetivados</div>
                <div style="font-size:22px;font-weight:800;color:#137333;">${kpis.totalFechadas} vendas</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">
                    Base com histórico fechado e faturado
                </div>
            </div>

            <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);padding:14px;box-shadow:var(--shadow-sm);">
                <div style="font-size:11px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;margin-bottom:4px;">📊 Tempo Médio por Faixa</div>
                <div style="font-size:11px;color:var(--text-primary);margin-top:6px;line-height:1.5;">
                    <div>• Até R$ 5k: <strong>${kpis.mediasPorFaixa.ate5k.media} dias</strong></div>
                    <div>• R$ 5k a 20k: <strong>${kpis.mediasPorFaixa['5k_20k'].media} dias</strong></div>
                    <div>• Acima R$ 20k: <strong>${kpis.mediasPorFaixa['20k_50k'].media} dias</strong></div>
                </div>
            </div>
        </div>

        <!-- TABELA DE CONFRONTO COM AGING -->
        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow-sm);">
            <div style="padding:12px 16px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <span style="font-size:13px;font-weight:700;color:var(--text-primary);">
                    📑 Propostas e Pedidos (${filtrados.length} encontrados)
                </span>
                <span style="font-size:11px;color:var(--text-muted);">
                    Tempo real de negociação • Sem filtros periódicos
                </span>
            </div>

            <div style="overflow-x:auto;">
                <table class="table" style="width:100%;font-size:12px;margin:0;border-collapse:collapse;">
                    <thead>
                        <tr style="background:var(--bg-input,#f8fafc);border-bottom:1px solid var(--border-color);color:var(--text-secondary);text-align:left;">
                            <th style="padding:10px 14px;">Cliente</th>
                            <th style="padding:10px 12px;">Nº Orçamento & Data</th>
                            <th style="padding:10px 12px;text-align:right;">Valor Orçado (R$)</th>
                            <th style="padding:10px 12px;">Nº Pedido & Data</th>
                            <th style="padding:10px 12px;text-align:right;">Valor Pedido (R$)</th>
                            <th style="padding:10px 12px;text-align:center;">Dias do Ciclo</th>
                            <th style="padding:10px 14px;">Situação do Tempo</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (filtrados.length === 0) {
        html += `
            <tr>
                <td colspan="7" style="padding:32px 16px;text-align:center;color:var(--text-muted);">
                    Nenhuma proposta encontrada para os filtros selecionados.
                </td>
            </tr>
        `;
    } else {
        filtrados.forEach(item => {
            let statusBadge = '';
            if (item.ehPedido) {
                statusBadge = `
                    <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;background:#e6f4ea;color:#137333;">
                        ✅ Fechado em ${item.diasCiclo} dias
                    </span>
                `;
            } else if (item.emRisco) {
                statusBadge = `
                    <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;background:#fce8e6;color:#c5221f;border:1px solid #c5221f40;">
                        🚨 Risco: ${item.diasCiclo}d (Atrasado)
                    </span>
                `;
            } else {
                statusBadge = `
                    <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;background:#e8f0fe;color:#0b57d0;">
                        ⏳ Em Negociação (${item.diasCiclo}d)
                    </span>
                `;
            }

            html += `
                <tr style="border-bottom:1px solid var(--border-color);transition:background 0.15s;" onmouseover="this.style.background='var(--bg-hover,#f1f5f9)'" onmouseout="this.style.background='transparent'">
                    <td style="padding:12px 14px;">
                        <strong style="color:var(--text-primary);display:block;font-size:13px;">${item.empresa}</strong>
                        <span style="font-size:10px;color:var(--text-muted);">Decisor: ${item.decisor}</span>
                    </td>

                    <td style="padding:12px 12px;">
                        <span style="font-weight:700;color:var(--text-primary);">${item.orcNumero}</span>
                        <div style="font-size:11px;color:var(--text-muted);">${formatarData(item.orcData)}</div>
                    </td>

                    <td style="padding:12px 12px;text-align:right;font-weight:600;color:var(--text-primary);">
                        ${formatarMoeda(item.orcValor)}
                    </td>

                    <td style="padding:12px 12px;">
                        ${item.ehPedido
                            ? `<span style="font-weight:700;color:#137333;">${item.pedNumero}</span><div style="font-size:11px;color:var(--text-muted);">${formatarData(item.pedData)}</div>`
                            : `<span style="color:var(--text-muted);">Aguardando fechamento</span>`
                        }
                    </td>

                    <td style="padding:12px 12px;text-align:right;font-weight:700;color:${item.ehPedido ? '#137333' : 'var(--text-muted)'};">
                        ${item.ehPedido ? formatarMoeda(item.pedValor) : '—'}
                    </td>

                    <td style="padding:12px 12px;text-align:center;">
                        <strong style="font-size:14px;color:${item.emRisco ? '#c5221f' : 'var(--text-primary)'};">
                            ${item.diasCiclo}
                        </strong>
                        <span style="font-size:10px;color:var(--text-muted);">dias</span>
                    </td>

                    <td style="padding:12px 14px;">
                        ${statusBadge}
                        <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">
                            ${item.faixaLabel}
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    painel.innerHTML = html;
}

function exportarCsvCicloFechamento() {
    const dados = processarDadosCicloFechamento();
    const lista = dados.filtrados;

    let csv = '\uFEFF';
    csv += 'Cliente;Nº Orcamento;Data Orcamento;Valor Orcado (R$);Nº Pedido;Data Pedido;Valor Pedido (R$);Dias do Ciclo;Status;Faixa\n';

    lista.forEach(item => {
        csv += `"${(item.empresa || '').replace(/"/g, '""')}";`;
        csv += `"${item.orcNumero}";`;
        csv += `"${item.orcData}";`;
        csv += `${item.orcValor.toFixed(2).replace('.', ',')};`;
        csv += `"${item.pedNumero}";`;
        csv += `"${item.pedData}";`;
        csv += `${item.pedValor.toFixed(2).replace('.', ',')};`;
        csv += `${item.diasCiclo};`;
        csv += `"${item.ehPedido ? 'Fechado' : (item.emRisco ? 'Em Risco' : 'Aberto')}";`;
        csv += `"${item.faixaLabel}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ciclo-medio-fechamento-${hoje()}.csv`;
    link.click();
}

function imprimirRelatorioCicloFechamento() {
    window.print();
}

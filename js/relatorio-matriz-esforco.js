// =============================================================================
// RELATÓRIO 2: MATRIZ DE ESFORÇO COMERCIAL X RETORNO (COTADOR X COMPRADOR)
// Análise em valores absolutos sem filtros periódicos
// Classifica em 4 quadrantes:
//   1. ⭐ VIP / Alta Eficiência (Alto valor em pedidos, poucas cotações / conversão ágil)
//   2. 📦 Recorrente Fiel (Alta frequência de cotações e compras regulares)
//   3. ⏳ Negociação Longa (Alto valor orçado ainda pendente em negociação)
//   4. ⚠️ Cotador Compulsivo / Balcão (3+ cotações com conversão baixíssima < 10% ou R$ 0)
// =============================================================================

let relMatrizFiltro = {
    quadrante: '', // 'vip', 'fiel', 'negociacao', 'cotador', ''
    vendedor: '',
    busca: '',
    ordenacao: 'cotacoesDesc' // 'cotacoesDesc', 'valorOrcadoDesc', 'valorPedidosDesc', 'taxaConversaoAsc', 'taxaConversaoDesc', 'empresaAsc'
};

let relMatrizCache = null;

function extrairCnpjMatriz(item) {
    if (!item) return '';
    const cnpjsIgnorar = typeof obterCnpjsEmissorParaIgnorar === 'function' ? obterCnpjsEmissorParaIgnorar() : new Set();

    let val = item.cnpj || '';
    let dig = val.replace(/\D/g, '');
    if (dig && cnpjsIgnorar.has(dig)) {
        val = '';
        dig = '';
    }

    if (!val && item.orcamentoPdfPrincipal?.dadosExtraidos?.clienteCnpj) {
        const cPdf = item.orcamentoPdfPrincipal.dadosExtraidos.clienteCnpj;
        const dPdf = cPdf.replace(/\D/g, '');
        if (!cnpjsIgnorar.has(dPdf)) {
            val = cPdf;
        }
    }
    if (!val && item.codigoUnico) {
        const dCod = String(item.codigoUnico).replace(/\D/g, '');
        if ((dCod.length === 14 || dCod.length === 11) && !cnpjsIgnorar.has(dCod)) {
            val = item.codigoUnico;
        }
    }
    if (!val && item.empresa) {
        const m = item.empresa.match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/);
        if (m && !cnpjsIgnorar.has(m[0].replace(/\D/g, ''))) return m[0];
    }
    return val;
}

function processarDadosMatrizEsforco() {
    const mapa = new Map();

    const getRegistro = (chave, lead) => {
        if (!mapa.has(chave)) {
            mapa.set(chave, {
                chave,
                empresa: (lead.empresa || 'Cliente Sem Nome').trim(),
                cnpjFormatado: extrairCnpjMatriz(lead) || '—',
                cidade: lead.cidade || '',
                estado: lead.estado || '',
                whatsapp: lead.whatsapp || '',
                decisor: lead.decisor || '—',
                usuarioId: lead.usuarioId || '',
                cotacoesQtd: 0,
                cotacoesValor: 0,
                pedidosQtd: 0,
                pedidosValor: 0,
                emAbertoQtd: 0,
                emAbertoValor: 0,
                perdidosQtd: 0,
                perdidosValor: 0,
                quadrante: '', // vip, fiel, negociacao, cotador, neutro
                quadranteNome: '',
                quadranteBadge: '',
                quadranteCor: '',
                quadranteBg: '',
                diagnostico: '',
                recomendacao: ''
            });
        }
        return mapa.get(chave);
    };

    // 1. Processar Leads ativos
    (leads || []).forEach(lead => {
        if (lead.deletado || lead.excluido) return;

        const ehPedido = (lead.etapa === 'pedido');
        let orcValor = Number(lead.valor || (lead.orcamentoPdfPrincipal?.dadosExtraidos?.totalComImpostos) || 0);
        const pedValor = ehPedido ? Number(lead.valor || (lead.pedidos?.[0]?.valor) || 0) : 0;

        if (ehPedido && orcValor <= 0 && pedValor > 0) {
            orcValor = pedValor;
        }

        // REGRA DE ELIMINAÇÃO: Quem tem zero reais em cotações não entra
        if (orcValor <= 0 && pedValor <= 0) return;

        const cnpjBruto = extrairCnpjMatriz(lead);
        const cnpjDigitos = (cnpjBruto || '').replace(/\D/g, '');
        const chave = (cnpjDigitos && (cnpjDigitos.length === 14 || cnpjDigitos.length === 11))
            ? `CNPJ:${cnpjDigitos}`
            : `NOME:${(lead.empresa || lead.id || '').trim().toLowerCase()}`;

        const reg = getRegistro(chave, lead);
        if (lead.empresa && lead.empresa.length > reg.empresa.length) reg.empresa = lead.empresa;

        if (orcValor > 0) {
            reg.cotacoesQtd += 1;
            reg.cotacoesValor += orcValor;
        }

        if (ehPedido && pedValor > 0) {
            reg.pedidosQtd += 1;
            reg.pedidosValor += pedValor;
        } else if (lead.etapa === 'orcamento') {
            reg.emAbertoQtd += 1;
            reg.emAbertoValor += orcValor;
        }

        // Se houver pedidos de recompra
        if (Array.isArray(lead.pedidos) && lead.pedidos.length > 1) {
            for (let i = 1; i < lead.pedidos.length; i++) {
                const pedExtra = lead.pedidos[i];
                const pVal = Number(pedExtra.valor || 0);
                if (pVal > 0) {
                    reg.pedidosQtd += 1;
                    reg.pedidosValor += pVal;
                }
            }
        }
    });

    // 2. Processar Perdidos com valor
    (perdidos || []).forEach(p => {
        const orcValor = Number(p.valor || 0);
        if (orcValor <= 0) return;

        const cnpjBruto = extrairCnpjMatriz(p);
        const cnpjDigitos = (cnpjBruto || '').replace(/\D/g, '');
        const chave = (cnpjDigitos && (cnpjDigitos.length === 14 || cnpjDigitos.length === 11))
            ? `CNPJ:${cnpjDigitos}`
            : `NOME:${(p.empresa || p.id || '').trim().toLowerCase()}`;

        const reg = getRegistro(chave, p);
        reg.cotacoesQtd += 1;
        reg.cotacoesValor += orcValor;
        reg.perdidosQtd += 1;
        reg.perdidosValor += orcValor;
    });

    // 3. Filtrar somente empresas com cotações com valor real > 0
    let lista = Array.from(mapa.values()).filter(r => r.cotacoesValor > 0);

    // 4. Classificar nos 4 quadrantes da Matriz
    lista.forEach(r => {
        r.taxaConversao = r.cotacoesValor > 0 ? Math.round((r.pedidosValor / r.cotacoesValor) * 100) : 0;

        // Regras de Quadrantes:
        // - VIP / Alta Eficiência: Pedidos >= R$ 10.000 ou conversão >= 50% com pedidos > 0
        // - Recorrente Fiel: cotacoesQtd >= 2 e pedidosQtd >= 2
        // - Cotador Compulsivo (Alerta Vermelho): cotacoesQtd >= 3 com taxaConversao <= 15% (muito esforço, quase zero faturamento)
        // - Negociação Longa: emAbertoValor > 0 e cotacoesQtd <= 2 e pedidosQtd === 0
        if (r.cotacoesQtd >= 3 && r.taxaConversao <= 15) {
            r.quadrante = 'cotador';
            r.quadranteNome = '⚠️ Cotador Compulsivo (Balcão)';
            r.quadranteBadge = 'Alerta de Esforço';
            r.quadranteCor = '#c5221f';
            r.quadranteBg = '#fce8e6';
            r.diagnostico = `${r.cotacoesQtd} cotações emitidas (R$ ${formatarMoeda(r.cotacoesValor)}), mas apenas ${r.taxaConversao}% convertido em pedidos.`;
            r.recomendacao = 'Exigir triagem prévia, verificar se está cotando apenas para leilão de concorrente antes de abrir novas propostas.';
        } else if (r.pedidosQtd >= 2 && r.pedidosValor >= 5000) {
            r.quadrante = 'fiel';
            r.quadranteNome = '📦 Recorrente Fiel';
            r.quadranteBadge = 'Parceiro Regular';
            r.quadranteCor = '#137333';
            r.quadranteBg = '#e6f4ea';
            r.diagnostico = `${r.pedidosQtd} pedidos fechados totalizando ${formatarMoeda(r.pedidosValor)}. Relacionamento consolidado.`;
            r.recomendacao = 'Manter cadência de atendimento rápido e oferecer contratos de fornecimento ou bonificações programadas.';
        } else if (r.pedidosValor >= 10000 || r.taxaConversao >= 50 && r.pedidosValor > 0) {
            r.quadrante = 'vip';
            r.quadranteNome = '⭐ VIP / Alta Eficiência';
            r.quadranteBadge = 'Alta Conversão';
            r.quadranteCor = '#0b57d0';
            r.quadranteBg = '#e8f0fe';
            r.diagnostico = `Taxa de conversão de ${r.taxaConversao}% com ${formatarMoeda(r.pedidosValor)} faturados. Pouco atrito para fechar.`;
            r.recomendacao = 'Prioridade máxima no atendimento, condições especiais de faturamento e pós-venda preventivo.';
        } else if (r.emAbertoValor > 0) {
            r.quadrante = 'negociacao';
            r.quadranteNome = '⏳ Negociação em Andamento';
            r.quadranteBadge = 'Potencial Aberto';
            r.quadranteCor = '#b06000';
            r.quadranteBg = '#fef7e0';
            r.diagnostico = `${formatarMoeda(r.emAbertoValor)} aguardando decisão de compra.`;
            r.recomendacao = 'Fazer follow-up com o decisor para mapear objeções técnicas ou de prazo.';
        } else {
            r.quadrante = 'outros';
            r.quadranteNome = '⚪ Cotação Pontual';
            r.quadranteBadge = 'Pontual';
            r.quadranteCor = '#5f6368';
            r.quadranteBg = '#f1f3f4';
            r.diagnostico = 'Histórico inicial com poucas movimentações.';
            r.recomendacao = 'Qualificar potencial futuro da empresa.';
        }
    });

    // 5. Aplicar Filtros
    let filtrados = lista;

    if (relMatrizFiltro.quadrante) {
        filtrados = filtrados.filter(r => r.quadrante === relMatrizFiltro.quadrante);
    }
    if (relMatrizFiltro.vendedor) {
        filtrados = filtrados.filter(r => r.usuarioId === relMatrizFiltro.vendedor);
    }
    if (relMatrizFiltro.busca) {
        const termo = relMatrizFiltro.busca.toLowerCase();
        filtrados = filtrados.filter(r =>
            r.empresa.toLowerCase().includes(termo) ||
            r.cnpjFormatado.toLowerCase().includes(termo) ||
            r.decisor.toLowerCase().includes(termo) ||
            r.cidade.toLowerCase().includes(termo)
        );
    }

    // 6. Ordenação
    filtrados.sort((a, b) => {
        if (relMatrizFiltro.ordenacao === 'cotacoesDesc') return b.cotacoesQtd - a.cotacoesQtd;
        if (relMatrizFiltro.ordenacao === 'valorOrcadoDesc') return b.cotacoesValor - a.cotacoesValor;
        if (relMatrizFiltro.ordenacao === 'valorPedidosDesc') return b.pedidosValor - a.pedidosValor;
        if (relMatrizFiltro.ordenacao === 'taxaConversaoAsc') return a.taxaConversao - b.taxaConversao;
        if (relMatrizFiltro.ordenacao === 'taxaConversaoDesc') return b.taxaConversao - a.taxaConversao;
        if (relMatrizFiltro.ordenacao === 'empresaAsc') return a.empresa.localeCompare(b.empresa);
        return b.cotacoesQtd - a.cotacoesQtd;
    });

    // 7. KPIs Gerais da Matriz
    const cotadoresCompulsivos = lista.filter(r => r.quadrante === 'cotador');
    const vips = lista.filter(r => r.quadrante === 'vip');
    const fieis = lista.filter(r => r.quadrante === 'fiel');
    const negociacoes = lista.filter(r => r.quadrante === 'negociacao');

    const totalCotadoCompulsivos = cotadoresCompulsivos.reduce((acc, r) => acc + r.cotacoesValor, 0);
    const totalQtdCotacoesCompulsivos = cotadoresCompulsivos.reduce((acc, r) => acc + r.cotacoesQtd, 0);

    relMatrizCache = {
        todos: lista,
        filtrados,
        kpis: {
            totalEmpresas: lista.length,
            totalCotadoresCompulsivos: cotadoresCompulsivos.length,
            totalQtdCotacoesCompulsivos,
            totalCotadoCompulsivos,
            totalVips: vips.length,
            totalFieis: fieis.length,
            totalNegociacoes: negociacoes.length
        }
    };

    return relMatrizCache;
}

function mudarFiltrosMatrizEsforco() {
    const qSelect = document.getElementById('relMatrizFiltroQuadrante');
    const vSelect = document.getElementById('relMatrizFiltroVendedor');
    const oSelect = document.getElementById('relMatrizOrdenacao');
    const bInput = document.getElementById('relMatrizBusca');

    if (qSelect) relMatrizFiltro.quadrante = qSelect.value;
    if (vSelect) relMatrizFiltro.vendedor = vSelect.value;
    if (oSelect) relMatrizFiltro.ordenacao = oSelect.value;
    if (bInput) relMatrizFiltro.busca = bInput.value.trim();

    renderizarPainelMatrizEsforco();
}

function renderizarRelatorioMatrizEsforco() {
    const dados = processarDadosMatrizEsforco();
    popularSelectVendedoresMatriz();
    renderizarPainelMatrizEsforco();
}

function popularSelectVendedoresMatriz() {
    const select = document.getElementById('relMatrizFiltroVendedor');
    if (!select || !Array.isArray(usuarios)) return;

    const atual = relMatrizFiltro.vendedor;
    let html = '<option value="">Todos os responsáveis</option>';
    usuarios.forEach(u => {
        html += `<option value="${u.id}" ${atual === u.id ? 'selected' : ''}>${u.nome || u.email}</option>`;
    });
    select.innerHTML = html;
}

function renderizarPainelMatrizEsforco() {
    const painel = document.getElementById('relMatrizEsforcoPainel');
    if (!painel) return;

    const dados = processarDadosMatrizEsforco();
    const { kpis, filtrados } = dados;

    let html = `
        <!-- CARDS DE KPIS DA MATRIZ -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:16px;">
            <div style="background:var(--bg-card);border:1px solid #c5221f;border-radius:var(--radius);padding:14px;box-shadow:var(--shadow-sm);">
                <div style="font-size:11px;font-weight:700;color:#c5221f;text-transform:uppercase;margin-bottom:4px;">⚠️ Cotadores de Balcão</div>
                <div style="font-size:22px;font-weight:800;color:#c5221f;">${kpis.totalCotadoresCompulsivos} clientes</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">
                    ${kpis.totalQtdCotacoesCompulsivos} propostas (${formatarMoeda(kpis.totalCotadoCompulsivos)}) com &lt; 15% conversão
                </div>
            </div>

            <div style="background:var(--bg-card);border:1px solid #0b57d0;border-radius:var(--radius);padding:14px;box-shadow:var(--shadow-sm);">
                <div style="font-size:11px;font-weight:700;color:#0b57d0;text-transform:uppercase;margin-bottom:4px;">⭐ VIP / Alta Eficiência</div>
                <div style="font-size:22px;font-weight:800;color:#0b57d0;">${kpis.totalVips} clientes</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">
                    Alto faturamento e rapidez de fechamento
                </div>
            </div>

            <div style="background:var(--bg-card);border:1px solid #137333;border-radius:var(--radius);padding:14px;box-shadow:var(--shadow-sm);">
                <div style="font-size:11px;font-weight:700;color:#137333;text-transform:uppercase;margin-bottom:4px;">📦 Recorrentes Fiéis</div>
                <div style="font-size:22px;font-weight:800;color:#137333;">${kpis.totalFieis} clientes</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">
                    Cotações recorrentes e compras regulares
                </div>
            </div>

            <div style="background:var(--bg-card);border:1px solid #b06000;border-radius:var(--radius);padding:14px;box-shadow:var(--shadow-sm);">
                <div style="font-size:11px;font-weight:700;color:#b06000;text-transform:uppercase;margin-bottom:4px;">⏳ Negociações Ativas</div>
                <div style="font-size:22px;font-weight:800;color:#b06000;">${kpis.totalNegociacoes} clientes</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">
                    Propostas em andamento aguardando decisão
                </div>
            </div>
        </div>

        <!-- TABELA ANALÍTICA DE ESFORÇO X RETORNO -->
        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow-sm);">
            <div style="padding:12px 16px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <span style="font-size:13px;font-weight:700;color:var(--text-primary);">
                    📋 Lista de Clientes (${filtrados.length} encontrados)
                </span>
                <span style="font-size:11px;color:var(--text-muted);">
                    Sem fragmentação periódica • Valores acumulados
                </span>
            </div>

            <div style="overflow-x:auto;">
                <table class="table" style="width:100%;font-size:12px;margin:0;border-collapse:collapse;">
                    <thead>
                        <tr style="background:var(--bg-input,#f8fafc);border-bottom:1px solid var(--border-color);color:var(--text-secondary);text-align:left;">
                            <th style="padding:10px 14px;">Cliente / CNPJ</th>
                            <th style="padding:10px 12px;">Classificação na Matriz</th>
                            <th style="padding:10px 12px;text-align:center;">Cotações (Esforço)</th>
                            <th style="padding:10px 12px;text-align:right;">Valor Orçado (R$)</th>
                            <th style="padding:10px 12px;text-align:center;">Pedidos Fechados</th>
                            <th style="padding:10px 12px;text-align:right;">Faturado em Pedidos</th>
                            <th style="padding:10px 12px;text-align:center;">Taxa Efetivação</th>
                            <th style="padding:10px 14px;">Diagnóstico & Recomendação</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (filtrados.length === 0) {
        html += `
            <tr>
                <td colspan="8" style="padding:32px 16px;text-align:center;color:var(--text-muted);">
                    Nenhum cliente encontrado com os filtros selecionados.
                </td>
            </tr>
        `;
    } else {
        filtrados.forEach(r => {
            html += `
                <tr style="border-bottom:1px solid var(--border-color);transition:background 0.15s;" onmouseover="this.style.background='var(--bg-hover,#f1f5f9)'" onmouseout="this.style.background='transparent'">
                    <td style="padding:12px 14px;">
                        <strong style="color:var(--text-primary);display:block;font-size:13px;">${r.empresa}</strong>
                        <span style="font-size:11px;color:var(--text-muted);font-family:monospace;">${r.cnpjFormatado}</span>
                        ${r.cidade ? `<span style="font-size:10px;color:var(--text-muted);margin-left:4px;">(${r.cidade}/${r.estado})</span>` : ''}
                    </td>

                    <td style="padding:12px 12px;">
                        <span style="display:inline-block;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:700;background:${r.quadranteBg};color:${r.quadranteCor};border:1px solid ${r.quadranteCor}40;">
                            ${r.quadranteNome}
                        </span>
                    </td>

                    <td style="padding:12px 12px;text-align:center;">
                        <strong style="font-size:13px;color:var(--text-primary);">${r.cotacoesQtd}</strong>
                        <div style="font-size:10px;color:var(--text-muted);">proposta(s)</div>
                    </td>

                    <td style="padding:12px 12px;text-align:right;font-weight:600;color:var(--text-primary);">
                        ${formatarMoeda(r.cotacoesValor)}
                    </td>

                    <td style="padding:12px 12px;text-align:center;">
                        <strong style="font-size:13px;color:${r.pedidosQtd > 0 ? '#137333' : 'var(--text-muted)'};">
                            ${r.pedidosQtd}
                        </strong>
                        <div style="font-size:10px;color:var(--text-muted);">pedido(s)</div>
                    </td>

                    <td style="padding:12px 12px;text-align:right;font-weight:700;color:${r.pedidosValor > 0 ? '#137333' : 'var(--text-muted)'};">
                        ${formatarMoeda(r.pedidosValor)}
                    </td>

                    <td style="padding:12px 12px;text-align:center;">
                        <span style="display:inline-block;padding:2px 6px;border-radius:4px;font-weight:700;font-size:11px;background:${r.taxaConversao >= 50 ? '#e6f4ea' : (r.taxaConversao > 0 ? '#fef7e0' : '#fce8e6')};color:${r.taxaConversao >= 50 ? '#137333' : (r.taxaConversao > 0 ? '#b06000' : '#c5221f')};">
                            ${r.taxaConversao}%
                        </span>
                    </td>

                    <td style="padding:12px 14px;max-width:260px;">
                        <div style="font-size:11px;color:var(--text-primary);margin-bottom:3px;">
                            ${r.diagnostico}
                        </div>
                        <div style="font-size:10px;color:var(--text-muted);font-style:italic;">
                            💡 ${r.recomendacao}
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

function exportarCsvMatrizEsforco() {
    const dados = processarDadosMatrizEsforco();
    const lista = dados.filtrados;

    let csv = '\uFEFF';
    csv += 'Cliente;CNPJ;Classificacao Matriz;Qtd Cotacoes;Valor Cotado (R$);Qtd Pedidos;Valor Faturado (R$);Taxa Conversao (%);Diagnostico;Recomendacao\n';

    lista.forEach(r => {
        csv += `"${(r.empresa || '').replace(/"/g, '""')}";`;
        csv += `"${r.cnpjFormatado}";`;
        csv += `"${r.quadranteNome}";`;
        csv += `${r.cotacoesQtd};`;
        csv += `${r.cotacoesValor.toFixed(2).replace('.', ',')};`;
        csv += `${r.pedidosQtd};`;
        csv += `${r.pedidosValor.toFixed(2).replace('.', ',')};`;
        csv += `${r.taxaConversao}%;`;
        csv += `"${(r.diagnostico || '').replace(/"/g, '""')}";`;
        csv += `"${(r.recomendacao || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `matriz-esforco-cotador-comprador-${hoje()}.csv`;
    link.click();
}

function imprimirRelatorioMatrizEsforco() {
    window.print();
}

// ==========================================================================
// RELATÓRIO: CURVA ABC DE PRODUTOS E CLIENTES
// Metodologia Clássica de Pareto (80-15-5 / A: até 80%, B: 80% a 95%, C: 95% a 100%)
// Suporte a análise por Faturamento (Valor Vendido) e por Quantidade/Volume
// Filtros dinâmicos: Período, Classificação de Lead, Vendedor, Busca e Modo
// ==========================================================================

const relAbcFiltro = {
    visao: 'produtos', // 'produtos' ou 'clientes'
    metrica: 'valor', // 'valor' (faturamento) ou 'quantidade' (volume)
    periodoTipo: 'mes', // 'hoje', 'semana', 'mes', 'trimestre', 'semestre', 'ano', 'todos', 'personalizado'
    offset: 0,
    dataInicio: '',
    dataFim: '',
    classificacao: '', // 'consumidor', 'revendedor', 'distribuidor', 'industrializacao', 'outros'
    vendedorId: '',
    busca: '',
    filtroClasse: '' // '' (todas), 'A', 'B', 'C'
};

function obterRangePeriodoAbc() {
    if (typeof getRangePeriodo === 'function') {
        if (relAbcFiltro.periodoTipo === 'personalizado') {
            const inicioStr = relAbcFiltro.dataInicio;
            const fimStr = relAbcFiltro.dataFim;
            if (!inicioStr || !fimStr) {
                return { inicio: null, fim: null, label: 'Selecione as duas datas', invalido: true };
            }
            if (inicioStr > fimStr) {
                return { inicio: null, fim: null, label: 'Data inicial maior que data final', invalido: true };
            }
            return {
                inicio: new Date(`${inicioStr}T00:00:00`),
                fim: new Date(`${fimStr}T23:59:59`),
                label: `${formatarData(inicioStr)} a ${formatarData(fimStr)}`,
                invalido: false
            };
        }
        const range = getRangePeriodo(relAbcFiltro.periodoTipo, relAbcFiltro.offset);
        return { ...range, invalido: false };
    }
    return { inicio: null, fim: null, label: 'Todo o período', invalido: false };
}

// --------------------------------------------------------------------------
// CÁLCULO E PROCESSAMENTO DA CURVA ABC DE PRODUTOS
// --------------------------------------------------------------------------
function processarCurvaAbcProdutos() {
    const range = obterRangePeriodoAbc();
    const leadsBase = (typeof getLeadsRelatorio === 'function' ? getLeadsRelatorio() : (leads || []));

    const mapaProdutos = new Map();

    const getChave = (item) => {
        if (item.codigo && String(item.codigo).trim().length > 2) {
            return 'COD:' + String(item.codigo).trim().toUpperCase();
        }
        return 'DESC:' + String(item.descricao || item.produto || 'Item sem descrição').trim().toUpperCase();
    };

    leadsBase.forEach(lead => {
        // Apenas pedidos fechados entram no cálculo de faturamento real ABC
        if (lead.etapa !== 'pedido') return;

        // Filtro de Classificação
        if (relAbcFiltro.classificacao && (lead.classificacao || 'outros') !== relAbcFiltro.classificacao) {
            return;
        }

        // Filtro de Vendedor
        if (relAbcFiltro.vendedorId && lead.usuarioId !== relAbcFiltro.vendedorId) {
            return;
        }

        // Checagem de Período pela data de fechamento da venda
        const dataFechamento = typeof getDataFechamentoPedido === 'function' 
            ? getDataFechamentoPedido(lead) 
            : (lead.dataPedido || lead.dataEntradaPedido || lead.dataCriacao);

        const estaNoPeriodo = (!range.inicio || !range.fim || range.invalido || relAbcFiltro.periodoTipo === 'todos')
            ? true
            : (typeof dataNoPeriodo === 'function' ? dataNoPeriodo(dataFechamento, range.inicio, range.fim) : true);

        if (!estaNoPeriodo) return;

        // Itens
        const itens = Array.isArray(lead.itens) && lead.itens.length > 0
            ? lead.itens
            : (lead.orcamentoPdfPrincipal?.dadosExtraidos?.itens || []);

        if (itens && itens.length > 0) {
            itens.forEach(it => {
                const desc = (it.descricao || it.produto || 'Item de Pedido').trim();
                const cod = (it.codigo || it.partNumber || '').trim();
                const chave = getChave(it);

                const qtd = Number(it.quantidade || it.qtd || 1) || 1;
                const precoUnit = Number(it.preco || it.valor || it.precoUnitario || 0) || 0;
                const totalItem = Number(it.total || (precoUnit * qtd)) || 0;

                if (!mapaProdutos.has(chave)) {
                    mapaProdutos.set(chave, {
                        chave,
                        codigo: cod,
                        descricao: desc,
                        unidade: it.unidade || 'UN',
                        qtdVendida: 0,
                        valorTotal: 0,
                        pedidosCount: 0,
                        clientesSet: new Set()
                    });
                }

                const reg = mapaProdutos.get(chave);
                if (!reg.codigo && cod) reg.codigo = cod;
                reg.qtdVendida += qtd;
                reg.valorTotal += totalItem;
                reg.pedidosCount += 1;
                reg.clientesSet.add(lead.empresa || lead.id);
            });
        } else if (Number(lead.valor || 0) > 0) {
            // Caso tenha pedido sem itens desmembrados, computa como item genérico
            const chave = 'LEAD:' + (lead.empresa || lead.id);
            if (!mapaProdutos.has(chave)) {
                mapaProdutos.set(chave, {
                    chave,
                    codigo: lead.codigoUnico || 'PED',
                    descricao: `Pedido / Contrato (${lead.empresa})`,
                    unidade: 'UN',
                    qtdVendida: 0,
                    valorTotal: 0,
                    pedidosCount: 0,
                    clientesSet: new Set()
                });
            }
            const reg = mapaProdutos.get(chave);
            reg.qtdVendida += 1;
            reg.valorTotal += Number(lead.valor || 0);
            reg.pedidosCount += 1;
            reg.clientesSet.add(lead.empresa || lead.id);
        }
    });

    let lista = Array.from(mapaProdutos.values());

    // Ordenação decrescente pela métrica escolhida
    const ordenacaoProp = relAbcFiltro.metrica === 'quantidade' ? 'qtdVendida' : 'valorTotal';
    lista.sort((a, b) => b[ordenacaoProp] - a[ordenacaoProp]);

    // Totais gerais
    const valorGeral = lista.reduce((acc, p) => acc + p.valorTotal, 0);
    const qtdGeral = lista.reduce((acc, p) => acc + p.qtdVendida, 0);
    const totalMetrica = relAbcFiltro.metrica === 'quantidade' ? qtdGeral : valorGeral;

    // Cálculo da porcentagem acumulada e atribuição de Classe A, B ou C
    let acumuladoMetrica = 0;
    lista.forEach(p => {
        const val = relAbcFiltro.metrica === 'quantidade' ? p.qtdVendida : p.valorTotal;
        p.percentualIndividual = totalMetrica > 0 ? (val / totalMetrica) * 100 : 0;
        acumuladoMetrica += val;
        p.acumuladoValor = acumuladoMetrica;
        p.percentualAcumulado = totalMetrica > 0 ? (acumuladoMetrica / totalMetrica) * 100 : 0;

        // Limiares de Pareto:
        // Classe A: até 80.0%
        // Classe B: acima de 80.0% até 95.0%
        // Classe C: acima de 95.0%
        if (p.percentualAcumulado <= 80.01 || (p.percentualAcumulado - p.percentualIndividual) < 79.99) {
            p.classe = 'A';
        } else if (p.percentualAcumulado <= 95.01 || (p.percentualAcumulado - p.percentualIndividual) < 94.99) {
            p.classe = 'B';
        } else {
            p.classe = 'C';
        }
    });

    // Filtro de classe (se selecionado A, B ou C)
    let listaFiltrada = lista;
    if (relAbcFiltro.filtroClasse) {
        listaFiltrada = listaFiltrada.filter(p => p.classe === relAbcFiltro.filtroClasse);
    }

    // Filtro de busca textual
    if (relAbcFiltro.busca) {
        const termo = relAbcFiltro.busca.toLowerCase().trim();
        listaFiltrada = listaFiltrada.filter(p => 
            p.descricao.toLowerCase().includes(termo) ||
            (p.codigo && p.codigo.toLowerCase().includes(termo))
        );
    }

    // Estatísticas por classe (sobre o total geral)
    const statsClasse = {
        A: { count: 0, valor: 0, qtd: 0, pctValor: 0, pctQtd: 0, pctItens: 0 },
        B: { count: 0, valor: 0, qtd: 0, pctValor: 0, pctQtd: 0, pctItens: 0 },
        C: { count: 0, valor: 0, qtd: 0, pctValor: 0, pctQtd: 0, pctItens: 0 }
    };

    lista.forEach(p => {
        const c = p.classe;
        if (statsClasse[c]) {
            statsClasse[c].count++;
            statsClasse[c].valor += p.valorTotal;
            statsClasse[c].qtd += p.qtdVendida;
        }
    });

    ['A', 'B', 'C'].forEach(c => {
        statsClasse[c].pctValor = valorGeral > 0 ? (statsClasse[c].valor / valorGeral) * 100 : 0;
        statsClasse[c].pctQtd = qtdGeral > 0 ? (statsClasse[c].qtd / qtdGeral) * 100 : 0;
        statsClasse[c].pctItens = lista.length > 0 ? (statsClasse[c].count / lista.length) * 100 : 0;
    });

    return {
        tipo: 'produtos',
        listaCompleta: lista,
        listaExibida: listaFiltrada,
        valorGeral,
        qtdGeral,
        totalItens: lista.length,
        statsClasse,
        range
    };
}

// --------------------------------------------------------------------------
// CÁLCULO E PROCESSAMENTO DA CURVA ABC DE CLIENTES
// --------------------------------------------------------------------------
function processarCurvaAbcClientes() {
    const range = obterRangePeriodoAbc();
    const leadsBase = (typeof getLeadsRelatorio === 'function' ? getLeadsRelatorio() : (leads || []));

    const mapaClientes = new Map();

    leadsBase.forEach(lead => {
        if (lead.etapa !== 'pedido') return;

        // Filtro de Classificação
        if (relAbcFiltro.classificacao && (lead.classificacao || 'outros') !== relAbcFiltro.classificacao) {
            return;
        }

        // Filtro de Vendedor
        if (relAbcFiltro.vendedorId && lead.usuarioId !== relAbcFiltro.vendedorId) {
            return;
        }

        // Período
        const dataFechamento = typeof getDataFechamentoPedido === 'function' 
            ? getDataFechamentoPedido(lead) 
            : (lead.dataPedido || lead.dataEntradaPedido || lead.dataCriacao);

        const estaNoPeriodo = (!range.inicio || !range.fim || range.invalido || relAbcFiltro.periodoTipo === 'todos')
            ? true
            : (typeof dataNoPeriodo === 'function' ? dataNoPeriodo(dataFechamento, range.inicio, range.fim) : true);

        if (!estaNoPeriodo) return;

        const chave = lead.codigoUnico || lead.empresa.trim().toLowerCase();

        if (!mapaClientes.has(chave)) {
            const vendedor = (typeof usuarios !== 'undefined' ? usuarios.find(u => u.id === lead.usuarioId) : null);
            mapaClientes.set(chave, {
                chave,
                codigoUnico: lead.codigoUnico || '—',
                empresa: lead.empresa || 'Sem Nome',
                decisor: lead.decisor || '—',
                cidade: lead.cidade || '—',
                estado: lead.estado || '—',
                classificacao: lead.classificacao || 'outros',
                vendedorNome: vendedor ? vendedor.nome : '—',
                valorTotal: 0,
                qtdPedidos: 0,
                qtdItens: 0,
                itensVendidosMap: new Map()
            });
        }

        const reg = mapaClientes.get(chave);
        const valorLead = Number(lead.valor || 0);
        reg.valorTotal += valorLead;
        reg.qtdPedidos += 1;

        // Quantidade de itens
        const itens = Array.isArray(lead.itens) && lead.itens.length > 0
            ? lead.itens
            : (lead.orcamentoPdfPrincipal?.dadosExtraidos?.itens || []);

        if (itens && itens.length > 0) {
            itens.forEach(it => {
                const qtd = Number(it.quantidade || it.qtd || 1) || 1;
                reg.qtdItens += qtd;
                const d = (it.descricao || it.produto || 'Item').trim();
                reg.itensVendidosMap.set(d, (reg.itensVendidosMap.get(d) || 0) + qtd);
            });
        } else {
            reg.qtdItens += 1;
        }
    });

    let lista = Array.from(mapaClientes.values());

    // Ordenação decrescente pela métrica escolhida
    const ordenacaoProp = relAbcFiltro.metrica === 'quantidade' ? 'qtdItens' : 'valorTotal';
    lista.sort((a, b) => b[ordenacaoProp] - a[ordenacaoProp]);

    // Totais gerais
    const valorGeral = lista.reduce((acc, c) => acc + c.valorTotal, 0);
    const qtdGeral = lista.reduce((acc, c) => acc + c.qtdItens, 0);
    const totalMetrica = relAbcFiltro.metrica === 'quantidade' ? qtdGeral : valorGeral;

    // Cálculo da porcentagem acumulada e atribuição de Classe A, B ou C
    let acumuladoMetrica = 0;
    lista.forEach(c => {
        const val = relAbcFiltro.metrica === 'quantidade' ? c.qtdItens : c.valorTotal;
        c.percentualIndividual = totalMetrica > 0 ? (val / totalMetrica) * 100 : 0;
        acumuladoMetrica += val;
        c.acumuladoValor = acumuladoMetrica;
        c.percentualAcumulado = totalMetrica > 0 ? (acumuladoMetrica / totalMetrica) * 100 : 0;

        // Limiares de Pareto: A <= 80%, B <= 95%, C > 95%
        if (c.percentualAcumulado <= 80.01 || (c.percentualAcumulado - c.percentualIndividual) < 79.99) {
            c.classe = 'A';
        } else if (c.percentualAcumulado <= 95.01 || (c.percentualAcumulado - c.percentualIndividual) < 94.99) {
            c.classe = 'B';
        } else {
            c.classe = 'C';
        }
    });

    // Filtro de classe
    let listaFiltrada = lista;
    if (relAbcFiltro.filtroClasse) {
        listaFiltrada = listaFiltrada.filter(c => c.classe === relAbcFiltro.filtroClasse);
    }

    // Filtro de busca textual
    if (relAbcFiltro.busca) {
        const termo = relAbcFiltro.busca.toLowerCase().trim();
        listaFiltrada = listaFiltrada.filter(c => 
            c.empresa.toLowerCase().includes(termo) ||
            c.codigoUnico.toLowerCase().includes(termo) ||
            c.decisor.toLowerCase().includes(termo) ||
            c.cidade.toLowerCase().includes(termo)
        );
    }

    // Estatísticas por classe
    const statsClasse = {
        A: { count: 0, valor: 0, qtd: 0, pctValor: 0, pctQtd: 0, pctItens: 0 },
        B: { count: 0, valor: 0, qtd: 0, pctValor: 0, pctQtd: 0, pctItens: 0 },
        C: { count: 0, valor: 0, qtd: 0, pctValor: 0, pctQtd: 0, pctItens: 0 }
    };

    lista.forEach(c => {
        const cl = c.classe;
        if (statsClasse[cl]) {
            statsClasse[cl].count++;
            statsClasse[cl].valor += c.valorTotal;
            statsClasse[cl].qtd += c.qtdItens;
        }
    });

    ['A', 'B', 'C'].forEach(cl => {
        statsClasse[cl].pctValor = valorGeral > 0 ? (statsClasse[cl].valor / valorGeral) * 100 : 0;
        statsClasse[cl].pctQtd = qtdGeral > 0 ? (statsClasse[cl].qtd / qtdGeral) * 100 : 0;
        statsClasse[cl].pctItens = lista.length > 0 ? (statsClasse[cl].count / lista.length) * 100 : 0;
    });

    return {
        tipo: 'clientes',
        listaCompleta: lista,
        listaExibida: listaFiltrada,
        valorGeral,
        qtdGeral,
        totalItens: lista.length,
        statsClasse,
        range
    };
}

// --------------------------------------------------------------------------
// ATUALIZAÇÃO DA INTERFACE & CONTROLES
// --------------------------------------------------------------------------
function atualizarUiPeriodoAbc() {
    const pills = document.querySelectorAll('.rel-abc-pills .rel-pill-btn');
    pills.forEach(btn => {
        if (btn.getAttribute('data-periodo') === relAbcFiltro.periodoTipo) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const range = obterRangePeriodoAbc();
    const lbl = document.getElementById('relAbcPeriodoLabel');
    if (lbl) {
        lbl.textContent = range.label || 'Todo Período';
    }

    const boxPersonalizado = document.getElementById('relAbcPersonalizadoBox');
    if (boxPersonalizado) {
        boxPersonalizado.style.display = relAbcFiltro.periodoTipo === 'personalizado' ? 'flex' : 'none';
    }
}

function popularFiltroVendedorAbc() {
    const select = document.getElementById('relAbcFiltroVendedor');
    if (!select) return;
    if (typeof usuarioAtual !== 'undefined' && usuarioAtual && usuarioAtual.papel !== 'admin') {
        select.closest('div').style.display = 'none';
        return;
    }
    const valAtual = select.value || relAbcFiltro.vendedorId;
    if (typeof usuarios !== 'undefined' && Array.isArray(usuarios)) {
        select.innerHTML = '<option value="">Todos os vendedores</option>' +
            usuarios.map(u => `<option value="${u.id}" ${u.id === valAtual ? 'selected' : ''}>${u.nome}</option>`).join('');
    }
}

function mudarVisaoAbc(visao) {
    relAbcFiltro.visao = visao;
    const btnProd = document.getElementById('btnAbcVisaoProdutos');
    const btnCli = document.getElementById('btnAbcVisaoClientes');
    if (btnProd && btnCli) {
        if (visao === 'produtos') {
            btnProd.classList.add('btn-primary');
            btnProd.classList.remove('btn-outline');
            btnCli.classList.add('btn-outline');
            btnCli.classList.remove('btn-primary');
        } else {
            btnCli.classList.add('btn-primary');
            btnCli.classList.remove('btn-outline');
            btnProd.classList.add('btn-outline');
            btnProd.classList.remove('btn-primary');
        }
    }
    renderizarRelatorioAbc();
}

function mudarMetricaAbc(metrica) {
    relAbcFiltro.metrica = metrica;
    renderizarRelatorioAbc();
}

function mudarPeriodoAbcRapido(tipo) {
    relAbcFiltro.periodoTipo = tipo;
    relAbcFiltro.offset = 0;
    renderizarRelatorioAbc();
}

function mudarOffsetAbc(delta) {
    if (relAbcFiltro.periodoTipo === 'todos' || relAbcFiltro.periodoTipo === 'personalizado') return;
    relAbcFiltro.offset += delta;
    renderizarRelatorioAbc();
}

function aplicarFiltroAbcPersonalizado() {
    const ini = document.getElementById('relAbcDataInicio');
    const fim = document.getElementById('relAbcDataFim');
    if (ini && fim) {
        relAbcFiltro.dataInicio = ini.value;
        relAbcFiltro.dataFim = fim.value;
    }
    renderizarRelatorioAbc();
}

function mudarFiltrosAbcPainel() {
    const selClassif = document.getElementById('relAbcFiltroClassificacao');
    const selVend = document.getElementById('relAbcFiltroVendedor');
    const selClasse = document.getElementById('relAbcFiltroClasse');
    const selMetrica = document.getElementById('relAbcMetrica');
    const inputBusca = document.getElementById('relAbcBusca');

    if (selClassif) relAbcFiltro.classificacao = selClassif.value;
    if (selVend) relAbcFiltro.vendedorId = selVend.value;
    if (selClasse) relAbcFiltro.filtroClasse = selClasse.value;
    if (selMetrica) relAbcFiltro.metrica = selMetrica.value;
    if (inputBusca) relAbcFiltro.busca = inputBusca.value;

    renderizarRelatorioAbc();
}

function filtrarClasseAbcRapido(classe) {
    relAbcFiltro.filtroClasse = (relAbcFiltro.filtroClasse === classe) ? '' : classe;
    const selClasse = document.getElementById('relAbcFiltroClasse');
    if (selClasse) selClasse.value = relAbcFiltro.filtroClasse;
    renderizarRelatorioAbc();
}

// --------------------------------------------------------------------------
// RENDERIZAÇÃO COMPLETA DO PAINEL DA CURVA ABC
// --------------------------------------------------------------------------
function renderizarRelatorioAbc() {
    const painel = document.getElementById('relAbcPainel');
    if (!painel) return;

    atualizarUiPeriodoAbc();
    popularFiltroVendedorAbc();

    const isProdutos = relAbcFiltro.visao === 'produtos';
    const dados = isProdutos ? processarCurvaAbcProdutos() : processarCurvaAbcClientes();

    const { listaCompleta, listaExibida, valorGeral, qtdGeral, totalItens, statsClasse, range } = dados;

    // Badges de Classe ABC estilizados
    const badgeClasse = (cl) => {
        if (cl === 'A') {
            return `<span style="display:inline-flex;align-items:center;justify-content:center;padding:2px 8px;border-radius:12px;font-weight:700;font-size:11px;background:#e6f4ea;color:#137333;border:1px solid #ceead6;">Classe A</span>`;
        }
        if (cl === 'B') {
            return `<span style="display:inline-flex;align-items:center;justify-content:center;padding:2px 8px;border-radius:12px;font-weight:700;font-size:11px;background:#fef7e0;color:#b06000;border:1px solid #feefc3;">Classe B</span>`;
        }
        return `<span style="display:inline-flex;align-items:center;justify-content:center;padding:2px 8px;border-radius:12px;font-weight:700;font-size:11px;background:#f1f3f4;color:#5f6368;border:1px solid #dadce0;">Classe C</span>`;
    };

    // Barra visual de proporção Pareto (80% A, 15% B, 5% C)
    const pctA = statsClasse.A.pctValor.toFixed(1);
    const pctB = statsClasse.B.pctValor.toFixed(1);
    const pctC = statsClasse.C.pctValor.toFixed(1);

    let html = `
        <!-- CARDS DOS TRÊS NÍVEIS PARETO (A, B, C) -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-bottom:20px;">
            <!-- CLASSE A -->
            <div style="background:var(--bg-card);border:2px solid ${relAbcFiltro.filtroClasse === 'A' ? '#137333' : '#ceead6'};padding:16px;border-radius:var(--radius);cursor:pointer;transition:transform 0.15s, box-shadow 0.15s;position:relative;" 
                 onclick="filtrarClasseAbcRapido('A')" title="Clique para filtrar apenas itens da Classe A">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="font-size:12px;font-weight:700;color:#137333;text-transform:uppercase;letter-spacing:0.5px;">⭐ CLASSE A (Alta Prioridade)</span>
                    <span style="font-size:10px;background:#e6f4ea;color:#137333;padding:2px 6px;border-radius:8px;font-weight:600;">Até 80%</span>
                </div>
                <div style="font-size:22px;font-weight:800;color:var(--text-primary);margin-bottom:4px;">
                    ${formatarMoeda(statsClasse.A.valor)}
                </div>
                <div style="font-size:12px;color:var(--text-secondary);display:flex;justify-content:space-between;">
                    <span><strong>${statsClasse.A.count}</strong> ${isProdutos ? 'SKU(s)' : 'cliente(s)'} (${statsClasse.A.pctItens.toFixed(1)}% do catálogo)</span>
                    <strong style="color:#137333;">${pctA}% da receita</strong>
                </div>
                <div style="margin-top:8px;font-size:11px;color:var(--text-muted);">
                    Volume total: <strong>${statsClasse.A.qtd}</strong> un. vendidas
                </div>
                ${relAbcFiltro.filtroClasse === 'A' ? '<div style="margin-top:6px;font-size:11px;font-weight:700;color:#137333;">✓ Filtro Ativo (Clique p/ remover)</div>' : ''}
            </div>

            <!-- CLASSE B -->
            <div style="background:var(--bg-card);border:2px solid ${relAbcFiltro.filtroClasse === 'B' ? '#b06000' : '#feefc3'};padding:16px;border-radius:var(--radius);cursor:pointer;transition:transform 0.15s, box-shadow 0.15s;position:relative;"
                 onclick="filtrarClasseAbcRapido('B')" title="Clique para filtrar apenas itens da Classe B">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="font-size:12px;font-weight:700;color:#b06000;text-transform:uppercase;letter-spacing:0.5px;">⚡ CLASSE B (Média Prioridade)</span>
                    <span style="font-size:10px;background:#fef7e0;color:#b06000;padding:2px 6px;border-radius:8px;font-weight:600;">80% a 95%</span>
                </div>
                <div style="font-size:22px;font-weight:800;color:var(--text-primary);margin-bottom:4px;">
                    ${formatarMoeda(statsClasse.B.valor)}
                </div>
                <div style="font-size:12px;color:var(--text-secondary);display:flex;justify-content:space-between;">
                    <span><strong>${statsClasse.B.count}</strong> ${isProdutos ? 'SKU(s)' : 'cliente(s)'} (${statsClasse.B.pctItens.toFixed(1)}% do catálogo)</span>
                    <strong style="color:#b06000;">${pctB}% da receita</strong>
                </div>
                <div style="margin-top:8px;font-size:11px;color:var(--text-muted);">
                    Volume total: <strong>${statsClasse.B.qtd}</strong> un. vendidas
                </div>
                ${relAbcFiltro.filtroClasse === 'B' ? '<div style="margin-top:6px;font-size:11px;font-weight:700;color:#b06000;">✓ Filtro Ativo (Clique p/ remover)</div>' : ''}
            </div>

            <!-- CLASSE C -->
            <div style="background:var(--bg-card);border:2px solid ${relAbcFiltro.filtroClasse === 'C' ? '#5f6368' : '#dadce0'};padding:16px;border-radius:var(--radius);cursor:pointer;transition:transform 0.15s, box-shadow 0.15s;position:relative;"
                 onclick="filtrarClasseAbcRapido('C')" title="Clique para filtrar apenas itens da Classe C">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="font-size:12px;font-weight:700;color:#5f6368;text-transform:uppercase;letter-spacing:0.5px;">💤 CLASSE C (Cauda Longa)</span>
                    <span style="font-size:10px;background:#f1f3f4;color:#5f6368;padding:2px 6px;border-radius:8px;font-weight:600;">95% a 100%</span>
                </div>
                <div style="font-size:22px;font-weight:800;color:var(--text-primary);margin-bottom:4px;">
                    ${formatarMoeda(statsClasse.C.valor)}
                </div>
                <div style="font-size:12px;color:var(--text-secondary);display:flex;justify-content:space-between;">
                    <span><strong>${statsClasse.C.count}</strong> ${isProdutos ? 'SKU(s)' : 'cliente(s)'} (${statsClasse.C.pctItens.toFixed(1)}% do catálogo)</span>
                    <strong style="color:#5f6368;">${pctC}% da receita</strong>
                </div>
                <div style="margin-top:8px;font-size:11px;color:var(--text-muted);">
                    Volume total: <strong>${statsClasse.C.qtd}</strong> un. vendidas
                </div>
                ${relAbcFiltro.filtroClasse === 'C' ? '<div style="margin-top:6px;font-size:11px;font-weight:700;color:#5f6368;">✓ Filtro Ativo (Clique p/ remover)</div>' : ''}
            </div>
        </div>

        <!-- BARRA DE COMPOSIÇÃO DE FATURAMENTO DA CURVA ABC -->
        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);padding:14px 18px;margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="font-size:12px;font-weight:700;color:var(--text-primary);">Composição de Receita (Princípio de 80/20 de Pareto):</span>
                <span style="font-size:12px;color:var(--text-secondary);">Total Geral: <strong>${formatarMoeda(valorGeral)}</strong> em ${qtdGeral} unidades</span>
            </div>
            <div style="display:flex;height:16px;border-radius:8px;overflow:hidden;background:#e2e8f0;margin-bottom:8px;">
                <div style="width:${pctA}%;background:#2f7d5b;" title="Classe A: ${pctA}%"></div>
                <div style="width:${pctB}%;background:#e3a93c;" title="Classe B: ${pctB}%"></div>
                <div style="width:${pctC}%;background:#8a99a8;" title="Classe C: ${pctC}%"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);flex-wrap:wrap;gap:8px;">
                <span><span style="display:inline-block;width:10px;height:10px;background:#2f7d5b;border-radius:2px;margin-right:4px;"></span>Classe A: <strong>${pctA}%</strong> (${formatarMoeda(statsClasse.A.valor)})</span>
                <span><span style="display:inline-block;width:10px;height:10px;background:#e3a93c;border-radius:2px;margin-right:4px;"></span>Classe B: <strong>${pctB}%</strong> (${formatarMoeda(statsClasse.B.valor)})</span>
                <span><span style="display:inline-block;width:10px;height:10px;background:#8a99a8;border-radius:2px;margin-right:4px;"></span>Classe C: <strong>${pctC}%</strong> (${formatarMoeda(statsClasse.C.valor)})</span>
            </div>
        </div>
    `;

    // TABELA DETALHADA COM CURVA ABC ACUMULADA
    if (listaExibida.length === 0) {
        html += `
            <div style="text-align:center;padding:40px 20px;background:var(--bg-card);border:1px dashed var(--border-color);border-radius:var(--radius);">
                <div style="font-size:32px;margin-bottom:8px;">🔍</div>
                <h4 style="margin:0 0 4px;color:var(--text-primary);">Nenhum registro encontrado</h4>
                <p style="margin:0;font-size:13px;color:var(--text-muted);">
                    Não há pedidos fechados no período ou filtros selecionados para compor a Curva ABC.
                </p>
            </div>
        `;
        painel.innerHTML = html;
        return;
    }

    if (isProdutos) {
        html += `
            <div class="table-wrapper" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
                    <thead>
                        <tr style="background:var(--bg-input,#f8fafc);border-bottom:2px solid var(--border-color);color:var(--text-secondary);text-align:left;">
                            <th style="padding:10px 12px;width:50px;text-align:center;">#</th>
                            <th style="padding:10px 12px;width:80px;text-align:center;">Classe</th>
                            <th style="padding:10px 12px;">Produto / Descrição</th>
                            <th style="padding:10px 12px;width:110px;">Código</th>
                            <th style="padding:10px 12px;text-align:center;width:90px;">Qtd. Vendida</th>
                            <th style="padding:10px 12px;text-align:right;width:120px;">Faturamento</th>
                            <th style="padding:10px 12px;text-align:right;width:90px;">Part. (%)</th>
                            <th style="padding:10px 12px;text-align:right;width:110px;">Acumulado (%)</th>
                            <th style="padding:10px 12px;width:130px;text-align:center;">Progresso Acum.</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        listaExibida.forEach((p, idx) => {
            const pctBarra = Math.min(100, p.percentualAcumulado).toFixed(1);
            const corBarra = p.classe === 'A' ? '#2f7d5b' : (p.classe === 'B' ? '#e3a93c' : '#8a99a8');
            html += `
                <tr style="border-bottom:1px solid var(--border-color);transition:background 0.15s;">
                    <td style="padding:8px 12px;text-align:center;font-weight:600;color:var(--text-muted);">${idx + 1}</td>
                    <td style="padding:8px 12px;text-align:center;">${badgeClasse(p.classe)}</td>
                    <td style="padding:8px 12px;">
                        <strong style="color:var(--text-primary);display:block;">${p.descricao}</strong>
                        <span class="text-xs text-muted">Comprado por ${p.clientesSet.size} cliente(s) em ${p.pedidosCount} pedido(s)</span>
                    </td>
                    <td style="padding:8px 12px;font-family:monospace;font-size:11.5px;color:var(--text-secondary);">${p.codigo || '—'}</td>
                    <td style="padding:8px 12px;text-align:center;font-weight:600;">${p.qtdVendida} ${p.unidade}</td>
                    <td style="padding:8px 12px;text-align:right;font-weight:700;color:var(--stage-pedido);">${formatarMoeda(p.valorTotal)}</td>
                    <td style="padding:8px 12px;text-align:right;font-weight:600;color:var(--text-primary);">${p.percentualIndividual.toFixed(2)}%</td>
                    <td style="padding:8px 12px;text-align:right;font-weight:700;color:${corBarra};">${p.percentualAcumulado.toFixed(2)}%</td>
                    <td style="padding:8px 12px;text-align:center;">
                        <div style="background:#e2e8f0;height:7px;border-radius:4px;overflow:hidden;width:100%;">
                            <div style="background:${corBarra};height:100%;width:${pctBarra}%;"></div>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                    <tfoot>
                        <tr style="background:var(--bg-input,#f8fafc);font-weight:700;border-top:2px solid var(--border-color);">
                            <td colspan="4" style="padding:10px 12px;text-align:right;">TOTAIS DOS ITENS LISTADOS:</td>
                            <td style="padding:10px 12px;text-align:center;">${listaExibida.reduce((acc, p) => acc + p.qtdVendida, 0)}</td>
                            <td style="padding:10px 12px;text-align:right;color:var(--stage-pedido);">${formatarMoeda(listaExibida.reduce((acc, p) => acc + p.valorTotal, 0))}</td>
                            <td style="padding:10px 12px;text-align:right;">${listaExibida.reduce((acc, p) => acc + p.percentualIndividual, 0).toFixed(1)}%</td>
                            <td colspan="2"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    } else {
        // TABELA CURVA ABC DE CLIENTES
        html += `
            <div class="table-wrapper" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
                    <thead>
                        <tr style="background:var(--bg-input,#f8fafc);border-bottom:2px solid var(--border-color);color:var(--text-secondary);text-align:left;">
                            <th style="padding:10px 12px;width:50px;text-align:center;">#</th>
                            <th style="padding:10px 12px;width:80px;text-align:center;">Classe</th>
                            <th style="padding:10px 12px;">Cliente / Empresa</th>
                            <th style="padding:10px 12px;width:110px;">Código / CNPJ</th>
                            <th style="padding:10px 12px;width:120px;">Classificação</th>
                            <th style="padding:10px 12px;text-align:center;width:90px;">Pedidos</th>
                            <th style="padding:10px 12px;text-align:right;width:130px;">Faturamento Total</th>
                            <th style="padding:10px 12px;text-align:right;width:90px;">Part. (%)</th>
                            <th style="padding:10px 12px;text-align:right;width:110px;">Acumulado (%)</th>
                            <th style="padding:10px 12px;width:130px;text-align:center;">Progresso Acum.</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        listaExibida.forEach((c, idx) => {
            const pctBarra = Math.min(100, c.percentualAcumulado).toFixed(1);
            const corBarra = c.classe === 'A' ? '#2f7d5b' : (c.classe === 'B' ? '#e3a93c' : '#8a99a8');
            const classifObj = typeof CLASSIFICACOES_LEAD !== 'undefined' 
                ? (CLASSIFICACOES_LEAD.find(cl => cl.id === c.classificacao) || CLASSIFICACOES_LEAD[4])
                : { label: c.classificacao, cor: '#56626f', bg: '#f2f4f7' };

            html += `
                <tr style="border-bottom:1px solid var(--border-color);transition:background 0.15s;">
                    <td style="padding:8px 12px;text-align:center;font-weight:600;color:var(--text-muted);">${idx + 1}</td>
                    <td style="padding:8px 12px;text-align:center;">${badgeClasse(c.classe)}</td>
                    <td style="padding:8px 12px;">
                        <strong style="color:var(--text-primary);display:block;">${c.empresa}</strong>
                        <span class="text-xs text-muted">${c.decisor || '—'} • ${c.cidade}/${c.estado} • Vendedor: ${c.vendedorNome}</span>
                    </td>
                    <td style="padding:8px 12px;font-family:monospace;font-size:11.5px;color:var(--text-secondary);">
                        <span class="info-badge-copiavel" onclick="copiarCodigoUnico(event, '${c.codigoUnico}')" title="Clique para copiar o Código Único" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">
                            ${c.codigoUnico} <span style="opacity:0.6;font-size:10px;">📋</span>
                        </span>
                    </td>
                    <td style="padding:8px 12px;">
                        <span class="card-classif-badge" style="color:${classifObj.cor};background:${classifObj.bg};border:1px solid ${classifObj.cor}33;font-size:11px;padding:2px 6px;">
                            ${classifObj.label}
                        </span>
                    </td>
                    <td style="padding:8px 12px;text-align:center;font-weight:600;">${c.qtdPedidos} ped. (${c.qtdItens} itens)</td>
                    <td style="padding:8px 12px;text-align:right;font-weight:700;color:var(--stage-pedido);">${formatarMoeda(c.valorTotal)}</td>
                    <td style="padding:8px 12px;text-align:right;font-weight:600;color:var(--text-primary);">${c.percentualIndividual.toFixed(2)}%</td>
                    <td style="padding:8px 12px;text-align:right;font-weight:700;color:${corBarra};">${c.percentualAcumulado.toFixed(2)}%</td>
                    <td style="padding:8px 12px;text-align:center;">
                        <div style="background:#e2e8f0;height:7px;border-radius:4px;overflow:hidden;width:100%;">
                            <div style="background:${corBarra};height:100%;width:${pctBarra}%;"></div>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                    <tfoot>
                        <tr style="background:var(--bg-input,#f8fafc);font-weight:700;border-top:2px solid var(--border-color);">
                            <td colspan="5" style="padding:10px 12px;text-align:right;">TOTAIS DOS CLIENTES LISTADOS:</td>
                            <td style="padding:10px 12px;text-align:center;">${listaExibida.reduce((acc, c) => acc + c.qtdPedidos, 0)}</td>
                            <td style="padding:10px 12px;text-align:right;color:var(--stage-pedido);">${formatarMoeda(listaExibida.reduce((acc, c) => acc + c.valorTotal, 0))}</td>
                            <td style="padding:10px 12px;text-align:right;">${listaExibida.reduce((acc, c) => acc + c.percentualIndividual, 0).toFixed(1)}%</td>
                            <td colspan="2"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }

    painel.innerHTML = html;
}

// --------------------------------------------------------------------------
// EXPORTAÇÃO CSV DA CURVA ABC
// --------------------------------------------------------------------------
function exportarCsvAbc() {
    const isProdutos = relAbcFiltro.visao === 'produtos';
    const dados = isProdutos ? processarCurvaAbcProdutos() : processarCurvaAbcClientes();
    const { listaExibida, range } = dados;

    if (!listaExibida || listaExibida.length === 0) {
        showToast('Nenhum dado para exportar na Curva ABC!', 'error');
        return;
    }

    let csv = '';
    if (isProdutos) {
        csv = 'Posição;Classe ABC;Descrição do Produto;Código;Qtd. Vendida;Unidade;Valor Total Vendido (R$);Participação (%);Acumulado (%)\n';
        listaExibida.forEach((p, idx) => {
            const linha = [
                idx + 1,
                p.classe,
                `"${(p.descricao || '').replace(/"/g, '""')}"`,
                `"${(p.codigo || '').replace(/"/g, '""')}"`,
                p.qtdVendida,
                p.unidade || 'UN',
                p.valorTotal.toFixed(2).replace('.', ','),
                p.percentualIndividual.toFixed(2).replace('.', ','),
                p.percentualAcumulado.toFixed(2).replace('.', ',')
            ].join(';');
            csv += linha + '\n';
        });
    } else {
        csv = 'Posição;Classe ABC;Cliente / Empresa;Código Único;Classificação;Decisor;Cidade;UF;Vendedor;Qtd. Pedidos;Valor Total Faturado (R$);Participação (%);Acumulado (%)\n';
        listaExibida.forEach((c, idx) => {
            const linha = [
                idx + 1,
                c.classe,
                `"${(c.empresa || '').replace(/"/g, '""')}"`,
                `"${(c.codigoUnico || '').replace(/"/g, '""')}"`,
                c.classificacao || 'outros',
                `"${(c.decisor || '').replace(/"/g, '""')}"`,
                `"${(c.cidade || '').replace(/"/g, '""')}"`,
                `"${(c.estado || '').replace(/"/g, '""')}"`,
                `"${(c.vendedorNome || '').replace(/"/g, '""')}"`,
                c.qtdPedidos,
                c.valorTotal.toFixed(2).replace('.', ','),
                c.percentualIndividual.toFixed(2).replace('.', ','),
                c.percentualAcumulado.toFixed(2).replace('.', ',')
            ].join(';');
            csv += linha + '\n';
        });
    }

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Curva_ABC_${isProdutos ? 'Produtos' : 'Clientes'}_${range.label.replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Planilha CSV da Curva ABC gerada com sucesso!');
}

// --------------------------------------------------------------------------
// IMPRESSÃO / PDF DA CURVA ABC
// --------------------------------------------------------------------------
function imprimirRelatorioAbc() {
    const isProdutos = relAbcFiltro.visao === 'produtos';
    const dados = isProdutos ? processarCurvaAbcProdutos() : processarCurvaAbcClientes();
    const { listaExibida, valorGeral, qtdGeral, statsClasse, range } = dados;

    if (!listaExibida || listaExibida.length === 0) {
        showToast('Nenhum dado para imprimir na Curva ABC!', 'error');
        return;
    }

    const marca = (typeof marcaEmpresa !== 'undefined') ? marcaEmpresa : { nome: 'Feitosa CRM' };

    let linhasHtml = '';
    if (isProdutos) {
        linhasHtml = listaExibida.map((p, idx) => `
            <tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td style="text-align:center;font-weight:700;">Classe ${p.classe}</td>
                <td><strong>${p.descricao}</strong></td>
                <td>${p.codigo || '—'}</td>
                <td style="text-align:center;">${p.qtdVendida}</td>
                <td style="text-align:right;">${formatarMoeda(p.valorTotal)}</td>
                <td style="text-align:right;">${p.percentualIndividual.toFixed(2)}%</td>
                <td style="text-align:right;font-weight:700;">${p.percentualAcumulado.toFixed(2)}%</td>
            </tr>
        `).join('');
    } else {
        linhasHtml = listaExibida.map((c, idx) => `
            <tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td style="text-align:center;font-weight:700;">Classe ${c.classe}</td>
                <td><strong>${c.empresa}</strong></td>
                <td>${c.codigoUnico}</td>
                <td>${c.classificacao}</td>
                <td style="text-align:center;">${c.qtdPedidos}</td>
                <td style="text-align:right;">${formatarMoeda(c.valorTotal)}</td>
                <td style="text-align:right;">${c.percentualIndividual.toFixed(2)}%</td>
                <td style="text-align:right;font-weight:700;">${c.percentualAcumulado.toFixed(2)}%</td>
            </tr>
        `).join('');
    }

    const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório de Curva ABC de ${isProdutos ? 'Produtos' : 'Clientes'}</title>
<style>
    body { font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; padding: 24px; color: #1a2332; line-height: 1.4; }
    h1 { font-size: 20px; margin: 0 0 4px; color: #2d4863; }
    .meta { font-size: 11px; color: #64748b; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
    th { background: #f1f5f9; font-weight: 700; color: #334155; }
    tr:nth-child(even) { background: #f8fafc; }
    tfoot td { font-weight: 700; background: #e2e8f0; }
    .grid-kpi { display: flex; gap: 14px; margin-bottom: 16px; }
    .card-kpi { border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; flex: 1; background: #fafafa; }
    .card-kpi strong { display: block; font-size: 15px; margin-top: 4px; color: #2d4863; }
    @media print { body { padding: 0; } @page { margin: 1cm; size: landscape; } }
</style>
</head><body>
    <h1>Curva ABC de ${isProdutos ? 'Produtos (SKUs)' : 'Clientes'} — ${marca.nome || 'CRM'}</h1>
    ${marca.cnpj ? `<div class="meta">CNPJ: ${marca.cnpj}</div>` : ''}
    <div class="meta">
        Período: <strong>${range.label}</strong> • Classificação: <strong>${relAbcFiltro.classificacao || 'Todas'}</strong> • Gerado em ${formatarData(hoje())} às ${new Date().toTimeString().slice(0, 5)}
    </div>

    <div class="grid-kpi">
        <div class="card-kpi" style="border-left:4px solid #137333;"><span>Classe A (Até 80%)</span><strong>${formatarMoeda(statsClasse.A.valor)} (${statsClasse.A.pctValor.toFixed(1)}%)</strong><small>${statsClasse.A.count} itens</small></div>
        <div class="card-kpi" style="border-left:4px solid #b06000;"><span>Classe B (80% a 95%)</span><strong>${formatarMoeda(statsClasse.B.valor)} (${statsClasse.B.pctValor.toFixed(1)}%)</strong><small>${statsClasse.B.count} itens</small></div>
        <div class="card-kpi" style="border-left:4px solid #5f6368;"><span>Classe C (95% a 100%)</span><strong>${formatarMoeda(statsClasse.C.valor)} (${statsClasse.C.pctValor.toFixed(1)}%)</strong><small>${statsClasse.C.count} itens</small></div>
        <div class="card-kpi"><span>Faturamento Geral</span><strong style="color:#065f46;">${formatarMoeda(valorGeral)}</strong><small>${qtdGeral} unidades</small></div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:35px;text-align:center;">#</th>
                <th style="width:70px;text-align:center;">Classe</th>
                <th>${isProdutos ? 'Descrição do Produto' : 'Cliente / Razão Social'}</th>
                <th>${isProdutos ? 'Código' : 'Código Único'}</th>
                <th>${isProdutos ? 'Qtd. Vendida' : 'Classificação'}</th>
                <th style="text-align:center;">${isProdutos ? 'Volume' : 'Qtd. Pedidos'}</th>
                <th style="text-align:right;">Faturamento Total</th>
                <th style="text-align:right;">Part. (%)</th>
                <th style="text-align:right;">Acumulado (%)</th>
            </tr>
        </thead>
        <tbody>${linhasHtml}</tbody>
        <tfoot>
            <tr>
                <td colspan="6" style="text-align:right;">TOTAL LISTADO:</td>
                <td style="text-align:right;">${formatarMoeda(listaExibida.reduce((acc, x) => acc + x.valorTotal, 0))}</td>
                <td style="text-align:right;">${listaExibida.reduce((acc, x) => acc + x.percentualIndividual, 0).toFixed(1)}%</td>
                <td></td>
            </tr>
        </tfoot>
    </table>
</body></html>`;

    if (typeof imprimirRelatorioHtmlSeguro === 'function') {
        imprimirRelatorioHtmlSeguro(html, `Relatório de Curva ABC de ${isProdutos ? 'Produtos' : 'Clientes'} - ${new Date().toLocaleDateString('pt-BR')}`);
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
window.relAbcFiltro = relAbcFiltro;
window.renderizarRelatorioAbc = renderizarRelatorioAbc;
window.mudarVisaoAbc = mudarVisaoAbc;
window.mudarMetricaAbc = mudarMetricaAbc;
window.mudarPeriodoAbcRapido = mudarPeriodoAbcRapido;
window.mudarOffsetAbc = mudarOffsetAbc;
window.aplicarFiltroAbcPersonalizado = aplicarFiltroAbcPersonalizado;
window.mudarFiltrosAbcPainel = mudarFiltrosAbcPainel;
window.filtrarClasseAbcRapido = filtrarClasseAbcRapido;
window.exportarCsvAbc = exportarCsvAbc;
window.imprimirRelatorioAbc = imprimirRelatorioAbc;

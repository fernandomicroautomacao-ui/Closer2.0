// ==========================================================================
// RELATÓRIO: CONFRONTO DE ORÇAMENTOS x PEDIDOS DE VENDA POR CNPJ
// Valores absolutos acumulados (sem periodicidade temporal).
// Confronto direto entre Valor Orçado e Pedido de Venda Efetivado.
// ==========================================================================

const relConfrontoFiltro = {
    visao: 'consolidado', // 'consolidado' (por CNPJ) ou 'linha_a_linha' (orçamento a orçamento)
    statusConfronto: '', // '' (todos), 'fechado', 'aberto', 'perdido', 'divergencia'
    vendedorId: '',
    classificacao: '',
    busca: '',
    ordenacao: 'orcamentoValorDesc' // 'orcamentoValorDesc', 'pedidoValorDesc', 'saldoDesc', 'conversaoDesc', 'nomeAsc'
};

// Objeto de cache para exportação CSV e impressão PDF
let relConfrontoCache = null;
let relConfrontoDetalheChave = null;

// --------------------------------------------------------------------------
// AUXILIARES DE CNPJ E FORMATAÇÃO
// --------------------------------------------------------------------------
function extrairCnpjDeLead(lead) {
    if (!lead) return '';
    const cnpjsIgnorar = typeof obterCnpjsEmissorParaIgnorar === 'function' ? obterCnpjsEmissorParaIgnorar() : new Set();

    let val = lead.cnpj || '';
    let valDig = apenasDigitosCnpj(val);
    if (valDig && cnpjsIgnorar.has(valDig)) {
        val = '';
        valDig = '';
    }

    if (!val && lead.orcamentoPdfPrincipal?.dadosExtraidos?.clienteCnpj) {
        const cPdf = lead.orcamentoPdfPrincipal.dadosExtraidos.clienteCnpj;
        const cPdfDig = apenasDigitosCnpj(cPdf);
        if (!cnpjsIgnorar.has(cPdfDig)) {
            val = cPdf;
            valDig = cPdfDig;
        }
    }
    if (!val && lead.codigoUnico) {
        const apenasNum = String(lead.codigoUnico).replace(/\D/g, '');
        if ((apenasNum.length === 14 || apenasNum.length === 11) && !cnpjsIgnorar.has(apenasNum)) {
            val = lead.codigoUnico;
        }
    }
    return String(val || '').trim();
}

function apenasDigitosCnpj(cnpj) {
    return String(cnpj || '').replace(/\D/g, '');
}

function formatarCnpjVisual(cnpj) {
    if (!cnpj) return '—';
    const d = apenasDigitosCnpj(cnpj);
    if (d.length === 14) {
        return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
    }
    if (d.length === 11) {
        return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
    }
    return cnpj;
}

// --------------------------------------------------------------------------
// PROCESSAMENTO EM VALORES ABSOLUTOS (CONFRONTO ORÇAMENTO x PEDIDO)
// --------------------------------------------------------------------------
function processarDadosConfrontoAbsoluto() {
    const leadsBase = (typeof getLeadsRelatorio === 'function' ? getLeadsRelatorio() : (leads || []));
    const perdidosBase = (typeof getPerdidosRelatorio === 'function' ? getPerdidosRelatorio() : (perdidos || []));

    const listaConfrontosLinha = [];
    const mapaCnpjs = new Map();

    const getRegistroCnpj = (chave, leadOuPerdido) => {
        if (!mapaCnpjs.has(chave)) {
            const cnpjBruto = extrairCnpjDeLead(leadOuPerdido);
            const cnpjDigitos = apenasDigitosCnpj(cnpjBruto);
            const temCnpjValido = cnpjDigitos.length === 14 || cnpjDigitos.length === 11;
            const cnpjFormatado = temCnpjValido ? formatarCnpjVisual(cnpjDigitos) : (cnpjBruto || 'Não informado');

            const vendedor = (typeof usuarios !== 'undefined' && leadOuPerdido.usuarioId)
                ? usuarios.find(u => u.id === leadOuPerdido.usuarioId)
                : null;

            mapaCnpjs.set(chave, {
                chave,
                cnpjFormatado,
                cnpjDigitos,
                temCnpjValido,
                empresa: (leadOuPerdido.empresa || 'Cliente sem nome').trim(),
                decisor: leadOuPerdido.decisor || '—',
                telefone: leadOuPerdido.telefone || leadOuPerdido.whatsapp || '',
                whatsapp: leadOuPerdido.whatsapp || leadOuPerdido.telefone || '',
                email: leadOuPerdido.email || '',
                cidade: leadOuPerdido.cidade || '',
                estado: leadOuPerdido.estado || '',
                classificacao: leadOuPerdido.classificacao || 'outros',
                vendedorId: leadOuPerdido.usuarioId || '',
                vendedorNome: vendedor ? vendedor.nome : 'Geral / Não atribuído',
                totalOrcamentosQtd: 0,
                totalOrcamentosValor: 0,
                totalPedidosQtd: 0,
                totalPedidosValor: 0,
                saldoAbsoluto: 0,
                taxaEfetivacao: 0,
                itensConfronto: []
            });
        }
        return mapaCnpjs.get(chave);
    };

    // 1. Processar LEADS ATIVOS / EM ANDAMENTO / PEDIDOS
    leadsBase.forEach(lead => {
        // Filtro de Vendedor
        if (relConfrontoFiltro.vendedorId && lead.usuarioId !== relConfrontoFiltro.vendedorId) {
            return;
        }
        // Filtro de Classificação
        if (relConfrontoFiltro.classificacao && (lead.classificacao || 'outros') !== relConfrontoFiltro.classificacao) {
            return;
        }

        // Extrair Pedido
        const ehPedido = (lead.etapa === 'pedido');
        const pedNumero = ehPedido
            ? (lead.numeroPedido || (lead.pedidos?.[0]?.numero) || `PED-${lead.id.slice(0, 6).toUpperCase()}`)
            : '—';
        const pedData = ehPedido
            ? ((lead.dataPedido || lead.dataEntradaPedido || lead.dataCriacao || '').split('T')[0] || '—')
            : '—';
        const pedValor = ehPedido
            ? Number(lead.valor || (lead.pedidos?.[0]?.valor) || 0)
            : 0;

        // Extrair Orçamento
        const orcNumero = lead.numeroOrcamento || (lead.orcamentoPdfPrincipal?.dadosExtraidos?.numeroOrcamento) || `ORC-${lead.id.slice(0, 6).toUpperCase()}`;
        const orcData = (lead.dataCriacao || '').split('T')[0] || '—';
        let orcValor = Number(lead.valor || (lead.orcamentoPdfPrincipal?.dadosExtraidos?.totalComImpostos) || 0);
        const orcItensQtd = (Array.isArray(lead.itens) && lead.itens.length > 0)
            ? lead.itens.length
            : ((lead.orcamentoPdfPrincipal?.dadosExtraidos?.itens || []).length);
        const pedItensQtd = ehPedido
            ? ((lead.itens && lead.itens.length) || (lead.pedidos?.[0]?.itens) || orcItensQtd || 0)
            : 0;

        // Se for pedido mas orcValor veio 0, o valor orçado original corresponde ao valor do pedido
        if (ehPedido && orcValor <= 0 && pedValor > 0) {
            orcValor = pedValor;
        }

        // =========================================================================
        // REGRA DE ELIMINAÇÃO: Quem tem zero reais em cotações NÃO entra no relatório!
        // Descarta cards com valor zero e descarta etapas iniciais que não têm proposta comercial
        // =========================================================================
        if (orcValor <= 0 && pedValor <= 0) {
            return;
        }

        const temOrcamentoFormal = (lead.etapa === 'orcamento') ||
            Boolean(lead.numeroOrcamento) ||
            Boolean(lead.orcamentoPdfPrincipal) ||
            (Array.isArray(lead.itens) && lead.itens.length > 0);

        if (!ehPedido && !temOrcamentoFormal && lead.etapa !== 'orcamento') {
            return;
        }

        const cnpjBruto = extrairCnpjDeLead(lead);
        const cnpjDigitos = apenasDigitosCnpj(cnpjBruto);
        const chaveCnpj = (cnpjDigitos && (cnpjDigitos.length === 14 || cnpjDigitos.length === 11))
            ? `CNPJ:${cnpjDigitos}`
            : `NOME:${(lead.empresa || lead.id || '').trim().toLowerCase()}`;

        const regCnpj = getRegistroCnpj(chaveCnpj, lead);

        if (lead.empresa && lead.empresa.length > regCnpj.empresa.length) regCnpj.empresa = lead.empresa;
        if (!regCnpj.cidade && lead.cidade) regCnpj.cidade = lead.cidade;
        if (!regCnpj.estado && lead.estado) regCnpj.estado = lead.estado;
        if (!regCnpj.whatsapp && lead.whatsapp) regCnpj.whatsapp = lead.whatsapp;
        if ((!regCnpj.decisor || regCnpj.decisor === '—') && lead.decisor) regCnpj.decisor = lead.decisor;

        // Confronto Financeiro Absoluto
        const diferencaValor = pedValor - orcValor;
        const taxaConversao = orcValor > 0 ? Math.round((pedValor / orcValor) * 100) : (pedValor > 0 ? 100 : 0);

        let statusTipo = 'aberto';
        let statusRotulo = '🔵 Orçamento em Aberto';
        let statusCor = '#0b57d0';
        let statusBg = '#e8f0fe';

        if (ehPedido) {
            if (Math.abs(diferencaValor) < 0.01) {
                statusTipo = 'fechado';
                statusRotulo = '🟢 Pedido Fechado (100%)';
                statusCor = '#137333';
                statusBg = '#e6f4ea';
            } else if (diferencaValor < 0) {
                statusTipo = 'divergencia';
                statusRotulo = '🟡 Fechado com Desconto';
                statusCor = '#b06000';
                statusBg = '#fef7e0';
            } else {
                statusTipo = 'divergencia';
                statusRotulo = '🟢 Fechado com Acréscimo';
                statusCor = '#137333';
                statusBg = '#e6f4ea';
            }
        } else {
            statusTipo = 'aberto';
            statusRotulo = '🔵 Orçamento em Aberto';
            statusCor = '#0b57d0';
            statusBg = '#e8f0fe';
        }

        const itemConfronto = {
            id: lead.id,
            leadId: lead.id,
            chaveCnpj,
            empresa: regCnpj.empresa,
            cnpjFormatado: regCnpj.cnpjFormatado,
            cnpjDigitos: regCnpj.cnpjDigitos,
            cidade: regCnpj.cidade,
            estado: regCnpj.estado,
            vendedorNome: regCnpj.vendedorNome,
            classificacao: regCnpj.classificacao,
            decisor: regCnpj.decisor,
            whatsapp: regCnpj.whatsapp,
            // Orçamento
            orcNumero,
            orcData,
            orcValor,
            orcItensQtd,
            // Pedido de Venda
            ehPedido,
            pedNumero,
            pedData,
            pedValor,
            pedItensQtd,
            // Confronto
            diferencaValor,
            taxaConversao,
            statusTipo,
            statusRotulo,
            statusCor,
            statusBg
        };

        listaConfrontosLinha.push(itemConfronto);
        regCnpj.itensConfronto.push(itemConfronto);

        // Apenas computa como cotação se orcValor for maior que zero
        if (orcValor > 0) {
            regCnpj.totalOrcamentosQtd += 1;
            regCnpj.totalOrcamentosValor += orcValor;
        }

        if (ehPedido && pedValor > 0) {
            regCnpj.totalPedidosQtd += 1;
            regCnpj.totalPedidosValor += pedValor;
        }

        // Se houver pedidos adicionais de recompra gravados em lead.pedidos
        // CORREÇÃO CRÍTICA: Recompras são PEDIDOS fechados, e NÃO novas cotações!
        // Não incrementam totalOrcamentosQtd para não inflar a contagem de cotações da empresa.
        if (Array.isArray(lead.pedidos) && lead.pedidos.length > 1) {
            for (let i = 1; i < lead.pedidos.length; i++) {
                const pedExtra = lead.pedidos[i];
                const pedExtraVal = Number(pedExtra.valor || 0);
                if (pedExtraVal <= 0) continue; // Ignora se for R$ 0,00

                regCnpj.totalPedidosQtd += 1;
                regCnpj.totalPedidosValor += pedExtraVal;

                // Registra histórico de recompra nos detalhes do cliente
                regCnpj.itensConfronto.push({
                    id: `${lead.id}_rec_${i}`,
                    leadId: lead.id,
                    chaveCnpj,
                    empresa: regCnpj.empresa,
                    cnpjFormatado: regCnpj.cnpjFormatado,
                    cnpjDigitos: regCnpj.cnpjDigitos,
                    cidade: regCnpj.cidade,
                    estado: regCnpj.estado,
                    vendedorNome: regCnpj.vendedorNome,
                    classificacao: regCnpj.classificacao,
                    decisor: regCnpj.decisor,
                    whatsapp: regCnpj.whatsapp,
                    orcNumero: `Pedido Adicional / Recompra #${i}`,
                    orcData: pedExtra.data || orcData,
                    orcValor: pedExtraVal,
                    orcItensQtd: pedExtra.itens || 1,
                    ehPedido: true,
                    pedNumero: pedExtra.numero || `PED-REC-${i}`,
                    pedData: pedExtra.data || hoje(),
                    pedValor: pedExtraVal,
                    pedItensQtd: pedExtra.itens || 1,
                    diferencaValor: 0,
                    taxaConversao: 100,
                    statusTipo: 'fechado',
                    statusRotulo: '📦 Pedido de Recompra',
                    statusCor: '#137333',
                    statusBg: '#e6f4ea'
                });
            }
        }
    });

    // 2. Processar CARDS PERDIDOS (Orçamentos que não viraram pedido)
    perdidosBase.forEach(p => {
        if (relConfrontoFiltro.vendedorId && p.usuarioId !== relConfrontoFiltro.vendedorId) return;
        if (relConfrontoFiltro.classificacao && (p.classificacao || 'outros') !== relConfrontoFiltro.classificacao) return;

        const orcValor = Number(p.valor || 0);
        // ELIMINAR ZERO REAIS: Apenas orçamentos com valor real positivo entram
        if (orcValor <= 0) return;

        // Descarta descartes de prospecção sem proposta
        if (p.etapaOrigem && p.etapaOrigem !== 'orcamento' && p.etapaOrigem !== 'pedido' && (!p.itens || p.itens.length === 0)) {
            return;
        }

        const cnpjBruto = extrairCnpjDeLead(p);
        const cnpjDigitos = apenasDigitosCnpj(cnpjBruto);
        const chaveCnpj = (cnpjDigitos && (cnpjDigitos.length === 14 || cnpjDigitos.length === 11))
            ? `CNPJ:${cnpjDigitos}`
            : `NOME:${(p.empresa || p.id || '').trim().toLowerCase()}`;

        const regCnpj = getRegistroCnpj(chaveCnpj, p);

        const orcNumero = `PERD-${p.id.slice(0, 6).toUpperCase()}`;
        const orcData = (p.dataExclusao || p.dataCriacao || '').split('T')[0] || '—';
        const orcItensQtd = (p.itens || []).length;

        const itemPerdido = {
            id: p.id,
            leadId: p.id,
            chaveCnpj,
            empresa: regCnpj.empresa,
            cnpjFormatado: regCnpj.cnpjFormatado,
            cnpjDigitos: regCnpj.cnpjDigitos,
            cidade: regCnpj.cidade,
            estado: regCnpj.estado,
            vendedorNome: regCnpj.vendedorNome,
            classificacao: regCnpj.classificacao,
            decisor: regCnpj.decisor,
            whatsapp: regCnpj.whatsapp,
            orcNumero,
            orcData,
            orcValor,
            orcItensQtd,
            ehPedido: false,
            pedNumero: '—',
            pedData: '—',
            pedValor: 0,
            pedItensQtd: 0,
            diferencaValor: -orcValor,
            taxaConversao: 0,
            statusTipo: 'perdido',
            statusRotulo: `🔴 Perdido: ${p.motivo || 'Descarte'}${p.motivoDetalhe ? ' (' + p.motivoDetalhe + ')' : ''}`,
            statusCor: '#c5221f',
            statusBg: '#fce8e6'
        };

        listaConfrontosLinha.push(itemPerdido);
        regCnpj.itensConfronto.push(itemPerdido);

        regCnpj.totalOrcamentosQtd += 1;
        regCnpj.totalOrcamentosValor += orcValor;
    });

    // 3. Consolidar métricas de cada CNPJ e ELIMINAR quem tem zero reais em cotações
    let listaCnpjsConsolidados = Array.from(mapaCnpjs.values()).filter(reg => {
        // REGRA DE ELIMINAÇÃO: Se a empresa tem zero reais em cotações acumuladas, ELIMINAR DO RELATÓRIO!
        return reg.totalOrcamentosValor > 0;
    });

    // Garante que listaConfrontosLinha só contenha itens com orcValor > 0
    let listaLinhasValidas = listaConfrontosLinha.filter(l => l.orcValor > 0);
    listaCnpjsConsolidados.forEach(reg => {
        reg.saldoAbsoluto = reg.totalPedidosValor - reg.totalOrcamentosValor;
        reg.taxaEfetivacao = reg.totalOrcamentosValor > 0
            ? Math.round((reg.totalPedidosValor / reg.totalOrcamentosValor) * 100)
            : (reg.totalPedidosValor > 0 ? 100 : 0);

        if (reg.totalPedidosQtd > 0 && reg.totalPedidosValor >= reg.totalOrcamentosValor) {
            reg.statusGeralRotulo = '🟢 100% Convertido / Fiel';
            reg.statusGeralCor = '#137333';
            reg.statusGeralBg = '#e6f4ea';
        } else if (reg.totalPedidosQtd > 0) {
            reg.statusGeralRotulo = '🟡 Parcialmente Convertido';
            reg.statusGeralCor = '#b06000';
            reg.statusGeralBg = '#fef7e0';
        } else if (reg.itensConfronto.some(it => it.statusTipo === 'perdido')) {
            reg.statusGeralRotulo = '🔴 Orçamentos Perdidos';
            reg.statusGeralCor = '#c5221f';
            reg.statusGeralBg = '#fce8e6';
        } else {
            reg.statusGeralRotulo = '🔵 Orçamento em Aberto';
            reg.statusGeralCor = '#0b57d0';
            reg.statusGeralBg = '#e8f0fe';
        }
    });

    // 4. APLICAR FILTROS (STATUS E BUSCA)
    let cnpjsFiltrados = listaCnpjsConsolidados;
    let linhasFiltradas = listaLinhasValidas;

    // Filtro por Status do Confronto
    if (relConfrontoFiltro.statusConfronto) {
        const st = relConfrontoFiltro.statusConfronto;
        linhasFiltradas = linhasFiltradas.filter(l => {
            if (st === 'fechado') return l.ehPedido;
            if (st === 'aberto') return l.statusTipo === 'aberto';
            if (st === 'perdido') return l.statusTipo === 'perdido';
            if (st === 'divergencia') return l.statusTipo === 'divergencia' || (l.ehPedido && Math.abs(l.diferencaValor) > 0.01);
            return true;
        });

        cnpjsFiltrados = cnpjsFiltrados.filter(c => {
            if (st === 'fechado') return c.totalPedidosQtd > 0;
            if (st === 'aberto') return c.itensConfronto.some(it => it.statusTipo === 'aberto');
            if (st === 'perdido') return c.itensConfronto.some(it => it.statusTipo === 'perdido');
            if (st === 'divergencia') return c.itensConfronto.some(it => it.statusTipo === 'divergencia');
            return true;
        });
    }

    // Filtro de Busca Textual
    if (relConfrontoFiltro.busca) {
        const termo = relConfrontoFiltro.busca.toLowerCase().trim();
        linhasFiltradas = linhasFiltradas.filter(l =>
            l.empresa.toLowerCase().includes(termo) ||
            l.cnpjFormatado.toLowerCase().includes(termo) ||
            l.cnpjDigitos.includes(termo) ||
            l.orcNumero.toLowerCase().includes(termo) ||
            l.pedNumero.toLowerCase().includes(termo) ||
            l.cidade.toLowerCase().includes(termo) ||
            l.decisor.toLowerCase().includes(termo)
        );

        cnpjsFiltrados = cnpjsFiltrados.filter(c =>
            c.empresa.toLowerCase().includes(termo) ||
            c.cnpjFormatado.toLowerCase().includes(termo) ||
            c.cnpjDigitos.includes(termo) ||
            c.cidade.toLowerCase().includes(termo) ||
            c.decisor.toLowerCase().includes(termo)
        );
    }

    // 5. ORDENAÇÃO
    const sortConsolidado = (a, b) => {
        switch (relConfrontoFiltro.ordenacao) {
            case 'orcamentoValorDesc':
                return b.totalOrcamentosValor - a.totalOrcamentosValor;
            case 'pedidoValorDesc':
                return b.totalPedidosValor - a.totalPedidosValor;
            case 'saldoDesc':
                return b.saldoAbsoluto - a.saldoAbsoluto;
            case 'conversaoDesc':
                return b.taxaEfetivacao - a.taxaEfetivacao;
            case 'nomeAsc':
                return a.empresa.localeCompare(b.empresa);
            default:
                return b.totalOrcamentosValor - a.totalOrcamentosValor;
        }
    };

    const sortLinhas = (a, b) => {
        switch (relConfrontoFiltro.ordenacao) {
            case 'orcamentoValorDesc':
                return b.orcValor - a.orcValor;
            case 'pedidoValorDesc':
                return b.pedValor - a.pedValor;
            case 'saldoDesc':
                return b.diferencaValor - a.diferencaValor;
            case 'conversaoDesc':
                return b.taxaConversao - a.taxaConversao;
            case 'nomeAsc':
                return a.empresa.localeCompare(b.empresa);
            default:
                return b.orcValor - a.orcValor;
        }
    };

    cnpjsFiltrados.sort(sortConsolidado);
    linhasFiltradas.sort(sortLinhas);

    // 6. TOTAIS ABSOLUTOS GERAIS
    const totaisAbsolutos = {
        totalCnpjs: listaCnpjsConsolidados.length,
        totalOrcamentosQtd: listaLinhasValidas.length,
        totalOrcamentosValor: listaLinhasValidas.reduce((acc, l) => acc + l.orcValor, 0),
        totalPedidosQtd: listaLinhasValidas.filter(l => l.ehPedido).length,
        totalPedidosValor: listaLinhasValidas.filter(l => l.ehPedido).reduce((acc, l) => acc + l.pedValor, 0),
        totalAbertosValor: listaLinhasValidas.filter(l => l.statusTipo === 'aberto').reduce((acc, l) => acc + l.orcValor, 0),
        totalPerdidosValor: listaLinhasValidas.filter(l => l.statusTipo === 'perdido').reduce((acc, l) => acc + l.orcValor, 0)
    };

    totaisAbsolutos.saldoAbsoluto = totaisAbsolutos.totalPedidosValor - totaisAbsolutos.totalOrcamentosValor;
    totaisAbsolutos.taxaEfetivacaoGeral = totaisAbsolutos.totalOrcamentosValor > 0
        ? Math.round((totaisAbsolutos.totalPedidosValor / totaisAbsolutos.totalOrcamentosValor) * 100)
        : (totaisAbsolutos.totalPedidosValor > 0 ? 100 : 0);

    relConfrontoCache = {
        totaisAbsolutos,
        cnpjsConsolidados: cnpjsFiltrados,
        linhasConfronto: linhasFiltradas,
        todosCnpjs: listaCnpjsConsolidados,
        todasLinhas: listaLinhasValidas
    };

    return relConfrontoCache;
}

// --------------------------------------------------------------------------
// RENDERIZAÇÃO NA TELA
// --------------------------------------------------------------------------
function renderizarRelatorioFrequenciaCnpj() {
    const container = document.getElementById('relFrequenciaCnpjPainel');
    if (!container) return;

    popularFiltroVendedorConfronto();

    const dados = processarDadosConfrontoAbsoluto();
    const { totaisAbsolutos, cnpjsConsolidados, linhasConfronto } = dados;

    // 1. CARDS DE KPIS EM VALORES ABSOLUTOS
    const htmlKpis = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px;">
            <!-- Total Orçado Absoluto -->
            <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-size:11px;font-weight:700;color:#0b57d0;text-transform:uppercase;letter-spacing:0.5px;">📑 Total Orçado (Absoluto)</span>
                    <span style="font-size:15px;">📝</span>
                </div>
                <div style="font-size:20px;font-weight:800;color:#0b57d0;margin-bottom:2px;">
                    ${formatarMoeda(totaisAbsolutos.totalOrcamentosValor)}
                </div>
                <div style="font-size:11.5px;color:var(--text-muted);">
                    <strong>${totaisAbsolutos.totalOrcamentosQtd}</strong> propostas emitidas no CRM
                </div>
            </div>

            <!-- Total Pedidos de Venda -->
            <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-size:11px;font-weight:700;color:#137333;text-transform:uppercase;letter-spacing:0.5px;">💰 Pedidos de Venda Fechados</span>
                    <span style="font-size:15px;">📦</span>
                </div>
                <div style="font-size:20px;font-weight:800;color:#137333;margin-bottom:2px;">
                    ${formatarMoeda(totaisAbsolutos.totalPedidosValor)}
                </div>
                <div style="font-size:11.5px;color:var(--text-muted);">
                    <strong>${totaisAbsolutos.totalPedidosQtd}</strong> pedidos faturados
                </div>
            </div>

            <!-- Taxa de Efetivação / Conversão -->
            <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-size:11px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;">🎯 Taxa de Efetivação</span>
                    <span style="font-size:15px;">📈</span>
                </div>
                <div style="font-size:20px;font-weight:800;color:var(--text-primary);margin-bottom:2px;">
                    ${totaisAbsolutos.taxaEfetivacaoGeral}%
                </div>
                <div style="font-size:11.5px;color:var(--text-muted);">
                    Do valor orçado convertido em pedido
                </div>
            </div>

            <!-- Saldo Confrontado -->
            <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-size:11px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;">⚖️ Saldo do Confronto</span>
                    <span style="font-size:15px;">📊</span>
                </div>
                <div style="font-size:20px;font-weight:800;color:${totaisAbsolutos.saldoAbsoluto >= 0 ? '#137333' : '#b06000'};margin-bottom:2px;">
                    ${formatarMoeda(totaisAbsolutos.saldoAbsoluto)}
                </div>
                <div style="font-size:11.5px;color:var(--text-muted);">
                    Pedidos (-) Orçamentos totais
                </div>
            </div>

            <!-- Orçamentos em Aberto -->
            <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-size:11px;font-weight:700;color:#b06000;text-transform:uppercase;letter-spacing:0.5px;">⏳ Orçamentos em Aberto</span>
                    <span style="font-size:15px;">⏱️</span>
                </div>
                <div style="font-size:20px;font-weight:800;color:#b06000;margin-bottom:2px;">
                    ${formatarMoeda(totaisAbsolutos.totalAbertosValor)}
                </div>
                <div style="font-size:11.5px;color:var(--text-muted);">
                    Volume ainda em negociação
                </div>
            </div>
        </div>
    `;

    // 2. CONTEÚDO DA TABELA: CONSOLIDADO POR CNPJ OU LINHA A LINHA
    let htmlTabela = '';

    if (relConfrontoFiltro.visao === 'consolidado') {
        // VISÃO CONSOLIDADA POR CLIENTE / CNPJ
        if (cnpjsConsolidados.length === 0) {
            htmlTabela = `
                <div class="empty-state" style="padding:40px 20px;text-align:center;background:var(--bg-card);border-radius:var(--radius);border:1px dashed var(--border-color);">
                    <div style="font-size:32px;margin-bottom:8px;">🏢</div>
                    <h4 style="margin:0 0 6px 0;color:var(--text-primary);">Nenhum cliente/CNPJ encontrado com os filtros aplicados</h4>
                    <p class="text-sm text-muted">Ajuste o termo de busca ou limpe o filtro de status.</p>
                </div>
            `;
        } else {
            htmlTabela = `
                <div class="table-wrapper" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);overflow:hidden;">
                    <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
                        <thead>
                            <tr style="background:var(--bg-input,#f8fafc);border-bottom:2px solid var(--border-color);text-align:left;">
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);">CNPJ / Documento</th>
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);">Empresa / Cliente</th>
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);text-align:right;">Valor Orçado (R$)</th>
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);text-align:right;">Pedido de Venda (R$)</th>
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);text-align:right;">Diferença / Saldo</th>
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);text-align:center;">Efetivação (%)</th>
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);text-align:center;">Situação</th>
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);text-align:right;">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cnpjsConsolidados.map((r, idx) => {
                                const saldoCor = r.saldoAbsoluto >= 0 ? '#137333' : '#b06000';
                                const linkCnpja = r.cnpjDigitos && r.cnpjDigitos.length === 14
                                    ? `https://cnpja.com/office/${r.cnpjDigitos}`
                                    : null;

                                return `
                                    <tr style="border-bottom:1px solid var(--border-color);background:${idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)'};">
                                        <!-- CNPJ -->
                                        <td style="padding:10px 12px;white-space:nowrap;">
                                            <div style="display:flex;align-items:center;gap:6px;">
                                                <strong style="font-family:monospace;font-size:12px;color:var(--text-primary);">${r.cnpjFormatado}</strong>
                                                ${r.temCnpjValido ? `
                                                    <button type="button" class="btn btn-outline btn-xs" style="padding:1px 5px;height:19px;font-size:10px;" onclick="copiarTexto('${r.cnpjFormatado}', 'CNPJ copiado!')" title="Copiar CNPJ">📋</button>
                                                ` : ''}
                                                ${linkCnpja ? `
                                                    <a href="${linkCnpja}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-xs" style="padding:1px 5px;height:19px;font-size:10px;text-decoration:none;" title="Consultar no CNPJá">🔍</a>
                                                ` : ''}
                                            </div>
                                            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                                                Resp: <span>${r.vendedorNome}</span>
                                            </div>
                                        </td>

                                        <!-- Empresa -->
                                        <td style="padding:10px 12px;">
                                            <div style="font-weight:700;color:var(--text-primary);font-size:13px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                                ${r.empresa}
                                            </div>
                                            <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">
                                                <span>${r.cidade ? `${r.cidade}/${r.estado || 'BR'}` : 'Local não informado'}</span>
                                                ${r.decisor && r.decisor !== '—' ? ` · Contato: <strong>${r.decisor}</strong>` : ''}
                                            </div>
                                        </td>

                                        <!-- Valor Orçado -->
                                        <td style="padding:10px 12px;text-align:right;white-space:nowrap;">
                                            <div style="font-weight:800;font-size:13.5px;color:#0b57d0;">
                                                ${formatarMoeda(r.totalOrcamentosValor)}
                                            </div>
                                            <div style="font-size:10.5px;color:var(--text-muted);">
                                                ${r.totalOrcamentosQtd} cotação(ões)
                                            </div>
                                        </td>

                                        <!-- Pedido de Venda -->
                                        <td style="padding:10px 12px;text-align:right;white-space:nowrap;">
                                            <div style="font-weight:800;font-size:13.5px;color:${r.totalPedidosValor > 0 ? '#137333' : 'var(--text-muted)'};">
                                                ${formatarMoeda(r.totalPedidosValor)}
                                            </div>
                                            <div style="font-size:10.5px;color:${r.totalPedidosValor > 0 ? '#137333' : 'var(--text-muted)'};">
                                                ${r.totalPedidosQtd} pedido(s)
                                            </div>
                                        </td>

                                        <!-- Diferença / Saldo -->
                                        <td style="padding:10px 12px;text-align:right;white-space:nowrap;">
                                            <div style="font-weight:700;font-size:13px;color:${saldoCor};">
                                                ${r.saldoAbsoluto > 0 ? '+' : ''}${formatarMoeda(r.saldoAbsoluto)}
                                            </div>
                                            <div style="font-size:10.5px;color:var(--text-muted);">
                                                ${r.saldoAbsoluto === 0 ? 'Equilibrado' : (r.saldoAbsoluto > 0 ? 'Acréscimo' : 'Pendente / Redução')}
                                            </div>
                                        </td>

                                        <!-- Taxa de Efetivação -->
                                        <td style="padding:10px 12px;text-align:center;">
                                            <div style="font-weight:800;font-size:13px;color:${r.taxaEfetivacao >= 80 ? '#137333' : (r.taxaEfetivacao > 0 ? '#b06000' : 'var(--text-muted)')};">
                                                ${r.taxaEfetivacao}%
                                            </div>
                                            <div style="width:65px;height:4px;background:var(--border-color);border-radius:2px;margin:3px auto 0 auto;overflow:hidden;">
                                                <div style="width:${Math.min(100, r.taxaEfetivacao)}%;height:100%;background:${r.taxaEfetivacao >= 80 ? '#137333' : (r.taxaEfetivacao > 0 ? '#f9ab00' : 'transparent')};"></div>
                                            </div>
                                        </td>

                                        <!-- Situação -->
                                        <td style="padding:10px 12px;text-align:center;">
                                            <span style="display:inline-block;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;background:${r.statusGeralBg};color:${r.statusGeralCor};border:1px solid ${r.statusGeralCor}33;white-space:nowrap;">
                                                ${r.statusGeralRotulo}
                                            </span>
                                        </td>

                                        <!-- Ações -->
                                        <td style="padding:10px 12px;text-align:right;white-space:nowrap;">
                                            <button type="button" class="btn btn-outline btn-xs" style="padding:4px 8px;font-weight:600;" onclick="abrirDetalhesCnpj('${encodeURIComponent(r.chave)}')" title="Ver cada cotação confrontada com seu pedido">
                                                👁️ Confrontar Itens
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    } else {
        // VISÃO LINHA A LINHA: CADA ORÇAMENTO CONFRONTADO COM SEU PEDIDO DE VENDA
        if (linhasConfronto.length === 0) {
            htmlTabela = `
                <div class="empty-state" style="padding:40px 20px;text-align:center;background:var(--bg-card);border-radius:var(--radius);border:1px dashed var(--border-color);">
                    <div style="font-size:32px;margin-bottom:8px;">📑</div>
                    <h4 style="margin:0 0 6px 0;color:var(--text-primary);">Nenhum orçamento encontrado</h4>
                    <p class="text-sm text-muted">Ajuste os filtros de status ou busca textual.</p>
                </div>
            `;
        } else {
            htmlTabela = `
                <div class="table-wrapper" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);overflow:hidden;">
                    <table style="width:100%;border-collapse:collapse;font-size:12px;">
                        <thead>
                            <tr style="background:var(--bg-input,#f8fafc);border-bottom:2px solid var(--border-color);text-align:left;">
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);">Empresa / CNPJ</th>
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);">Nº Orçamento</th>
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);text-align:right;">Valor Orçado (R$)</th>
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);">Nº Pedido Venda</th>
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);text-align:right;">Valor Pedido (R$)</th>
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);text-align:right;">Diferença (R$)</th>
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);text-align:center;">Variação / Conversão</th>
                                <th style="padding:10px 12px;font-weight:700;color:var(--text-secondary);text-align:center;">Status do Confronto</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${linhasConfronto.map((l, idx) => {
                                const diffCor = l.ehPedido
                                    ? (Math.abs(l.diferencaValor) < 0.01 ? 'var(--text-secondary)' : (l.diferencaValor > 0 ? '#137333' : '#b06000'))
                                    : 'var(--text-muted)';

                                return `
                                    <tr style="border-bottom:1px solid var(--border-color);background:${idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)'};">
                                        <!-- Empresa / CNPJ -->
                                        <td style="padding:9px 12px;">
                                            <div style="font-weight:700;color:var(--text-primary);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                                ${l.empresa}
                                            </div>
                                            <div style="font-size:10.5px;color:var(--text-muted);font-family:monospace;">
                                                ${l.cnpjFormatado}
                                            </div>
                                        </td>

                                        <!-- Orçamento -->
                                        <td style="padding:9px 12px;white-space:nowrap;">
                                            <strong style="color:#0b57d0;">${l.orcNumero}</strong>
                                            <div style="font-size:10.5px;color:var(--text-muted);">${l.orcData}</div>
                                        </td>

                                        <!-- Valor Orçado -->
                                        <td style="padding:9px 12px;text-align:right;white-space:nowrap;">
                                            <strong style="color:#0b57d0;font-size:13px;">${formatarMoeda(l.orcValor)}</strong>
                                            <div style="font-size:10.5px;color:var(--text-muted);">${l.orcItensQtd} item(ns)</div>
                                        </td>

                                        <!-- Pedido de Venda -->
                                        <td style="padding:9px 12px;white-space:nowrap;">
                                            ${l.ehPedido ? `
                                                <strong style="color:#137333;">${l.pedNumero}</strong>
                                                <div style="font-size:10.5px;color:var(--text-muted);">${l.pedData}</div>
                                            ` : `
                                                <span style="color:var(--text-muted);">— Sem Pedido —</span>
                                            `}
                                        </td>

                                        <!-- Valor Pedido -->
                                        <td style="padding:9px 12px;text-align:right;white-space:nowrap;">
                                            ${l.ehPedido ? `
                                                <strong style="color:#137333;font-size:13px;">${formatarMoeda(l.pedValor)}</strong>
                                                <div style="font-size:10.5px;color:#137333;">Faturado</div>
                                            ` : `
                                                <span style="color:var(--text-muted);font-weight:600;">R$ 0,00</span>
                                            `}
                                        </td>

                                        <!-- Diferença R$ -->
                                        <td style="padding:9px 12px;text-align:right;white-space:nowrap;">
                                            <strong style="color:${diffCor};font-size:12.5px;">
                                                ${l.ehPedido && l.diferencaValor > 0 ? '+' : ''}${formatarMoeda(l.diferencaValor)}
                                            </strong>
                                            <div style="font-size:10px;color:var(--text-muted);">
                                                ${!l.ehPedido ? 'Não faturado' : (Math.abs(l.diferencaValor) < 0.01 ? 'Exato' : (l.diferencaValor > 0 ? 'Acréscimo' : 'Desconto'))}
                                            </div>
                                        </td>

                                        <!-- Variação % -->
                                        <td style="padding:9px 12px;text-align:center;white-space:nowrap;">
                                            <span style="font-weight:800;color:${l.taxaConversao >= 100 ? '#137333' : (l.taxaConversao > 0 ? '#b06000' : 'var(--text-muted)')};">
                                                ${l.taxaConversao}%
                                            </span>
                                        </td>

                                        <!-- Status Confronto -->
                                        <td style="padding:9px 12px;text-align:center;">
                                            <span style="display:inline-block;padding:2px 7px;border-radius:10px;font-size:10.5px;font-weight:700;background:${l.statusBg};color:${l.statusCor};border:1px solid ${l.statusCor}33;white-space:nowrap;">
                                                ${l.statusRotulo}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    container.innerHTML = htmlKpis + htmlTabela;
}

// --------------------------------------------------------------------------
// CONTROLES DE VISÃO E FILTROS
// --------------------------------------------------------------------------
function mudarVisaoConfronto(tipoVisao) {
    relConfrontoFiltro.visao = tipoVisao;

    const btnCons = document.getElementById('btnConfrontoVisaoConsolidado');
    const btnLinhas = document.getElementById('btnConfrontoVisaoLinhas');
    if (btnCons && btnLinhas) {
        if (tipoVisao === 'consolidado') {
            btnCons.className = 'btn btn-primary btn-sm';
            btnLinhas.className = 'btn btn-outline btn-sm';
        } else {
            btnCons.className = 'btn btn-outline btn-sm';
            btnLinhas.className = 'btn btn-primary btn-sm';
        }
    }

    renderizarRelatorioFrequenciaCnpj();
}

function mudarFiltrosFreqCnpjPainel() {
    relConfrontoFiltro.busca = document.getElementById('relFreqCnpjBusca')?.value || '';
    relConfrontoFiltro.vendedorId = document.getElementById('relFreqCnpjFiltroVendedor')?.value || '';
    relConfrontoFiltro.statusConfronto = document.getElementById('relFreqCnpjFiltroStatus')?.value || '';
    relConfrontoFiltro.classificacao = document.getElementById('relFreqCnpjFiltroClassificacao')?.value || '';
    relConfrontoFiltro.ordenacao = document.getElementById('relFreqCnpjOrdenacao')?.value || 'orcamentoValorDesc';
    renderizarRelatorioFrequenciaCnpj();
}

function popularFiltroVendedorConfronto() {
    const select = document.getElementById('relFreqCnpjFiltroVendedor');
    if (!select) return;

    if (typeof usuarioAtual !== 'undefined' && usuarioAtual && usuarioAtual.papel !== 'admin') {
        select.style.display = 'none';
        return;
    }

    select.style.display = 'block';
    const valorAtual = select.value;
    if (typeof usuarios !== 'undefined' && Array.isArray(usuarios) && select.options.length <= 1) {
        select.innerHTML = '<option value="">Todos os vendedores</option>' +
            usuarios.map(u => `<option value="${u.id}">${u.nome}</option>`).join('');
        select.value = valorAtual || relConfrontoFiltro.vendedorId;
    }
}

// --------------------------------------------------------------------------
// MODAL DE DETALHAMENTO DO CLIENTE / CNPJ
// --------------------------------------------------------------------------
function abrirDetalhesCnpj(chaveEncoded) {
    const chave = decodeURIComponent(chaveEncoded);
    relConfrontoDetalheChave = chave;

    const dados = relConfrontoCache || processarDadosConfrontoAbsoluto();
    const cliente = dados.todosCnpjs.find(c => c.chave === chave);
    if (!cliente) {
        if (typeof showToast === 'function') showToast('Cliente não encontrado.', 'error');
        return;
    }

    const modal = document.getElementById('relFreqCnpjDetalhesModal');
    const corpo = document.getElementById('relFreqCnpjDetalhesCorpo');
    if (!modal || !corpo) return;

    const html = `
        <!-- Cabeçalho do Cliente -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;padding-bottom:14px;margin-bottom:16px;border-bottom:1px solid var(--border-color);">
            <div>
                <span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;background:${cliente.statusGeralBg};color:${cliente.statusGeralCor};border:1px solid ${cliente.statusGeralCor}33;margin-bottom:6px;">
                    ${cliente.statusGeralRotulo}
                </span>
                <h3 style="margin:0;font-size:18px;color:var(--text-primary);">${cliente.empresa}</h3>
                <div style="font-size:12.5px;color:var(--text-secondary);display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:4px;">
                    <span>CNPJ: <strong>${cliente.cnpjFormatado}</strong></span>
                    <span>Local: <strong>${cliente.cidade ? `${cliente.cidade}/${cliente.estado}` : 'Não informado'}</strong></span>
                    <span>Vendedor: <strong>${cliente.vendedorNome}</strong></span>
                </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
                ${cliente.whatsapp ? `
                    <a href="https://wa.me/55${cliente.whatsapp.replace(/\D/g, '')}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="color:#25d366;text-decoration:none;">
                        💬 WhatsApp
                    </a>
                ` : ''}
                ${cliente.cnpjDigitos && cliente.cnpjDigitos.length === 14 ? `
                    <a href="https://cnpja.com/office/${cliente.cnpjDigitos}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="text-decoration:none;">
                        🌐 Receita / CNPJá
                    </a>
                ` : ''}
            </div>
        </div>

        <!-- Indicadores Rápidos -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:20px;">
            <div style="background:var(--bg-input,#f8fafc);padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border-color);text-align:center;">
                <div style="font-size:11px;color:var(--text-secondary);font-weight:600;">Total Orçado</div>
                <div style="font-size:17px;font-weight:800;color:#0b57d0;">${formatarMoeda(cliente.totalOrcamentosValor)}</div>
                <div style="font-size:11px;color:var(--text-muted);">${cliente.totalOrcamentosQtd} proposta(s)</div>
            </div>
            <div style="background:var(--bg-input,#f8fafc);padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border-color);text-align:center;">
                <div style="font-size:11px;color:var(--text-secondary);font-weight:600;">Total em Pedidos</div>
                <div style="font-size:17px;font-weight:800;color:#137333;">${formatarMoeda(cliente.totalPedidosValor)}</div>
                <div style="font-size:11px;color:var(--text-muted);">${cliente.totalPedidosQtd} pedido(s)</div>
            </div>
            <div style="background:var(--bg-input,#f8fafc);padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border-color);text-align:center;">
                <div style="font-size:11px;color:var(--text-secondary);font-weight:600;">Saldo Confrontado</div>
                <div style="font-size:17px;font-weight:800;color:${cliente.saldoAbsoluto >= 0 ? '#137333' : '#b06000'};">${formatarMoeda(cliente.saldoAbsoluto)}</div>
                <div style="font-size:11px;color:var(--text-muted);">Pedidos (-) Orçamentos</div>
            </div>
            <div style="background:var(--bg-input,#f8fafc);padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border-color);text-align:center;">
                <div style="font-size:11px;color:var(--text-secondary);font-weight:600;">Efetivação</div>
                <div style="font-size:17px;font-weight:800;color:var(--text-primary);">${cliente.taxaEfetivacao}%</div>
                <div style="font-size:11px;color:var(--text-muted);">Conversão financeira</div>
            </div>
        </div>

        <!-- Tabela Linha a Linha das Cotações deste Cliente -->
        <h4 style="margin:0 0 10px 0;font-size:14px;color:var(--text-primary);">
            ⚖️ Confronto Detalhado das Propostas e Pedidos Deste Cliente
        </h4>
        <div style="max-height:300px;overflow-y:auto;border:1px solid var(--border-color);border-radius:var(--radius-sm);">
            <table style="width:100%;border-collapse:collapse;font-size:11.5px;">
                <thead>
                    <tr style="background:var(--bg-input,#f8fafc);border-bottom:1px solid var(--border-color);text-align:left;">
                        <th style="padding:6px 10px;">Orçamento</th>
                        <th style="padding:6px 10px;text-align:right;">Valor Orçado</th>
                        <th style="padding:6px 10px;">Pedido de Venda</th>
                        <th style="padding:6px 10px;text-align:right;">Valor Pedido</th>
                        <th style="padding:6px 10px;text-align:right;">Diferença R$</th>
                        <th style="padding:6px 10px;text-align:center;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${cliente.itensConfronto.map(it => `
                        <tr style="border-bottom:1px solid var(--border-color);">
                            <td style="padding:7px 10px;">
                                <strong style="color:#0b57d0;">${it.orcNumero}</strong>
                                <div style="font-size:10px;color:var(--text-muted);">${it.orcData}</div>
                            </td>
                            <td style="padding:7px 10px;text-align:right;font-weight:700;color:#0b57d0;">
                                ${formatarMoeda(it.orcValor)}
                            </td>
                            <td style="padding:7px 10px;">
                                ${it.ehPedido ? `
                                    <strong style="color:#137333;">${it.pedNumero}</strong>
                                    <div style="font-size:10px;color:var(--text-muted);">${it.pedData}</div>
                                ` : '<span style="color:var(--text-muted);">— Sem Pedido —</span>'}
                            </td>
                            <td style="padding:7px 10px;text-align:right;font-weight:700;color:${it.ehPedido ? '#137333' : 'var(--text-muted)'};">
                                ${it.ehPedido ? formatarMoeda(it.pedValor) : 'R$ 0,00'}
                            </td>
                            <td style="padding:7px 10px;text-align:right;font-weight:700;color:${it.ehPedido ? (it.diferencaValor >= 0 ? '#137333' : '#b06000') : 'var(--text-muted)'};">
                                ${it.ehPedido && it.diferencaValor > 0 ? '+' : ''}${formatarMoeda(it.diferencaValor)}
                            </td>
                            <td style="padding:7px 10px;text-align:center;">
                                <span style="display:inline-block;padding:2px 6px;border-radius:8px;font-size:10px;font-weight:700;background:${it.statusBg};color:${it.statusCor};">
                                    ${it.statusRotulo}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    corpo.innerHTML = html;
    if (typeof abrirModal === 'function') {
        abrirModal('relFreqCnpjDetalhesModal');
    } else {
        modal.style.display = 'flex';
    }
}

function fecharDetalhesCnpj() {
    relConfrontoDetalheChave = null;
    if (typeof fecharModal === 'function') {
        fecharModal('relFreqCnpjDetalhesModal');
    } else {
        const modal = document.getElementById('relFreqCnpjDetalhesModal');
        if (modal) modal.style.display = 'none';
    }
}

// --------------------------------------------------------------------------
// EXPORTAÇÃO CSV EM VALORES ABSOLUTOS
// --------------------------------------------------------------------------
function exportarCsvFrequenciaCnpj() {
    const dados = relConfrontoCache || processarDadosConfrontoAbsoluto();
    const { linhasConfronto } = dados;

    if (linhasConfronto.length === 0) {
        if (typeof showToast === 'function') showToast('Nenhum dado para exportar.', 'warning');
        return;
    }

    const cabecalho = [
        'CNPJ',
        'Empresa / Razao Social',
        'Cidade',
        'Estado',
        'Vendedor',
        'Numero Orcamento',
        'Data Orcamento',
        'Valor Orcado (R$)',
        'Numero Pedido Venda',
        'Data Pedido Venda',
        'Valor Pedido Venda (R$)',
        'Diferenca Confrontada (R$)',
        'Taxa Efetivacao (%)',
        'Status do Confronto'
    ];

    const linhas = linhasConfronto.map(l => [
        `"${l.cnpjFormatado.replace(/"/g, '""')}"`,
        `"${l.empresa.replace(/"/g, '""')}"`,
        `"${(l.cidade || '').replace(/"/g, '""')}"`,
        `"${(l.estado || '').replace(/"/g, '""')}"`,
        `"${(l.vendedorNome || '').replace(/"/g, '""')}"`,
        `"${l.orcNumero.replace(/"/g, '""')}"`,
        l.orcData,
        l.orcValor.toFixed(2).replace('.', ','),
        `"${l.pedNumero.replace(/"/g, '""')}"`,
        l.pedData,
        l.pedValor.toFixed(2).replace('.', ','),
        l.diferencaValor.toFixed(2).replace('.', ','),
        l.taxaConversao,
        `"${l.statusRotulo.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [cabecalho.join(';'), ...linhas.map(row => row.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `confronto-orcamentos-pedidos-${hoje()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (typeof showToast === 'function') {
        showToast('Planilha CSV de confronto exportada com sucesso!', 'success');
    }
}

// --------------------------------------------------------------------------
// IMPRESSÃO E GERAÇÃO DE PDF
// --------------------------------------------------------------------------
function imprimirRelatorioFrequenciaCnpj() {
    const dados = relConfrontoCache || processarDadosConfrontoAbsoluto();
    const { totaisAbsolutos, linhasConfronto } = dados;

    if (linhasConfronto.length === 0) {
        if (typeof showToast === 'function') showToast('Nenhum dado para imprimir.', 'warning');
        return;
    }

    const janela = window.open('', '_blank', 'width=1100,height=800');
    if (!janela) {
        if (typeof showToast === 'function') showToast('Permita pop-ups para gerar a impressão.', 'error');
        return;
    }

    const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Confronto de Orçamentos x Pedidos de Venda</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1a1a1a; margin: 24px; font-size: 11px; line-height: 1.4; }
                .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #22384d; padding-bottom: 12px; margin-bottom: 16px; }
                .logo { font-size: 18px; font-weight: 800; color: #22384d; }
                .sub { font-size: 11px; color: #666; margin-top: 2px; }
                .kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 18px; }
                .kpi-card { border: 1px solid #ddd; padding: 8px 10px; border-radius: 6px; background: #fafafa; }
                .kpi-title { font-size: 9.5px; text-transform: uppercase; color: #666; font-weight: 700; margin-bottom: 4px; }
                .kpi-val { font-size: 15px; font-weight: 800; color: #111; }
                table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
                th { background: #f2f4f7; border-bottom: 1.5px solid #ccc; padding: 6px 5px; text-align: left; font-weight: 700; color: #333; }
                td { padding: 5px; border-bottom: 1px solid #eee; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                @media print {
                    body { margin: 10mm; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="logo">Feitosa CRM · Confronto Orçamentos x Pedidos de Venda</div>
                    <div class="sub">Valores Absolutos Acumulados · Emitido em ${formatarData(hoje())} às ${new Date().toTimeString().slice(0, 5)}</div>
                </div>
                <div class="no-print">
                    <button onclick="window.print()" style="padding: 7px 14px; background: #22384d; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">🖨️ Imprimir / Salvar PDF</button>
                </div>
            </div>

            <div class="kpis">
                <div class="kpi-card">
                    <div class="kpi-title">Total Orçado</div>
                    <div class="kpi-val">${formatarMoeda(totaisAbsolutos.totalOrcamentosValor)}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-title">Pedidos Fechados</div>
                    <div class="kpi-val">${formatarMoeda(totaisAbsolutos.totalPedidosValor)}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-title">Taxa Efetivação</div>
                    <div class="kpi-val">${totaisAbsolutos.taxaEfetivacaoGeral}%</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-title">Saldo Absoluto</div>
                    <div class="kpi-val">${formatarMoeda(totaisAbsolutos.saldoAbsoluto)}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-title">Orçamentos em Aberto</div>
                    <div class="kpi-val">${formatarMoeda(totaisAbsolutos.totalAbertosValor)}</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>CNPJ</th>
                        <th>Empresa / Cliente</th>
                        <th>Nº Orçamento</th>
                        <th class="text-right">Valor Orçado</th>
                        <th>Nº Pedido</th>
                        <th class="text-right">Valor Pedido</th>
                        <th class="text-right">Diferença</th>
                        <th class="text-center">Conversão</th>
                        <th class="text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhasConfronto.map(l => `
                        <tr>
                            <td><strong>${l.cnpjFormatado}</strong></td>
                            <td>${l.empresa}</td>
                            <td>${l.orcNumero}</td>
                            <td class="text-right"><strong>${formatarMoeda(l.orcValor)}</strong></td>
                            <td>${l.pedNumero}</td>
                            <td class="text-right"><strong>${l.ehPedido ? formatarMoeda(l.pedValor) : '—'}</strong></td>
                            <td class="text-right">${l.ehPedido && l.diferencaValor > 0 ? '+' : ''}${formatarMoeda(l.diferencaValor)}</td>
                            <td class="text-center">${l.taxaConversao}%</td>
                            <td class="text-center">${l.statusRotulo}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    janela.document.write(html);
    janela.document.close();
}

// --------------------------------------------------------------------------
// EXPORTAÇÕES GLOBAIS
// --------------------------------------------------------------------------
window.relConfrontoFiltro = relConfrontoFiltro;
window.renderizarRelatorioFrequenciaCnpj = renderizarRelatorioFrequenciaCnpj;
window.mudarVisaoConfronto = mudarVisaoConfronto;
window.mudarFiltrosFreqCnpjPainel = mudarFiltrosFreqCnpjPainel;
window.abrirDetalhesCnpj = abrirDetalhesCnpj;
window.fecharDetalhesCnpj = fecharDetalhesCnpj;
window.exportarCsvFrequenciaCnpj = exportarCsvFrequenciaCnpj;
window.imprimirRelatorioFrequenciaCnpj = imprimirRelatorioFrequenciaCnpj;

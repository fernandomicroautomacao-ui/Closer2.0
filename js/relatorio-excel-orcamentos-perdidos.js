// =========================================================================
// RELATÓRIO OFICIAL DE ORÇAMENTOS E PERDIDOS EM EXCEL (XLS / XLSX)
// =========================================================================
// Padrão visual e estrutural definido conforme layout homologado:
//
// 1º Aba / Formato (Orçamentos):
// [Vendedor] [Cliente] [Valor] [Nro. Orçamento] [Probabilidade de fechamento] [Comentários]
// Regra: Pode ser ACUMULATIVO (todos os orçamentos ativos no funil) ou filtrado por período
//
// 2º Aba / Formato (Perdidos):
// [Vendedor] [Cliente] [Valor] [Nro. Orçamento] [Concorrente] [Comentários] [Motivo]
// Regra: Filtro de datas com foco MENSAL (ex.: Mês Atual, Mês Anterior, Mês Específico)
// =========================================================================

(function () {
    'use strict';

    const MESES_COMPLETOS = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Estado ativo do filtro para as ações de exportação XLS
    const estadoFiltroXls = {
        periodoPerdidosTipo: 'mes_atual', // 'mes_atual', 'mes_anterior', 'mes_especifico', 'personalizado', 'ano_atual', 'todos'
        mesAnoEspecifico: '',             // 'YYYY-MM'
        dataInicio: '',
        dataFim: '',
        modoOrcamentos: 'acumulativo'      // 'acumulativo' (padrão) ou 'mesmo_periodo'
    };

    // -------------------------------------------------------------
    // Cálculo e Resolução do Intervalo de Datas
    // -------------------------------------------------------------

    function obterRangeFiltroPerdidos(tipo, mesAno, inicioCustom, fimCustom) {
        // Se nenhum tipo for passado e o modal de exportação não estiver aberto na tela,
        // verifica se a aba de relatórios de perdidos tem um filtro de período ativo diferente de 'todos'
        const modalAberto = document.getElementById('modalExportacaoXlsOficial');
        const modalVisivel = modalAberto && (modalAberto.classList.contains('active') || modalAberto.classList.contains('open') || modalAberto.style.display === 'flex');

        if (!tipo && !modalVisivel && typeof relPerdidosFiltro !== 'undefined' && relPerdidosFiltro.periodoTipo && relPerdidosFiltro.periodoTipo !== 'todos') {
            if (typeof obterRangePeriodoPerdidos === 'function') {
                try {
                    const rangePainel = obterRangePeriodoPerdidos();
                    if (rangePainel && rangePainel.inicio && rangePainel.fim && !rangePainel.invalido) {
                        const labelLimpo = (rangePainel.label || 'Periodo').replace(/[^a-zA-Z0-9]/g, '_');
                        return {
                            tipo: relPerdidosFiltro.periodoTipo,
                            inicio: rangePainel.inicio,
                            fim: rangePainel.fim,
                            label: rangePainel.label || 'Período Selecionado',
                            labelCurto: rangePainel.label || 'Período',
                            labelArquivo: labelLimpo
                        };
                    }
                } catch (e) {
                    console.warn('Erro ao ler range do painel de perdidos:', e);
                }
            }
        }

        const t = tipo || estadoFiltroXls.periodoPerdidosTipo || 'mes_atual';
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth();

        if (t === 'mes_atual') {
            const inicio = new Date(anoAtual, mesAtual, 1, 0, 0, 0);
            const fim = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59);
            const nomeMes = MESES_COMPLETOS[mesAtual];
            return {
                tipo: 'mes_atual',
                inicio,
                fim,
                label: `${nomeMes} de ${anoAtual}`,
                labelCurto: `${nomeMes}/${anoAtual}`,
                labelArquivo: `${nomeMes}_${anoAtual}`
            };
        }

        if (t === 'mes_anterior') {
            const inicio = new Date(anoAtual, mesAtual - 1, 1, 0, 0, 0);
            const fim = new Date(anoAtual, mesAtual, 0, 23, 59, 59);
            const mesAntIdx = inicio.getMonth();
            const anoAnt = inicio.getFullYear();
            const nomeMes = MESES_COMPLETOS[mesAntIdx];
            return {
                tipo: 'mes_anterior',
                inicio,
                fim,
                label: `${nomeMes} de ${anoAnt}`,
                labelCurto: `${nomeMes}/${anoAnt}`,
                labelArquivo: `${nomeMes}_${anoAnt}`
            };
        }

        if (t === 'mes_especifico') {
            const ma = mesAno || estadoFiltroXls.mesAnoEspecifico;
            if (ma && ma.includes('-')) {
                const parts = ma.split('-');
                const ano = parseInt(parts[0], 10);
                const mesIdx = parseInt(parts[1], 10) - 1;
                if (!isNaN(ano) && !isNaN(mesIdx) && mesIdx >= 0 && mesIdx <= 11) {
                    const inicio = new Date(ano, mesIdx, 1, 0, 0, 0);
                    const fim = new Date(ano, mesIdx + 1, 0, 23, 59, 59);
                    const nomeMes = MESES_COMPLETOS[mesIdx];
                    return {
                        tipo: 'mes_especifico',
                        inicio,
                        fim,
                        label: `${nomeMes} de ${ano}`,
                        labelCurto: `${nomeMes}/${ano}`,
                        labelArquivo: `${nomeMes}_${ano}`
                    };
                }
            }
            // Fallback se não preenchido
            return obterRangeFiltroPerdidos('mes_atual');
        }

        if (t === 'personalizado') {
            const iniStr = inicioCustom || estadoFiltroXls.dataInicio;
            const fimStr = fimCustom || estadoFiltroXls.dataFim;
            if (iniStr && fimStr) {
                const inicio = new Date(`${iniStr}T00:00:00`);
                const fim = new Date(`${fimStr}T23:59:59`);
                return {
                    tipo: 'personalizado',
                    inicio,
                    fim,
                    label: `${formatarDataSimples(iniStr)} a ${formatarDataSimples(fimStr)}`,
                    labelCurto: `${formatarDataSimples(iniStr)} - ${formatarDataSimples(fimStr)}`,
                    labelArquivo: `${iniStr}_a_${fimStr}`
                };
            }
            return obterRangeFiltroPerdidos('mes_atual');
        }

        if (t === 'ano_atual') {
            const inicio = new Date(anoAtual, 0, 1, 0, 0, 0);
            const fim = new Date(anoAtual, 11, 31, 23, 59, 59);
            return {
                tipo: 'ano_atual',
                inicio,
                fim,
                label: `Ano de ${anoAtual}`,
                labelCurto: `Ano ${anoAtual}`,
                labelArquivo: `Ano_${anoAtual}`
            };
        }

        // 'todos' / histórico completo
        return {
            tipo: 'todos',
            inicio: null,
            fim: null,
            label: 'Todo o Histórico',
            labelCurto: 'Histórico Completo',
            labelArquivo: 'Historico_Completo'
        };
    }

    function formatarDataSimples(dataIso) {
        if (!dataIso) return '';
        const parts = String(dataIso).split('T')[0].split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return String(dataIso);
    }

    function dataNoIntervalo(dataRef, inicio, fim) {
        if (!inicio || !fim) return true;
        if (!dataRef) return false;
        const d = new Date(dataRef);
        if (isNaN(d.getTime())) return false;
        return d >= inicio && d <= fim;
    }

    // -------------------------------------------------------------
    // Helpers de Formatação e Extração de Dados
    // -------------------------------------------------------------

    function obterNomeVendedor(leadOuPerdido) {
        if (!leadOuPerdido) return 'Fernando Feitosa';
        if (leadOuPerdido.vendedor && typeof leadOuPerdido.vendedor === 'string' && leadOuPerdido.vendedor.trim()) {
            return leadOuPerdido.vendedor.trim();
        }
        if (leadOuPerdido.usuarioId && typeof usuarios !== 'undefined' && Array.isArray(usuarios)) {
            const u = usuarios.find(user => user.id === leadOuPerdido.usuarioId);
            if (u && u.nome) return u.nome;
        }
        if (typeof usuarioAtual !== 'undefined' && usuarioAtual && usuarioAtual.nome) {
            return usuarioAtual.nome;
        }
        return 'Fernando Feitosa';
    }

    function obterNomeCliente(item) {
        if (!item) return '';
        return (item.empresa || item.nomeCliente || item.razaoSocial || item.nome || '').trim();
    }

    function obterNumeroOrcamento(item) {
        if (!item) return '';
        if (item.numeroOrcamento) return String(item.numeroOrcamento).trim();
        if (item.nroOrcamento) return String(item.nroOrcamento).trim();
        if (item.orcamentoNumero) return String(item.orcamentoNumero).trim();
        if (item.orcamentoPdfPrincipal && item.orcamentoPdfPrincipal.dadosExtraidos && item.orcamentoPdfPrincipal.dadosExtraidos.numero) {
            return String(item.orcamentoPdfPrincipal.dadosExtraidos.numero).trim();
        }
        if (Array.isArray(item.orcamentos) && item.orcamentos.length > 0 && item.orcamentos[0].numero) {
            return String(item.orcamentos[0].numero).trim();
        }
        if (item.numeroPedido) return String(item.numeroPedido).trim();
        if (item.codigoUnico) return String(item.codigoUnico).trim();
        if (item.id) {
            const digits = String(item.id).replace(/\D/g, '');
            if (digits.length >= 4) return '0' + digits.slice(0, 5);
        }
        return '';
    }

    function obterProbabilidadeFechamento(lead) {
        if (!lead) return 'media';
        if (lead.probabilidade) {
            const p = String(lead.probabilidade).toLowerCase().trim();
            if (p.includes('alt')) return 'alta';
            if (p.includes('baix')) return 'baixa';
            return 'media';
        }
        const pot = String(lead.potencial || '').toLowerCase().trim();
        if (pot === 'a' || pot.includes('alt')) return 'alta';
        if (pot === 'c' || pot.includes('baix')) return 'baixa';
        return 'media';
    }

    function obterComentariosOrcamento(lead) {
        if (!lead) return '';
        if (lead.comentarios && typeof lead.comentarios === 'string' && lead.comentarios.trim()) {
            return lead.comentarios.trim();
        }

        const partes = [];

        if (Array.isArray(lead.itens) && lead.itens.length > 0) {
            const itensDesc = lead.itens
                .map(i => {
                    let d = (i.descricao || i.nome || i.codigo || '').trim();
                    if (i.quantidade && Number(i.quantidade) > 1) d += ` (${i.quantidade}x)`;
                    return d;
                })
                .filter(Boolean)
                .join(', ');
            if (itensDesc) partes.push(itensDesc);
        }

        if (lead.condicoes && typeof lead.condicoes === 'string' && lead.condicoes.trim()) {
            partes.push(lead.condicoes.trim());
        } else if (lead.obsOrcamento && typeof lead.obsOrcamento === 'string' && lead.obsOrcamento.trim()) {
            partes.push(lead.obsOrcamento.trim());
        } else if (lead.cardObs && typeof lead.cardObs === 'string' && lead.cardObs.trim()) {
            partes.push(lead.cardObs.trim());
        }

        if (partes.length > 0) {
            return partes.join(' - ');
        }

        return (lead.descricao || lead.observacoes || 'Orçamento em negociação').trim();
    }

    function obterConcorrentePerdido(perdido) {
        if (!perdido) return '';
        if (perdido.concorrente && typeof perdido.concorrente === 'string' && perdido.concorrente.trim()) {
            return perdido.concorrente.trim();
        }
        if (perdido.concorrencia && typeof perdido.concorrencia === 'string' && perdido.concorrencia.trim()) {
            return perdido.concorrencia.trim();
        }
        if (perdido.motivoDetalhe && typeof perdido.motivoDetalhe === 'string') {
            const lower = perdido.motivoDetalhe.toLowerCase();
            if (lower.includes('festo') || lower.includes('smc') || lower.includes('parker') || lower.includes('camozzi') || lower.includes('micro') || lower.includes('norgren')) {
                return perdido.motivoDetalhe.trim();
            }
        }
        return '';
    }

    function obterComentariosPerdido(perdido) {
        if (!perdido) return '';
        if (perdido.comentarios && typeof perdido.comentarios === 'string' && perdido.comentarios.trim()) {
            return perdido.comentarios.trim();
        }

        const partes = [];

        if (Array.isArray(perdido.itens) && perdido.itens.length > 0) {
            const itensDesc = perdido.itens
                .map(i => (i.descricao || i.nome || i.codigo || '').trim())
                .filter(Boolean)
                .join(', ');
            if (itensDesc) partes.push(itensDesc);
        }

        if (perdido.motivoDetalhe && typeof perdido.motivoDetalhe === 'string' && perdido.motivoDetalhe.trim()) {
            partes.push(perdido.motivoDetalhe.trim());
        } else if (perdido.cardObs && typeof perdido.cardObs === 'string' && perdido.cardObs.trim()) {
            partes.push(perdido.cardObs.trim());
        } else if (perdido.observacoes && typeof perdido.observacoes === 'string' && perdido.observacoes.trim()) {
            partes.push(perdido.observacoes.trim());
        }

        if (partes.length > 0) {
            return partes.join(' - ');
        }

        return (perdido.motivo || 'Card descartado').trim();
    }

    function obterMotivoPerdido(perdido) {
        if (!perdido) return 'Perdido por preço';
        return (perdido.motivo || 'Perdido por preço').trim();
    }

    // -------------------------------------------------------------
    // Coletores de Registros Filtrados ou Acumulativos
    // -------------------------------------------------------------

    /**
     * Coleta dados de Orçamentos em Aberto.
     * Por padrão: ACUMULATIVO (todos os orçamentos ativos no funil sem corte de data).
     * Opcional: modo 'mesmo_periodo' para filtrar pelas propostas geradas no período selecionado.
     */
    function coletarDadosOrcamentos(opcoesFiltro) {
        const modo = (opcoesFiltro && opcoesFiltro.modoOrcamentos) || estadoFiltroXls.modoOrcamentos || 'acumulativo';
        const range = opcoesFiltro && opcoesFiltro.range;

        let lista = [];

        if (typeof getLeadsRelatorio === 'function') {
            const todos = getLeadsRelatorio();
            lista = todos.filter(l => l.etapa === 'orcamento');
        } else if (typeof leads !== 'undefined' && Array.isArray(leads)) {
            lista = leads.filter(l => {
                return l.etapa === 'orcamento' ||
                       (l.etapa !== 'pedido' && l.etapa !== 'ganho' && (l.valor > 0 || l.numeroOrcamento || (l.itens && l.itens.length > 0)));
            });
        }

        // Se o usuário optou por restringir ao período
        if (modo === 'mesmo_periodo' && range && range.inicio && range.fim) {
            lista = lista.filter(lead => {
                const dataRef = lead.dataEntradaEtapa || lead.dataOrcamento || lead.dataCriacao || lead.dataModificacao;
                return dataNoIntervalo(dataRef, range.inicio, range.fim);
            });
        }

        // Ordenação por valor decrescente
        lista.sort((a, b) => (parseFloat(b.valor) || 0) - (parseFloat(a.valor) || 0));

        return lista.map(lead => {
            const valorNum = parseFloat(lead.valor) || 0;
            return {
                vendedor: obterNomeVendedor(lead),
                cliente: obterNomeCliente(lead),
                valor: valorNum,
                valorFormatado: `R$ ${valorNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                nroOrcamento: obterNumeroOrcamento(lead),
                probabilidade: obterProbabilidadeFechamento(lead),
                comentarios: obterComentariosOrcamento(lead)
            };
        });
    }

    /**
     * Coleta dados de Cards Perdidos.
     * Aplica filtro de período com foco MENSAL (ex.: Mês Atual, Mês Anterior, Mês Específico).
     */
    function coletarDadosPerdidos(opcoesFiltro) {
        const range = (opcoesFiltro && opcoesFiltro.range) || obterRangeFiltroPerdidos();

        let lista = [];
        if (typeof getPerdidosVisiveis === 'function') {
            lista = getPerdidosVisiveis();
        } else if (typeof getPerdidosRelatorio === 'function') {
            lista = getPerdidosRelatorio();
        } else if (typeof perdidos !== 'undefined' && Array.isArray(perdidos)) {
            lista = [...perdidos];
        }

        // Aplica o filtro de período (mensal ou personalizado)
        if (range && range.inicio && range.fim) {
            lista = lista.filter(p => {
                const dataRef = p.dataExclusao || p.dataPerda || p.dataCancelamento || p.dataModificacao || p.dataCriacao;
                return dataNoIntervalo(dataRef, range.inicio, range.fim);
            });
        }

        // Ordenar por data da perda decrescente
        lista.sort((a, b) => {
            const dataA = a.dataExclusao || a.dataPerda || a.dataModificacao || a.dataCriacao || '';
            const dataB = b.dataExclusao || b.dataPerda || b.dataModificacao || b.dataCriacao || '';
            return String(dataB).localeCompare(String(dataA));
        });

        return lista.map(p => {
            const valorNum = parseFloat(p.valor) || 0;
            return {
                vendedor: obterNomeVendedor(p),
                cliente: obterNomeCliente(p),
                valor: valorNum,
                valorFormatado: `R$ ${valorNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                nroOrcamento: obterNumeroOrcamento(p),
                concorrente: obterConcorrentePerdido(p),
                comentarios: obterComentariosPerdido(p),
                motivo: obterMotivoPerdido(p)
            };
        });
    }

    // -------------------------------------------------------------
    // Geração de HTML XLS com Cabeçalho Cinza e Bordas Pretas
    // (Fiel 100% ao design enviado nas imagens do usuário)
    // -------------------------------------------------------------

    function gerarTabelaHtmlOrcamento(dados, tituloInfo) {
        const linhasHtml = dados.map(item => `
            <tr>
                <td style="border: 1px solid #000000; padding: 4px 8px; text-align: left; mso-number-format:'\\@';">${escaparHtml(item.vendedor)}</td>
                <td style="border: 1px solid #000000; padding: 4px 8px; text-align: left; mso-number-format:'\\@';">${escaparHtml(item.cliente)}</td>
                <td style="border: 1px solid #000000; padding: 4px 8px; text-align: right; mso-number-format:'\\R\\$\\ \\#\\,\\#\\#0\\.00';">${item.valor.toFixed(2).replace('.', ',')}</td>
                <td style="border: 1px solid #000000; padding: 4px 8px; text-align: center; mso-number-format:'\\@';">${escaparHtml(item.nroOrcamento)}</td>
                <td style="border: 1px solid #000000; padding: 4px 8px; text-align: center; mso-number-format:'\\@';">${escaparHtml(item.probabilidade)}</td>
                <td style="border: 1px solid #000000; padding: 4px 8px; text-align: left; mso-number-format:'\\@';">${escaparHtml(item.comentarios)}</td>
            </tr>
        `).join('');

        const bannerInfo = tituloInfo ? `
            <div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin-bottom: 8px; font-weight: bold;">
                ${escaparHtml(tituloInfo)}
            </div>
        ` : '';

        return `
            ${bannerInfo}
            <table style="border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; width: 100%;">
                <thead>
                    <tr>
                        <th style="background-color: #BFBFBF; color: #000000; font-weight: bold; border: 1px solid #000000; padding: 6px 8px; text-align: left;">Vendedor</th>
                        <th style="background-color: #BFBFBF; color: #000000; font-weight: bold; border: 1px solid #000000; padding: 6px 8px; text-align: left;">Cliente</th>
                        <th style="background-color: #BFBFBF; color: #000000; font-weight: bold; border: 1px solid #000000; padding: 6px 8px; text-align: center;">Valor</th>
                        <th style="background-color: #BFBFBF; color: #000000; font-weight: bold; border: 1px solid #000000; padding: 6px 8px; text-align: center;">Nro. Orçamento</th>
                        <th style="background-color: #BFBFBF; color: #000000; font-weight: bold; border: 1px solid #000000; padding: 6px 8px; text-align: center;">Probabilidade de fechamento</th>
                        <th style="background-color: #BFBFBF; color: #000000; font-weight: bold; border: 1px solid #000000; padding: 6px 8px; text-align: left;">Comentários</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhasHtml}
                </tbody>
            </table>
        `;
    }

    function gerarTabelaHtmlPerdidos(dados, tituloInfo) {
        const linhasHtml = dados.map(item => `
            <tr>
                <td style="border: 1px solid #000000; padding: 4px 8px; text-align: left; mso-number-format:'\\@';">${escaparHtml(item.vendedor)}</td>
                <td style="border: 1px solid #000000; padding: 4px 8px; text-align: left; mso-number-format:'\\@';">${escaparHtml(item.cliente)}</td>
                <td style="border: 1px solid #000000; padding: 4px 8px; text-align: right; mso-number-format:'\\R\\$\\ \\#\\,\\#\\#0\\.00';">${item.valor.toFixed(2).replace('.', ',')}</td>
                <td style="border: 1px solid #000000; padding: 4px 8px; text-align: center; mso-number-format:'\\@';">${escaparHtml(item.nroOrcamento)}</td>
                <td style="border: 1px solid #000000; padding: 4px 8px; text-align: left; mso-number-format:'\\@';">${escaparHtml(item.concorrente)}</td>
                <td style="border: 1px solid #000000; padding: 4px 8px; text-align: left; mso-number-format:'\\@';">${escaparHtml(item.comentarios)}</td>
                <td style="border: 1px solid #000000; padding: 4px 8px; text-align: left; mso-number-format:'\\@';">${escaparHtml(item.motivo)}</td>
            </tr>
        `).join('');

        const bannerInfo = tituloInfo ? `
            <div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin-bottom: 8px; font-weight: bold;">
                ${escaparHtml(tituloInfo)}
            </div>
        ` : '';

        return `
            ${bannerInfo}
            <table style="border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; width: 100%;">
                <thead>
                    <tr>
                        <th style="background-color: #BFBFBF; color: #000000; font-weight: bold; border: 1px solid #000000; padding: 6px 8px; text-align: left;">Vendedor</th>
                        <th style="background-color: #BFBFBF; color: #000000; font-weight: bold; border: 1px solid #000000; padding: 6px 8px; text-align: left;">Cliente</th>
                        <th style="background-color: #BFBFBF; color: #000000; font-weight: bold; border: 1px solid #000000; padding: 6px 8px; text-align: center;">Valor</th>
                        <th style="background-color: #BFBFBF; color: #000000; font-weight: bold; border: 1px solid #000000; padding: 6px 8px; text-align: center;">Nro. Orçamento</th>
                        <th style="background-color: #BFBFBF; color: #000000; font-weight: bold; border: 1px solid #000000; padding: 6px 8px; text-align: left;">Concorrente</th>
                        <th style="background-color: #BFBFBF; color: #000000; font-weight: bold; border: 1px solid #000000; padding: 6px 8px; text-align: left;">Comentários</th>
                        <th style="background-color: #BFBFBF; color: #000000; font-weight: bold; border: 1px solid #000000; padding: 6px 8px; text-align: left;">Motivo</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhasHtml}
                </tbody>
            </table>
        `;
    }

    function dispararDownloadArquivo(conteudo, nomeArquivo, mimeType) {
        const blob = new Blob([conteudo], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomeArquivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    function escaparHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function obterDataHojeFormatada() {
        return new Date().toISOString().split('T')[0];
    }

    // -------------------------------------------------------------
    // GERAÇÃO SHEETJS (XLSX COM AS DUAS ABAS OU INDIVIDUAIS)
    // -------------------------------------------------------------

    function exportarComSheetJS(opcoes) {
        if (typeof XLSX === 'undefined') {
            return false; // fallback para HTML XLS
        }

        const wb = XLSX.utils.book_new();

        if (opcoes.incluirOrcamentos) {
            const cabecalhoOrc = ['Vendedor', 'Cliente', 'Valor', 'Nro. Orçamento', 'Probabilidade de fechamento', 'Comentários'];
            const linhasOrc = opcoes.dadosOrcamentos.map(d => [
                d.vendedor,
                d.cliente,
                d.valor,
                d.nroOrcamento, // armazenado como string para preservar zeros à esquerda como '078140'
                d.probabilidade,
                d.comentarios
            ]);

            const wsOrc = XLSX.utils.aoa_to_sheet([cabecalhoOrc, ...linhasOrc]);

            // Definir larguras de colunas
            wsOrc['!cols'] = [
                { wch: 22 }, // Vendedor
                { wch: 38 }, // Cliente
                { wch: 14 }, // Valor
                { wch: 16 }, // Nro. Orçamento
                { wch: 26 }, // Probabilidade
                { wch: 55 }  // Comentários
            ];

            // Formatação do tipo de célula para Valor e Número do Orçamento
            const rangeOrc = XLSX.utils.decode_range(wsOrc['!ref']);
            for (let R = 1; R <= rangeOrc.e.r; ++R) {
                // Coluna C: Valor
                const cellRefValor = XLSX.utils.encode_cell({ r: R, c: 2 });
                if (wsOrc[cellRefValor]) {
                    wsOrc[cellRefValor].t = 'n';
                    wsOrc[cellRefValor].z = '"R$" #,##0.00';
                }
                // Coluna D: Nro. Orçamento
                const cellRefNro = XLSX.utils.encode_cell({ r: R, c: 3 });
                if (wsOrc[cellRefNro]) {
                    wsOrc[cellRefNro].t = 's';
                }
            }

            XLSX.utils.book_append_sheet(wb, wsOrc, 'Orçamentos');
        }

        if (opcoes.incluirPerdidos) {
            const cabecalhoPerd = ['Vendedor', 'Cliente', 'Valor', 'Nro. Orçamento', 'Concorrente', 'Comentários', 'Motivo'];
            const linhasPerd = opcoes.dadosPerdidos.map(d => [
                d.vendedor,
                d.cliente,
                d.valor,
                d.nroOrcamento,
                d.concorrente,
                d.comentarios,
                d.motivo
            ]);

            const wsPerd = XLSX.utils.aoa_to_sheet([cabecalhoPerd, ...linhasPerd]);

            wsPerd['!cols'] = [
                { wch: 22 }, // Vendedor
                { wch: 38 }, // Cliente
                { wch: 14 }, // Valor
                { wch: 16 }, // Nro. Orçamento
                { wch: 20 }, // Concorrente
                { wch: 50 }, // Comentários
                { wch: 24 }  // Motivo
            ];

            const rangePerd = XLSX.utils.decode_range(wsPerd['!ref']);
            for (let R = 1; R <= rangePerd.e.r; ++R) {
                const cellRefValor = XLSX.utils.encode_cell({ r: R, c: 2 });
                if (wsPerd[cellRefValor]) {
                    wsPerd[cellRefValor].t = 'n';
                    wsPerd[cellRefValor].z = '"R$" #,##0.00';
                }
                const cellRefNro = XLSX.utils.encode_cell({ r: R, c: 3 });
                if (wsPerd[cellRefNro]) {
                    wsPerd[cellRefNro].t = 's';
                }
            }

            XLSX.utils.book_append_sheet(wb, wsPerd, 'Perdidos');
        }

        XLSX.writeFile(wb, opcoes.nomeArquivo);
        return true;
    }

    // -------------------------------------------------------------
    // FUNÇÕES PÚBLICAS DE EXPORTAÇÃO (COM FILTRO DE DATAS)
    // -------------------------------------------------------------

    /**
     * Exporta 1º Formato: Orçamentos em XLS/XLSX
     * Por padrão: Acumulativo (todos os orçamentos ativos em aberto).
     */
    function exportarXlsOrcamentos(opcoesParam) {
        const rangePerd = obterRangeFiltroPerdidos();
        const opcoes = opcoesParam || {
            modoOrcamentos: estadoFiltroXls.modoOrcamentos || 'acumulativo',
            range: rangePerd
        };

        const dados = coletarDadosOrcamentos(opcoes);
        if (dados.length === 0) {
            const msg = 'Nenhum orçamento encontrado para exportar.';
            if (typeof showToast === 'function') showToast(msg, 'error');
            else alert(msg);
            return;
        }

        const modoLabel = opcoes.modoOrcamentos === 'mesmo_periodo' ? rangePerd.labelArquivo : 'Acumulado';
        const nomeArquivo = `Relatorio_Orcamentos_${modoLabel}_${obterDataHojeFormatada()}.xlsx`;
        const sucesso = exportarComSheetJS({
            incluirOrcamentos: true,
            incluirPerdidos: false,
            dadosOrcamentos: dados,
            nomeArquivo: nomeArquivo
        });

        if (!sucesso) {
            const html = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                    <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Orçamentos</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
                </head>
                <body>
                    ${gerarTabelaHtmlOrcamento(dados, `Orçamentos em Aberto (${opcoes.modoOrcamentos === 'mesmo_periodo' ? rangePerd.label : 'Acumulativo Geral'})`)}
                </body>
                </html>
            `;
            dispararDownloadArquivo('\uFEFF' + html, `Relatorio_Orcamentos_${modoLabel}_${obterDataHojeFormatada()}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
        }

        const detalheModo = opcoes.modoOrcamentos === 'mesmo_periodo' ? `(${rangePerd.labelCurto})` : '(Acumulativo)';
        if (typeof showToast === 'function') {
            showToast(`Relatório de Orçamentos exportado ${detalheModo} (${dados.length} registro(s))!`, 'success');
        }
    }

    /**
     * Exporta 2º Formato: Perdidos em XLS/XLSX
     * Regra: Filtro mensal por padrão (Mês Atual ou Mês Selecionado).
     */
    function exportarXlsPerdidos(opcoesParam) {
        const range = (opcoesParam && opcoesParam.range) || obterRangeFiltroPerdidos();
        const dados = coletarDadosPerdidos({ range });

        if (dados.length === 0) {
            const msg = `Nenhum card perdido encontrado para o período: ${range.label}.`;
            if (typeof showToast === 'function') showToast(msg, 'error');
            else alert(msg);
            return;
        }

        const nomeArquivo = `Relatorio_Perdidos_${range.labelArquivo}.xlsx`;
        const sucesso = exportarComSheetJS({
            incluirOrcamentos: false,
            incluirPerdidos: true,
            dadosPerdidos: dados,
            nomeArquivo: nomeArquivo
        });

        if (!sucesso) {
            const html = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                    <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Perdidos</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
                </head>
                <body>
                    ${gerarTabelaHtmlPerdidos(dados, `Cards Perdidos / Descartados - Período: ${range.label}`)}
                </body>
                </html>
            `;
            dispararDownloadArquivo('\uFEFF' + html, `Relatorio_Perdidos_${range.labelArquivo}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
        }

        if (typeof showToast === 'function') {
            showToast(`Relatório de Perdidos (${range.labelCurto}) exportado com sucesso (${dados.length} registro(s))!`, 'success');
        }
    }

    /**
     * Exporta Relatório Consolidado (Orçamentos Acumulados + Perdidos Mensais) em 1 arquivo com 2 abas!
     */
    function exportarXlsConsolidadoOrcamentosEPerdidos(opcoesParam) {
        const rangePerdidos = (opcoesParam && opcoesParam.range) || obterRangeFiltroPerdidos();
        const modoOrc = (opcoesParam && opcoesParam.modoOrcamentos) || estadoFiltroXls.modoOrcamentos || 'acumulativo';

        const dadosOrc = coletarDadosOrcamentos({ modoOrcamentos: modoOrc, range: rangePerdidos });
        const dadosPerd = coletarDadosPerdidos({ range: rangePerdidos });

        if (dadosOrc.length === 0 && dadosPerd.length === 0) {
            const msg = 'Nenhum dado encontrado para exportar com os filtros informados.';
            if (typeof showToast === 'function') showToast(msg, 'error');
            else alert(msg);
            return;
        }

        const nomeArquivo = `Relatorio_Orcamentos_e_Perdidos_${rangePerdidos.labelArquivo}.xlsx`;
        const sucesso = exportarComSheetJS({
            incluirOrcamentos: true,
            incluirPerdidos: true,
            dadosOrcamentos: dadosOrc,
            dadosPerdidos: dadosPerd,
            nomeArquivo: nomeArquivo
        });

        if (!sucesso) {
            const html = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                </head>
                <body>
                    <h2 style="font-family: Calibri, Arial; margin-bottom: 4px;">1º Orçamentos em Aberto (${modoOrc === 'acumulativo' ? 'Acumulativo Geral' : rangePerdidos.label})</h2>
                    <p style="font-family: Calibri, Arial; font-size: 10pt; color: #555; margin-top: 0;">Total de propostas ativas: ${dadosOrc.length}</p>
                    ${gerarTabelaHtmlOrcamento(dadosOrc)}
                    <br><br>
                    <h2 style="font-family: Calibri, Arial; margin-bottom: 4px;">2º Cards Perdidos / Descartados (${rangePerdidos.label})</h2>
                    <p style="font-family: Calibri, Arial; font-size: 10pt; color: #555; margin-top: 0;">Total de perdas no período: ${dadosPerd.length}</p>
                    ${gerarTabelaHtmlPerdidos(dadosPerd)}
                </body>
                </html>
            `;
            dispararDownloadArquivo('\uFEFF' + html, `Relatorio_Orcamentos_e_Perdidos_${rangePerdidos.labelArquivo}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
        }

        if (typeof showToast === 'function') {
            showToast(`Planilha XLS Consolidada gerada (${dadosOrc.length} Orçamentos e ${dadosPerd.length} Perdidos em ${rangePerdidos.labelCurto})!`, 'success');
        }
    }

    // -------------------------------------------------------------
    // MODAL DE CONFIGURAÇÃO E EXPORTAÇÃO COM FILTROS DE DATA
    // -------------------------------------------------------------

    function atualizarResumoModalXls() {
        const selectTipo = document.getElementById('modalXlsPeriodoTipo');
        const inputMesAno = document.getElementById('modalXlsMesAno');
        const inputIni = document.getElementById('modalXlsDataInicio');
        const inputFim = document.getElementById('modalXlsDataFim');
        const radioModo = document.querySelector('input[name="modalXlsModoOrcamento"]:checked');

        if (selectTipo) estadoFiltroXls.periodoPerdidosTipo = selectTipo.value;
        if (inputMesAno) estadoFiltroXls.mesAnoEspecifico = inputMesAno.value;
        if (inputIni) estadoFiltroXls.dataInicio = inputIni.value;
        if (inputFim) estadoFiltroXls.dataFim = inputFim.value;
        if (radioModo) estadoFiltroXls.modoOrcamentos = radioModo.value;

        // Controle visual dos campos secundários
        const boxMes = document.getElementById('modalXlsBoxMesEspecifico');
        const boxCustom = document.getElementById('modalXlsBoxPersonalizado');
        if (boxMes) boxMes.style.display = estadoFiltroXls.periodoPerdidosTipo === 'mes_especifico' ? 'block' : 'none';
        if (boxCustom) boxCustom.style.display = estadoFiltroXls.periodoPerdidosTipo === 'personalizado' ? 'grid' : 'none';

        const range = obterRangeFiltroPerdidos();
        const dadosOrc = coletarDadosOrcamentos({ modoOrcamentos: estadoFiltroXls.modoOrcamentos, range });
        const dadosPerd = coletarDadosPerdidos({ range });

        const totalOrcValor = dadosOrc.reduce((acc, i) => acc + i.valor, 0);
        const totalPerdValor = dadosPerd.reduce((acc, i) => acc + i.valor, 0);

        // Atualizar badges informativos no modal
        const badgePerdidos = document.getElementById('modalXlsBadgePerdidos');
        const badgeOrcamentos = document.getElementById('modalXlsBadgeOrcamentos');
        const labelPeriodo = document.getElementById('modalXlsPeriodoAtivoLabel');

        if (labelPeriodo) {
            labelPeriodo.textContent = range.label;
        }

        if (badgePerdidos) {
            badgePerdidos.innerHTML = `<strong>${dadosPerd.length}</strong> card(s) perdido(s) • <span style="color:var(--danger);font-weight:700;">R$ ${totalPerdValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
        }

        if (badgeOrcamentos) {
            const modoTexto = estadoFiltroXls.modoOrcamentos === 'acumulativo' ? 'Acumulado no Funil' : 'Neste Período';
            badgeOrcamentos.innerHTML = `<strong>${dadosOrc.length}</strong> em aberto (${modoTexto}) • <span style="color:var(--primary);font-weight:700;">R$ ${totalOrcValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
        }

        // Atualizar rótulos dos botões com contagens
        const btnConsolidado = document.getElementById('modalXlsBtnConsolidado');
        const btnOrc = document.getElementById('modalXlsBtnOrcamentos');
        const btnPerd = document.getElementById('modalXlsBtnPerdidos');

        if (btnConsolidado) {
            btnConsolidado.textContent = `Baixar Planilha Completa (${dadosOrc.length} orçamentos + ${dadosPerd.length} perdidos)`;
        }
        if (btnOrc) {
            btnOrc.textContent = `Baixar Orçamentos (${dadosOrc.length})`;
        }
        if (btnPerd) {
            btnPerd.textContent = `Baixar Perdidos (${dadosPerd.length})`;
        }
    }

    function abrirModalExportacaoXlsPersonalizado() {
        const modalId = 'modalExportacaoXlsOficial';
        let modalEl = document.getElementById(modalId);

        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtualIdx = hoje.getMonth();
        const mesAtualFormatado = `${anoAtual}-${String(mesAtualIdx + 1).padStart(2, '0')}`;

        if (!estadoFiltroXls.mesAnoEspecifico) {
            estadoFiltroXls.mesAnoEspecifico = mesAtualFormatado;
        }

        const mesAtualNome = MESES_COMPLETOS[mesAtualIdx];
        const dataMesAnt = new Date(anoAtual, mesAtualIdx - 1, 1);
        const mesAntNome = MESES_COMPLETOS[dataMesAnt.getMonth()];
        const mesAntAno = dataMesAnt.getFullYear();

        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = modalId;
            modalEl.className = 'modal-overlay';
            modalEl.style.zIndex = '99999';
            document.body.appendChild(modalEl);
        }

        modalEl.innerHTML = `
            <div class="modal" style="max-width: 600px; max-height: 94vh; display: flex; flex-direction: column;">
                <div class="modal-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
                    <div>
                        <h2 style="margin: 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                            <span>📊</span> Exportar Relatório Oficial em XLS / Excel
                        </h2>
                        <span style="font-size: 12px; color: var(--text-muted); display: block; margin-top: 3px;">
                            Layout com cabeçalho cinza e colunas oficiais homologadas
                        </span>
                    </div>
                    <button class="modal-close" onclick="fecharModal('${modalId}')">✕</button>
                </div>

                <div style="padding: 16px 0; overflow-y: auto; flex: 1;">
                    <!-- Bloco de Filtros de Período -->
                    <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
                        
                        <!-- 1. Período para Perdidos (Mensal) -->
                        <div style="margin-bottom: 14px;">
                            <label style="display: flex; align-items: center; justify-content: space-between; font-weight: 600; font-size: 13px; color: var(--text-primary); margin-bottom: 6px;">
                                <span>📉 Período dos Perdidos (Mensal):</span>
                                <span id="modalXlsPeriodoAtivoLabel" style="font-size: 11px; font-weight: normal; color: var(--primary); background: rgba(59,130,246,0.1); padding: 2px 8px; border-radius: 12px;"></span>
                            </label>
                            <select id="modalXlsPeriodoTipo" onchange="window.__atualizarResumoModalXls()" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-hover); color: var(--text-primary); font-size: 13px;">
                                <option value="mes_atual" ${estadoFiltroXls.periodoPerdidosTipo === 'mes_atual' ? 'selected' : ''}>📅 Mês Atual (${mesAtualNome} / ${anoAtual}) — Recomendado</option>
                                <option value="mes_anterior" ${estadoFiltroXls.periodoPerdidosTipo === 'mes_anterior' ? 'selected' : ''}>📅 Mês Anterior (${mesAntNome} / ${mesAntAno})</option>
                                <option value="mes_especifico" ${estadoFiltroXls.periodoPerdidosTipo === 'mes_especifico' ? 'selected' : ''}>🗓️ Escolher Mês Específico (Ano/Mês)...</option>
                                <option value="personalizado" ${estadoFiltroXls.periodoPerdidosTipo === 'personalizado' ? 'selected' : ''}>📆 Intervalo Personalizado (De / Até)...</option>
                                <option value="ano_atual" ${estadoFiltroXls.periodoPerdidosTipo === 'ano_atual' ? 'selected' : ''}>📊 Ano Todo (${anoAtual})</option>
                                <option value="todos" ${estadoFiltroXls.periodoPerdidosTipo === 'todos' ? 'selected' : ''}>♾️ Todo o Histórico de Perdidos</option>
                            </select>
                        </div>

                        <!-- Seletor de Mês Específico -->
                        <div id="modalXlsBoxMesEspecifico" style="display: none; margin-bottom: 14px; background: var(--bg-hover); padding: 10px; border-radius: 6px; border: 1px solid var(--border-color);">
                            <label style="display: block; font-size: 12px; font-weight: 500; margin-bottom: 4px; color: var(--text-secondary);">
                                Selecione o Mês e Ano desejado:
                            </label>
                            <input type="month" id="modalXlsMesAno" value="${estadoFiltroXls.mesAnoEspecifico || mesAtualFormatado}" onchange="window.__atualizarResumoModalXls()" style="padding: 7px 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-card); color: var(--text-primary); font-size: 13px; width: 100%;">
                        </div>

                        <!-- Intervalo Personalizado -->
                        <div id="modalXlsBoxPersonalizado" style="display: none; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; background: var(--bg-hover); padding: 10px; border-radius: 6px; border: 1px solid var(--border-color);">
                            <div>
                                <label style="display: block; font-size: 11px; margin-bottom: 4px; color: var(--text-secondary);">Data Inicial:</label>
                                <input type="date" id="modalXlsDataInicio" value="${estadoFiltroXls.dataInicio}" onchange="window.__atualizarResumoModalXls()" style="width: 100%; padding: 6px 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-card); color: var(--text-primary); font-size: 12px;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 11px; margin-bottom: 4px; color: var(--text-secondary);">Data Final:</label>
                                <input type="date" id="modalXlsDataFim" value="${estadoFiltroXls.dataFim}" onchange="window.__atualizarResumoModalXls()" style="width: 100%; padding: 6px 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-card); color: var(--text-primary); font-size: 12px;">
                            </div>
                        </div>

                        <!-- 2. Regra para Orçamentos em Aberto -->
                        <div style="border-top: 1px dashed var(--border-color); padding-top: 12px; margin-top: 10px;">
                            <label style="display: block; font-weight: 600; font-size: 13px; color: var(--text-primary); margin-bottom: 6px;">
                                📋 Regra para Orçamentos em Aberto:
                            </label>
                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: var(--text-primary);">
                                    <input type="radio" name="modalXlsModoOrcamento" value="acumulativo" ${estadoFiltroXls.modoOrcamentos === 'acumulativo' ? 'checked' : ''} onchange="window.__atualizarResumoModalXls()">
                                    <span><strong>Acumulativo</strong> (Todos os orçamentos ativos no funil até hoje — Recomendado)</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: var(--text-secondary);">
                                    <input type="radio" name="modalXlsModoOrcamento" value="mesmo_periodo" ${estadoFiltroXls.modoOrcamentos === 'mesmo_periodo' ? 'checked' : ''} onchange="window.__atualizarResumoModalXls()">
                                    <span><strong>Filtrado</strong> (Apenas propostas geradas no mesmo período dos Perdidos)</span>
                                </label>
                            </div>
                        </div>

                    </div>

                    <!-- Resumo Dinâmico em Tempo Real -->
                    <div style="background: var(--bg-hover); border-radius: 8px; padding: 12px; margin-bottom: 18px; border: 1px solid var(--border-color);">
                        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 8px;">
                            Prévia dos dados selecionados para exportação:
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span>📋 1º Orçamentos em Aberto:</span>
                                <span id="modalXlsBadgeOrcamentos" style="font-size: 12px;">Carregando...</span>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span>📉 2º Cards Perdidos / Descartados:</span>
                                <span id="modalXlsBadgePerdidos" style="font-size: 12px;">Carregando...</span>
                            </div>
                        </div>
                    </div>

                    <!-- Botões de Ação de Download -->
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        
                        <!-- Opção 1: Consolidada (2 Abas) -->
                        <div style="border: 2px solid var(--primary); border-radius: 8px; padding: 14px; background: rgba(59,130,246,0.04); display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
                                <div>
                                    <strong style="display: block; font-size: 14px; color: var(--text-primary);">📑 Planilha Consolidada (2 Abas em 1 Arquivo)</strong>
                                    <span style="font-size: 12px; color: var(--text-muted);">
                                        Aba 1: Orçamentos em Aberto • Aba 2: Perdidos no Período
                                    </span>
                                </div>
                            </div>
                            <button type="button" id="modalXlsBtnConsolidado" class="btn btn-primary" onclick="exportarXlsConsolidadoOrcamentosEPerdidos(); fecharModal('${modalId}');" style="width: 100%; padding: 10px; font-weight: 600;">
                                Baixar Planilha Completa
                            </button>
                        </div>

                        <!-- Opções Separadas Lado a Lado -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <!-- Opção 2: 1º Orçamentos -->
                            <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; background: var(--bg-card); display: flex; flex-direction: column; justify-content: space-between; gap: 10px;">
                                <div>
                                    <strong style="display: block; font-size: 13px; color: var(--text-primary);">1º Apenas Orçamentos</strong>
                                    <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 2px;">
                                        6 Colunas: Vendedor, Cliente, Valor, Nro. Orçamento, Probabilidade, Comentários
                                    </span>
                                </div>
                                <button type="button" id="modalXlsBtnOrcamentos" class="btn btn-success btn-sm" onclick="exportarXlsOrcamentos(); fecharModal('${modalId}');" style="width: 100%;">
                                    Baixar Orçamentos
                                </button>
                            </div>

                            <!-- Opção 3: 2º Perdidos -->
                            <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; background: var(--bg-card); display: flex; flex-direction: column; justify-content: space-between; gap: 10px;">
                                <div>
                                    <strong style="display: block; font-size: 13px; color: var(--text-primary);">2º Apenas Perdidos</strong>
                                    <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 2px;">
                                        7 Colunas: Vendedor, Cliente, Valor, Nro. Orçamento, Concorrente, Comentários, Motivo
                                    </span>
                                </div>
                                <button type="button" id="modalXlsBtnPerdidos" class="btn btn-danger btn-sm" onclick="exportarXlsPerdidos(); fecharModal('${modalId}');" style="width: 100%;">
                                    Baixar Perdidos
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="form-actions" style="border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 4px;">
                    <button type="button" class="btn btn-outline" onclick="fecharModal('${modalId}')">Cancelar</button>
                </div>
            </div>
        `;

        window.__atualizarResumoModalXls = atualizarResumoModalXls;
        atualizarResumoModalXls();

        if (typeof abrirModal === 'function') {
            abrirModal(modalId);
        } else {
            modalEl.classList.add('active', 'open');
            modalEl.style.display = 'flex';
        }
    }

    // Exportação para o escopo global do CRM
    window.exportarXlsOrcamentos = exportarXlsOrcamentos;
    window.exportarXlsPerdidos = exportarXlsPerdidos;
    window.exportarXlsConsolidadoOrcamentosEPerdidos = exportarXlsConsolidadoOrcamentosEPerdidos;
    window.abrirModalExportacaoXlsPersonalizado = abrirModalExportacaoXlsPersonalizado;
    window.obterRangeFiltroPerdidos = obterRangeFiltroPerdidos;

})();

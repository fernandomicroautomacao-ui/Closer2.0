// ============================================
// ITENS / ORÇAMENTO & VISUALIZADOR DE PDF COM EXTRAÇÃO INTELIGENTE DE DADOS
// ============================================

let orcamentoModoAtivo = 'pdf';
let itensEditPdfPrincipal = null; // { nome, tipo, dataUrl, dadosExtraidos, textoCompleto }

function abrirItens(leadId, tipo) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    if (usuarioAtual && usuarioAtual.papel !== 'admin' && lead.usuarioId !== usuarioAtual.id) {
        showToast('Você não tem permissão para editar itens deste lead.', 'error');
        return;
    }

    itensEditLeadId = leadId;
    itemEmEdicaoIndex = -1;
    itensEditLista = JSON.parse(JSON.stringify(lead.itens || []));
    itensEditAnexos = JSON.parse(JSON.stringify(lead.orcamentoAnexos || []));
    itensEditPdfPrincipal = lead.orcamentoPdfPrincipal ? JSON.parse(JSON.stringify(lead.orcamentoPdfPrincipal)) : null;

    document.getElementById('itensEmpresaNome').textContent = lead.empresa;
    document.getElementById('itemDesconto').value = lead.desconto || '';
    document.getElementById('itemFrete').value = lead.frete || '';
    document.getElementById('itemCondicoes').value = lead.condicoes || '';
    document.getElementById('itemObsOrcamento').value = lead.obsOrcamento || '';
    
    // Campo de valor direto (subtotal dos produtos antes de frete/desconto)
    const campoValorDireto = document.getElementById('itemValorDiretoPdf');
    if (campoValorDireto) {
        let valSubtotal = '';
        if (lead.valorProdutos !== undefined && lead.valorProdutos !== null && lead.valorProdutos > 0) {
            valSubtotal = lead.valorProdutos;
        } else if (lead.valor) {
            const freteNum = parseFloat(lead.frete) || 0;
            valSubtotal = (freteNum > 0 && lead.valor > freteNum) ? (lead.valor - freteNum) : lead.valor;
        } else if (itensEditPdfPrincipal) {
            const totalPdf = itensEditPdfPrincipal.dadosExtraidos?.totalComImpostos || itensEditPdfPrincipal.valorDetectado || 0;
            const fretePdf = itensEditPdfPrincipal.dadosExtraidos?.frete || 0;
            valSubtotal = (fretePdf > 0 && totalPdf > fretePdf) ? (totalPdf - fretePdf) : totalPdf;
        }
        campoValorDireto.value = valSubtotal ? parseFloat(valSubtotal).toFixed(2) : '';
    }

    renderizarAnexosOrcamento();
    renderizarVisualizadorPdfOrcamento();
    atualizarUIAutorizacao(lead);
    if (typeof atualizarUILandingPageOrcamento === 'function') {
        atualizarUILandingPageOrcamento(lead);
    }

    abrirModal('itensModal');
}

// ---------- Visualizador do Anexo PDF Principal em Alta Fidelidade & Extrator ----------
let orcPdfZoomAtual = 1.0;
let orcPdfDocInstancia = null;
let orcPdfCanvasesRenderizados = [];
let orcPdfRenderId = 0;

function dataUrlParaUint8Array(dataUrl) {
    if (!dataUrl) return new Uint8Array(0);
    const partes = dataUrl.split(',');
    const base64 = partes.length > 1 ? partes[1] : partes[0];
    const raw = atob(base64.replace(/\s/g, ''));
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
        bytes[i] = raw.charCodeAt(i);
    }
    return bytes;
}

function dataUrlParaBlob(dataUrl, mimePadrao = 'application/pdf') {
    const partes = dataUrl.split(',');
    const mimeMatch = partes[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : mimePadrao;
    const bytes = dataUrlParaUint8Array(dataUrl);
    return new Blob([bytes], { type: mime });
}

async function carregarERenderizarPdfCanvas(dataUrl) {
    const currentRenderId = ++orcPdfRenderId;
    const wrapper = document.getElementById('orcPdfCanvasWrapper');
    const spinner = document.getElementById('orcPdfCarregando');
    const iframe = document.getElementById('orcPdfIframe');
    const infoTag = document.getElementById('orcPdfPaginaInfo');
    const btn100 = document.getElementById('btnZoomPdf100');

    orcPdfCanvasesRenderizados = [];

    if (btn100) btn100.textContent = `${Math.round(orcPdfZoomAtual * 100)}%`;

    if (!window.pdfjsLib) {
        console.warn('pdfjsLib não disponível. Usando visualizador padrão.');
        if (spinner) spinner.style.display = 'none';
        if (wrapper) wrapper.style.display = 'none';
        if (iframe) {
            iframe.src = dataUrl;
            iframe.style.display = 'block';
        }
        if (infoTag) infoTag.textContent = 'Modo Navegador';
        return;
    }

    try {
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        if (spinner) spinner.style.display = 'flex';
        if (wrapper) {
            wrapper.innerHTML = '';
            wrapper.style.display = 'flex';
        }
        if (iframe) iframe.style.display = 'none';
        if (infoTag) infoTag.textContent = 'Carregando documento...';

        const bytes = dataUrlParaUint8Array(dataUrl);
        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdfDoc = await loadingTask.promise;

        if (currentRenderId !== orcPdfRenderId) return; // cancelado por outra renderização

        orcPdfDocInstancia = pdfDoc;
        const totalPaginas = pdfDoc.numPages;
        if (infoTag) infoTag.textContent = `${totalPaginas} ${totalPaginas === 1 ? 'página' : 'páginas'}`;

        const containerWidth = (wrapper && wrapper.clientWidth > 100) ? wrapper.clientWidth : 720;
        const targetWidthBase = Math.min(containerWidth - 32, 780);

        for (let num = 1; num <= totalPaginas; num++) {
            if (currentRenderId !== orcPdfRenderId) return;

            const page = await pdfDoc.getPage(num);
            const unscaledViewport = page.getViewport({ scale: 1.0 });

            const pixelRatio = Math.min(window.devicePixelRatio || 1.5, 2.0);
            const baseScale = (targetWidthBase / unscaledViewport.width);
            const renderScale = baseScale * orcPdfZoomAtual * pixelRatio;
            const viewport = page.getViewport({ scale: renderScale });

            const pageWrap = document.createElement('div');
            pageWrap.className = 'pdf-page-wrapper';
            pageWrap.id = `pdfPageWrap_${num}`;

            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-page-canvas';
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = (viewport.width / pixelRatio) + 'px';
            canvas.style.height = (viewport.height / pixelRatio) + 'px';

            const ctx = canvas.getContext('2d', { alpha: false });
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            pageWrap.appendChild(canvas);

            if (totalPaginas > 1) {
                const badge = document.createElement('span');
                badge.className = 'pdf-page-number-tag';
                badge.textContent = `Pág. ${num}/${totalPaginas}`;
                pageWrap.appendChild(badge);
            }

            if (wrapper) wrapper.appendChild(pageWrap);

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            await page.render(renderContext).promise;
            orcPdfCanvasesRenderizados.push(canvas);
        }

        if (spinner) spinner.style.display = 'none';
        if (infoTag) infoTag.textContent = `1 a ${totalPaginas} de ${totalPaginas} ${totalPaginas === 1 ? 'página' : 'páginas'}`;
    } catch (err) {
        console.warn('Falha na renderização de canvas via PDF.js, utilizando fallback em iframe:', err);
        if (spinner) spinner.style.display = 'none';
        if (wrapper) wrapper.style.display = 'none';
        if (iframe) {
            iframe.src = dataUrl;
            iframe.style.display = 'block';
        }
        if (infoTag) infoTag.textContent = 'Visualizador Embutido';
    }
}

function alterarZoomPdfViewer(delta) {
    orcPdfZoomAtual = Math.max(0.4, Math.min(2.5, +(orcPdfZoomAtual + delta).toFixed(2)));
    const btn100 = document.getElementById('btnZoomPdf100');
    if (btn100) btn100.textContent = `${Math.round(orcPdfZoomAtual * 100)}%`;

    if (itensEditPdfPrincipal && itensEditPdfPrincipal.dataUrl) {
        carregarERenderizarPdfCanvas(itensEditPdfPrincipal.dataUrl);
    }
}

function definirZoomPdfViewer(zoom = 1.0) {
    orcPdfZoomAtual = zoom;
    const btn100 = document.getElementById('btnZoomPdf100');
    if (btn100) btn100.textContent = `${Math.round(orcPdfZoomAtual * 100)}%`;

    if (itensEditPdfPrincipal && itensEditPdfPrincipal.dataUrl) {
        carregarERenderizarPdfCanvas(itensEditPdfPrincipal.dataUrl);
    }
}

function ajustarPdfAoContainer() {
    const wrapper = document.getElementById('orcPdfCanvasWrapper');
    if (!wrapper || !orcPdfDocInstancia) {
        definirZoomPdfViewer(1.0);
        return;
    }
    const containerWidth = wrapper.clientWidth || 700;
    const targetWidth = Math.max(400, containerWidth - 40);
    const zoomCalculado = +(targetWidth / 780).toFixed(2);
    definirZoomPdfViewer(Math.max(0.5, Math.min(2.0, zoomCalculado)));
}

function baixarPdfOrcamentoModal() {
    if (!itensEditPdfPrincipal || !itensEditPdfPrincipal.dataUrl) {
        showToast('Nenhum PDF disponível para download.', 'warning');
        return;
    }
    const blob = dataUrlParaBlob(itensEditPdfPrincipal.dataUrl);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = itensEditPdfPrincipal.nome || `orcamento_${hoje()}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 1000);
    showToast('Download do PDF iniciado!');
}

function imprimirPdfOrcamentoModal() {
    if (!itensEditPdfPrincipal || !itensEditPdfPrincipal.dataUrl) {
        showToast('Nenhum PDF anexado para imprimir!', 'warning');
        return;
    }

    showToast('Preparando impressão direta do PDF original...', 'info');

    // Se temos os canvas renderizados em alta resolução, imprimimos através deles para fidelidade visual absoluta
    if (orcPdfCanvasesRenderizados && orcPdfCanvasesRenderizados.length > 0) {
        imprimirCanvasesEmIframeOculto(orcPdfCanvasesRenderizados, itensEditPdfPrincipal.nome || 'Orçamento PDF');
        return;
    }

    // Fallback: imprime via Blob URL em iframe oculto
    const blob = dataUrlParaBlob(itensEditPdfPrincipal.dataUrl);
    const blobUrl = URL.createObjectURL(blob);
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    document.body.appendChild(printFrame);

    printFrame.onload = () => {
        setTimeout(() => {
            try {
                printFrame.contentWindow.focus();
                printFrame.contentWindow.print();
            } catch (e) {
                console.warn('Aviso ao imprimir via blob iframe, abrindo janela auxiliar:', e);
                window.open(blobUrl, '_blank');
            } finally {
                setTimeout(() => {
                    document.body.removeChild(printFrame);
                    URL.revokeObjectURL(blobUrl);
                }, 4000);
            }
        }, 500);
    };
    printFrame.src = blobUrl;
}

function imprimirCanvasesEmIframeOculto(canvases, tituloDocumento) {
    const imagens = canvases.map(c => c.toDataURL('image/png', 1.0));
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>${tituloDocumento}</title>
            <style>
                @page {
                    size: auto;
                    margin: 0mm;
                }
                html, body {
                    margin: 0;
                    padding: 0;
                    background: #ffffff;
                    width: 100%;
                }
                .pdf-print-page {
                    display: block;
                    width: 100%;
                    height: auto;
                    page-break-after: always;
                    page-break-inside: avoid;
                    margin: 0;
                }
                .pdf-print-page:last-child {
                    page-break-after: auto;
                }
            </style>
        </head>
        <body>
            ${imagens.map(src => `<img class="pdf-print-page" src="${src}" alt="Página do Orçamento" />`).join('')}
        </body>
        </html>
    `);
    doc.close();

    setTimeout(() => {
        try {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
        } catch (e) {
            console.warn('Erro ao disparar impressão de imagens no iframe:', e);
        } finally {
            setTimeout(() => {
                if (document.body.contains(printFrame)) {
                    document.body.removeChild(printFrame);
                }
            }, 5000);
        }
    }, 400);
}

function renderizarVisualizadorPdfOrcamento() {
    const dropzone = document.getElementById('orcPdfDropzone');
    const viewerCard = document.getElementById('orcPdfViewerContainer');
    const bannerExtracao = document.getElementById('orcPdfExtracaoBanner');
    const dadosWrap = document.getElementById('orcPdfDadosExtraidosWrap');
    const tituloTexto = document.getElementById('orcPdfTituloTexto');
    const valorDetectadoTexto = document.getElementById('orcPdfValorDetectadoTexto');
    const campoValorDireto = document.getElementById('itemValorDiretoPdf');

    if (!itensEditPdfPrincipal || !itensEditPdfPrincipal.dataUrl) {
        if (dropzone) dropzone.style.display = 'block';
        if (viewerCard) viewerCard.style.display = 'none';
        if (bannerExtracao) bannerExtracao.style.display = 'none';
        if (dadosWrap) dadosWrap.style.display = 'none';
        const wrapper = document.getElementById('orcPdfCanvasWrapper');
        if (wrapper) wrapper.innerHTML = '';
        const iframe = document.getElementById('orcPdfIframe');
        if (iframe) iframe.src = 'about:blank';
        orcPdfCanvasesRenderizados = [];
        orcPdfDocInstancia = null;
        return;
    }

    // PDF carregado: oculta dropzone e mostra viewer
    if (dropzone) dropzone.style.display = 'none';
    if (viewerCard) viewerCard.style.display = 'block';
    if (tituloTexto) tituloTexto.textContent = itensEditPdfPrincipal.nome || 'Proposta / Orçamento em PDF';

    // Dispara renderização em alta fidelidade no Canvas
    carregarERenderizarPdfCanvas(itensEditPdfPrincipal.dataUrl);

    const extraidos = itensEditPdfPrincipal.dadosExtraidos || {};
    const valorFinal = extraidos.totalComImpostos || itensEditPdfPrincipal.valorDetectado || 0;
    const freteVal = extraidos.frete || 0;

    if (valorFinal > 0) {
        if (bannerExtracao) bannerExtracao.style.display = 'flex';
        if (valorDetectadoTexto) valorDetectadoTexto.textContent = formatarMoeda(valorFinal);
        const bannerLabel = document.getElementById('orcPdfBannerLabel');
        if (bannerLabel) {
            bannerLabel.textContent = (extraidos.totalJaIncluiFrete || freteVal > 0)
                ? 'Total do Orçamento com impostos + Frete:'
                : 'Total do Orçamento com impostos:';
        }
        if (campoValorDireto && (!campoValorDireto.value || parseFloat(campoValorDireto.value) === 0)) {
            const subtotalCalc = (freteVal > 0 && valorFinal > freteVal) ? (valorFinal - freteVal) : valorFinal;
            campoValorDireto.value = subtotalCalc.toFixed(2);
        }
    } else {
        if (bannerExtracao) bannerExtracao.style.display = 'none';
    }

    // Renderizar dados cadastrais e lista de itens extraídos
    renderizarDadosExtraidosNaTela(extraidos);
}

function renderizarDadosExtraidosNaTela(extraidos) {
    const wrap = document.getElementById('orcPdfDadosExtraidosWrap');
    if (!wrap) return;

    if (!extraidos || (!extraidos.numero && (!extraidos.itens || extraidos.itens.length === 0))) {
        wrap.style.display = 'none';
        return;
    }

    wrap.style.display = 'block';

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val || '-';
    };

    setVal('pdfExtNumero', extraidos.numero);
    setVal('pdfExtData', extraidos.data);
    setVal('pdfExtValidade', extraidos.dataValidade);
    setVal('pdfExtCondicoes', extraidos.condicoesPagamento);
    const clienteTexto = extraidos.cliente
        ? `${extraidos.cliente} ${extraidos.clienteCnpj ? `(${extraidos.clienteCnpj})` : ''}`
        : (extraidos.clienteCnpj ? `CNPJ/CPF: ${extraidos.clienteCnpj}` : '-');
    setVal('pdfExtCliente', clienteTexto);
    setVal('pdfExtVendedor', extraidos.vendedor);
    setVal('pdfExtFrete', extraidos.frete && extraidos.frete > 0 ? formatarMoeda(extraidos.frete) : 'Sem frete adicional (R$ 0,00)');

    // Renderizar tabela de itens
    const tbody = document.getElementById('pdfItensExtraidosBody');
    const contador = document.getElementById('pdfExtContadorItens');
    const itens = extraidos.itens || [];

    if (contador) contador.textContent = itens.length;

    if (tbody) {
        if (itens.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted text-xs">Nenhum item extraído da tabela do PDF.</td></tr>`;
        } else {
            tbody.innerHTML = itens.map(item => `
                <tr>
                    <td style="font-weight:700;color:var(--primary);font-size:12px;">${item.item || 'Item'}</td>
                    <td>
                        <div style="font-weight:600;font-size:13px;">${item.descricao || '-'}</div>
                        ${item.entrega ? `<div class="text-xs text-muted">Entrega: ${item.entrega}</div>` : ''}
                        ${item.classifFiscal ? `<div class="text-xs text-muted">NCM: ${item.classifFiscal}</div>` : ''}
                    </td>
                    <td style="font-family:monospace;font-size:12px;">${item.codigo || '-'}</td>
                    <td style="text-align:right;">${formatarMoeda(item.preco || 0)}</td>
                    <td style="text-align:center;">${item.quantidade} ${item.unidade || 'UN'}</td>
                    <td style="text-align:right;font-weight:700;color:#10b981;">${formatarMoeda(item.total || 0)}</td>
                </tr>
            `).join('');
        }
    }
}

function processarPdfVisualOrcamento(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showToast('Por favor selecione um arquivo no formato PDF.', 'error');
        return;
    }
    if (file.size > 15 * 1024 * 1024) {
        showToast('O arquivo PDF pode ter no máximo 15MB.', 'error');
        return;
    }

    showToast('Carregando PDF e extraindo dados e produtos...', 'info');

    const leitorArray = new FileReader();
    leitorArray.onload = async () => {
        const arrayBuffer = leitorArray.result;

        const leitorDataUrl = new FileReader();
        leitorDataUrl.onload = async () => {
            const dataUrl = leitorDataUrl.result;

            let textoCompleto = '';
            let dadosExtraidos = {};

            try {
                if (window.pdfjsLib) {
                    const typedarray = new Uint8Array(arrayBuffer);
                    const loadingTask = window.pdfjsLib.getDocument({ data: typedarray });
                    const pdfDoc = await loadingTask.promise;
                    
                    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                        const page = await pdfDoc.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        textoCompleto += '\n' + pageText;
                    }

                    // Extração inteligente de todos os campos e itens do modelo Micro Automação
                    dadosExtraidos = extrairDadosCompletosPdf(textoCompleto);
                }
            } catch (err) {
                console.warn('Não foi possível extrair dados automaticamente do PDF:', err);
            }

            const valorFinal = dadosExtraidos.totalComImpostos || extrairPrecoFinalDeTexto(textoCompleto);
            dadosExtraidos.totalComImpostos = valorFinal;

            itensEditPdfPrincipal = {
                nome: file.name,
                tipo: file.type || 'application/pdf',
                tamanho: file.size,
                dataUrl: dataUrl,
                valorDetectado: valorFinal,
                dadosExtraidos: dadosExtraidos,
                textoCompleto: textoCompleto.slice(0, 3000)
            };

            // Atualiza campos de condições se detectados no PDF
            if (dadosExtraidos.condicoesPagamento) {
                const cpEl = document.getElementById('itemCondicoes');
                if (cpEl && !cpEl.value) cpEl.value = dadosExtraidos.condicoesPagamento;
            }
            if (dadosExtraidos.dataValidade) {
                const obsEl = document.getElementById('itemObsOrcamento');
                if (obsEl && !obsEl.value) {
                    obsEl.value = `Proposta válida até ${dadosExtraidos.dataValidade}. Orçamento nº ${dadosExtraidos.numero || ''}.`;
                }
            }

            // Atualiza campo de frete se detectado no PDF
            const freteDetectado = dadosExtraidos.frete || 0;
            const campoFrete = document.getElementById('itemFrete');
            if (freteDetectado > 0 && campoFrete) {
                campoFrete.value = freteDetectado.toFixed(2);
            }

            // Atualiza valor total direto (subtotal de produtos).
            // Se o total geral já inclui o frete detectado (ou tem frete > 0), deduz o frete do subtotal dos produtos para que Subtotal + Frete seja exatamente igual ao valor final
            const campoValorDireto = document.getElementById('itemValorDiretoPdf');
            let subtotalProdutos = valorFinal;
            if (freteDetectado > 0 && valorFinal > freteDetectado) {
                subtotalProdutos = valorFinal - freteDetectado;
            }
            // Sincroniza automaticamente o CNPJ/CPF do cliente no Lead atual se não preenchido ou se possuía o da Micro Automação
            const leadAtual = leads.find(l => l.id === itensEditLeadId);
            if (leadAtual && dadosExtraidos.clienteCnpj) {
                const cnpjsIgnorar = obterCnpjsEmissorParaIgnorar(textoCompleto);
                const digLead = (leadAtual.cnpj || '').replace(/\D/g, '');
                const digCod = (leadAtual.codigoUnico || '').replace(/\D/g, '');
                if (!leadAtual.cnpj || cnpjsIgnorar.has(digLead)) {
                    leadAtual.cnpj = dadosExtraidos.clienteCnpj;
                }
                if (!leadAtual.codigoUnico || cnpjsIgnorar.has(digCod)) {
                    leadAtual.codigoUnico = dadosExtraidos.clienteCnpj;
                }
            }

            // Sincroniza decisor / contato do PDF no lead atual caso ainda vazio ou com placeholder
            if (dadosExtraidos.contato && leadAtual && (!leadAtual.decisor || leadAtual.decisor === '—' || leadAtual.decisor === 'Thomaz' || leadAtual.decisor === 'Não informado')) {
                leadAtual.decisor = dadosExtraidos.contato;
            }

            const infoCnpjMsg = dadosExtraidos.clienteCnpj ? ` | CNPJ/CPF: ${dadosExtraidos.clienteCnpj}` : '';
            if (valorFinal > 0) {
                if (campoValorDireto) campoValorDireto.value = subtotalProdutos.toFixed(2);
                const infoFreteMsg = freteDetectado > 0 ? ` (Produtos: ${formatarMoeda(subtotalProdutos)} + Frete: ${formatarMoeda(freteDetectado)})` : '';
                showToast(`PDF carregado! Total: ${formatarMoeda(valorFinal)}${infoFreteMsg}${infoCnpjMsg} e ${dadosExtraidos.itens?.length || 0} item(ns) extraídos.`, 'success');
            } else {
                showToast(`PDF carregado com sucesso no visualizador.${infoCnpjMsg}`, 'success');
            }

            renderizarVisualizadorPdfOrcamento();
            recalcularTotalItens();
        };
        leitorDataUrl.readAsDataURL(file);
    };
    leitorArray.readAsArrayBuffer(file);
    const input = document.getElementById('orcPdfInput');
    if (input) input.value = '';
}

// ============================================
// AUXILIAR: IDENTIFICAR CNPJS DO EMISSOR (MICRO AUTOMAÇÃO / WHITE LABEL)
// ============================================
function obterCnpjsEmissorParaIgnorar(texto) {
    const ignorar = new Set();

    // 1. CNPJ das configurações de empresa (White Label)
    if (typeof empresaAtual !== 'undefined' && empresaAtual && empresaAtual.cnpj) {
        const dig = String(empresaAtual.cnpj).replace(/\D/g, '');
        if (dig) ignorar.add(dig);
    }

    if (!texto) return ignorar;

    // 2. Procura no cabeçalho menção a Micro Automação associada a CNPJ
    const mMicro = texto.match(/micro\s*automa[çc][ãa]o[^\n\r]*?CNPJ[\s\:\.\-]*([0-9\.\/\-]{14,20})/i)
        || texto.match(/CNPJ[\s\:\.\-]*([0-9\.\/\-]{14,20})[^\n\r]*?micro\s*automa[çc][ãa]o/i);
    if (mMicro) {
        const dig = mMicro[1].replace(/\D/g, '');
        if (dig.length === 14) ignorar.add(dig);
    }

    // 3. Procura no cabeçalho antes de "Orçamento [0-9]+" se houver menção a Micro Automação
    const idxOrc = texto.search(/Or[çc]amento\s+[0-9]+/i);
    if (idxOrc > 0) {
        const cabecalho = texto.slice(0, idxOrc);
        if (/micro\s*automa/i.test(cabecalho)) {
            const mCab = cabecalho.match(/CNPJ[\s\:\.\-]*([0-9\.\/\-]{14,20})/i);
            if (mCab) {
                const dig = mCab[1].replace(/\D/g, '');
                if (dig.length === 14) ignorar.add(dig);
            }
        }
    }

    return ignorar;
}
if (typeof window !== 'undefined') {
    window.obterCnpjsEmissorParaIgnorar = obterCnpjsEmissorParaIgnorar;
}

// ============================================
// PARSER E EXTRATOR DE DADOS E ITENS DO PDF
// ============================================
function extrairDadosCompletosPdf(texto) {
    const dados = {
        numero: '',
        data: '',
        dataValidade: '',
        cliente: '',
        clienteCnpj: '',
        clienteEndereco: '',
        clienteTelefone: '',
        contato: '',
        decisor: '',
        vendedor: '',
        vendedorEmail: '',
        vendedorTelefone: '',
        referencia: '',
        destinacao: '',
        condicoesPagamento: '',
        pesoBruto: '',
        pesoLiquido: '',
        frete: 0,
        totalSemIpi: 0,
        totalComImpostos: 0,
        itens: []
    };

    if (!texto) return dados;

    // 1. Metadados do Orçamento
    const matchNum = texto.match(/Or[çc]amento\s+([0-9]{4,10})/i);
    if (matchNum) dados.numero = matchNum[1];

    const matchData = texto.match(/Data:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
    if (matchData) dados.data = matchData[1];

    const matchValidade = texto.match(/Data\s+de\s+validade:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
    if (matchValidade) dados.dataValidade = matchValidade[1];

    // 2. Destinatário / Cliente e CNPJ/CPF do Cliente
    // REGRA FUNDAMENTAL: O PDF da Micro Automação traz no cabeçalho o CNPJ da própria Micro Automação,
    // enquanto o documento do cliente destinatário é explicitamente identificado pelo campo
    // "CNPJ/CPF: 12.983.989/0001-80" (ou variações como "CNPJ / CPF:", "CPF/CNPJ:", etc.).
    const cnpjsIgnorar = obterCnpjsEmissorParaIgnorar(texto);

    // 2.1 Varredura direcionada ao rótulo exato "CNPJ/CPF:" do cliente
    const regexCnpjCpfGlobal = /(?:CNPJ\s*[\/\-]\s*CPF|CPF\s*[\/\-]\s*CNPJ|C\.?N\.?P\.?J\.?\s*[\/\-]\s*C\.?P\.?F\.?|CNPJ\s*[\/\-]\s*MF)[\s\:\.\-\=]*([0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}\-[0-9]{2}|[0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}|[0-9]{14}|[0-9]{11}|[0-9\.\/\-\s]{11,25})/gi;

    let matchCnpjCpf;
    while ((matchCnpjCpf = regexCnpjCpfGlobal.exec(texto)) !== null) {
        const bruto = matchCnpjCpf[1].trim();
        const digitos = bruto.replace(/\D/g, '');
        if (digitos.length === 14 || digitos.length === 11) {
            if (!cnpjsIgnorar.has(digitos)) {
                if (digitos.length === 14) {
                    dados.clienteCnpj = `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12, 14)}`;
                } else {
                    dados.clienteCnpj = `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9, 11)}`;
                }

                // Tenta extrair o nome do cliente que antecede o campo CNPJ/CPF
                const matchIndex = matchCnpjCpf.index;
                const textoAnterior = texto.slice(Math.max(0, matchIndex - 140), matchIndex);

                // Caso A: Rótulo formal "Cliente: ...", "Razão Social: ...", "Destinatário: ..."
                const mNomeRotulado = textoAnterior.match(/(?:Cliente|Destinat[áa]rio|Raz[ãa]o\s+Social|Nome(?:\s*\/\s*Raz[ãa]o\s+Social)?)[\s\:\.\-\=]+([^\n\r\t]+?)$/i);
                if (mNomeRotulado && mNomeRotulado[1]) {
                    dados.cliente = mNomeRotulado[1].trim();
                } else {
                    // Caso B: Linha ou fragmento anterior ao CNPJ/CPF
                    const pedacos = textoAnterior.split(/[\n\r]/).map(p => p.trim()).filter(Boolean);
                    if (pedacos.length > 0) {
                        let cand = pedacos[pedacos.length - 1];
                        cand = cand.replace(/^.*?(?:Data(?:\s+de\s+validade)?[\s\:\.\-]*[0-9]{2}\/[0-9]{2}\/[0-9]{4}|Or[çc]amento\s+[0-9]+)\s*/i, '').trim();
                        if (cand.length >= 3 && !/micro\s*automa|validade/i.test(cand)) {
                            dados.cliente = cand.replace(/^(?:Cliente|Destinat[áa]rio|Raz[ãa]o\s+Social)[\s\:\.\-]*/i, '').trim();
                        }
                    }
                }
                break;
            }
        }
    }

    // 2.2 Fallback para CNPJ caso o PDF utilize outro padrão de rótulo (excluindo sempre o emissor)
    if (!dados.clienteCnpj) {
        const todosCnpjs = [...texto.matchAll(/([0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}\-[0-9]{2}|[0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2})/g)];
        for (const m of todosCnpjs) {
            const dig = m[1].replace(/\D/g, '');
            if (!cnpjsIgnorar.has(dig) && (dig.length === 14 || dig.length === 11)) {
                dados.clienteCnpj = m[1];
                break;
            }
        }
    }

    // 2.3 Fallback para Nome do Cliente se ainda não preenchido
    if (!dados.cliente) {
        const mClienteRotulo = texto.match(/(?:Cliente|Destinat[áa]rio|Raz[ãa]o\s+Social|Nome(?:\s*\/\s*Raz[ãa]o\s+Social)?)[\s\:\.\-\=]+([A-Z0-9\.\,\&\-\s]{4,80}?)(?=(?:\s+(?:CNPJ|CPF|Endere[çc]o|Telefone|Fone|Data|Inscri[çc][ãa]o|Bairro|Cidade|UF|CEP)|[\n\r]|$))/i);
        if (mClienteRotulo && mClienteRotulo[1]) {
            const cand = mClienteRotulo[1].trim();
            if (!/micro\s*automa/i.test(cand)) {
                dados.cliente = cand;
            }
        }
    }

    // Sanitize do nome do cliente para não conter prefixos/sufixos indesejados
    if (dados.cliente) {
        dados.cliente = dados.cliente
            .replace(/^[\:\-\.\,\s]+|[\:\-\.\,\s]+$/g, '')
            .replace(/\s+/g, ' ');
        if (/micro\s*automa/i.test(dados.cliente)) {
            dados.cliente = '';
        }
    }

    // 3. Vendedor & Contato
    const matchVendedor = texto.match(/Vendedor:\s*([A-Z\s]{4,40}?)\s+([a-zA-Z0-9\.\_\-]+@[a-zA-Z0-9\.\_\-]+)/i);
    if (matchVendedor) {
        dados.vendedor = matchVendedor[1].trim();
        dados.vendedorEmail = matchVendedor[2].trim();
    }

    const matchVendedorTel = texto.match(/Telefone:\s*([0-9\s\-]{8,20})/i);
    if (matchVendedorTel) dados.vendedorTelefone = matchVendedorTel[1].trim();

    // 3.1 Contato / Decisor / Aos Cuidados do Cliente
    const matchContato = texto.match(/(?:A\/C[\s\:\.\-]*|Aos\s+Cuidados(?:\s+de)?[\s\:\.\-]*|Contato(?:\s+do\s+Cliente)?[\s\:\.\-]*|Comprador[\s\:\.\-]*|Solicitante[\s\:\.\-]*|Attn?\.?[\s\:\.\-]*|Aten[çc][ãa]o[\s\:\.\-]*)\s*([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][a-záéíóúâêîôûãõçA-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]{2,40})/i);
    if (matchContato && matchContato[1]) {
        const cand = matchContato[1].trim().replace(/\s+/g, ' ');
        if (!/micro\s*automa|vendedor|telefone|email|cnpj|data/i.test(cand)) {
            dados.contato = cand;
            dados.decisor = cand;
        }
    }

    // 4. Condições Comerciais & Frete
    const matchCond = texto.match(/Condi[çc][õo]es\s+de\s+Pagamento:\s*([^\n\r]+?)(?:Descri[çc][ãa]o|Item|Informa|\n)/i);
    if (matchCond) dados.condicoesPagamento = matchCond[1].trim();

    const matchDest = texto.match(/Destina[çc][ãa]o:\s*([^\n\r]+?)(?:Condi|Descri|\n)/i);
    if (matchDest) dados.destinacao = matchDest[1].trim();

    // Extração robusta do campo Frete (ex: "Frete: R$ 150,00", "Valor do Frete: 85,50", "Frete (CIF/FOB): ...")
    const matchFrete = texto.match(/(?:valor\s+do\s+frete|total\s+do\s+frete|frete\s*(?:\([^\)]+\))?|taxa\s+de\s+entrega)[\s\:\-\=]*(?:R\$)?\s*([0-9]{1,3}(?:\.[0-9]{3})*\,[0-9]{2}|[0-9]+\,[0-9]{2}|[0-9]+(?:\.[0-9]{2}))/i);
    if (matchFrete && matchFrete[1]) {
        dados.frete = parsearNumeroMonetario(matchFrete[1]);
    }

    // 5. Totais
    // 5.1 Total sem IPI
    const matchSemIpi = texto.match(/(?:Total\s+(?:do\s+Or[çc]amento\s+)?sem\s+IPI)[\s\:\-\=]*([0-9]{1,3}(?:\.[0-9]{3})*\,[0-9]{2}|[0-9]+\,[0-9]{2}|[0-9]+(?:\.[0-9]{2}))/i);
    if (matchSemIpi) dados.totalSemIpi = parsearNumeroMonetario(matchSemIpi[1]);

    // 5.2 Total com Impostos (incluindo variações com "+ Frete", "+ frete:", etc.)
    // Exemplo real Micro Automação: "Total do Orçamento com impostos + Frete: 381,53"
    const regexComImpostos = /(?:Total\s+(?:do\s+Or[çc]amento\s+)?(?:com|c\/)\s*impostos?(?:\s*\+\s*frete)?|Total\s+com\s+impostos?(?:\s*\+\s*frete)?)[\s\:\-\=]*(?:R\$)?\s*([0-9]{1,3}(?:\.[0-9]{3})*\,[0-9]{2}|[0-9]+\,[0-9]{2}|[0-9]+(?:\.[0-9]{2}))/i;
    const matchComImpostos = texto.match(regexComImpostos);
    if (matchComImpostos) {
        dados.totalComImpostos = parsearNumeroMonetario(matchComImpostos[1]);
        dados.totalJaIncluiFrete = /frete/i.test(matchComImpostos[0]);
    } else {
        dados.totalComImpostos = extrairPrecoFinalDeTexto(texto);
    }

    // 6. Extrator de Itens da Tabela (Item 01, Item 02...)
    dados.itens = extrairItensTabela(texto);

    return dados;
}

function extrairItensTabela(texto) {
    const itens = [];
    if (!texto) return itens;

    // Normaliza quebras de linha
    const t = texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Divide os blocos por "Item 01", "Item 02", etc.
    const itemRegex = /(Item\s+[0-9]{1,3})([\s\S]*?)(?=(?:Item\s+[0-9]{1,3}|Peso\s+Bruto|Total\s+do\s+Or[çc]amento|Informa[çc][õo]es\s+ao\s+Cliente|$))/gi;
    let bloco;

    while ((bloco = itemRegex.exec(t)) !== null) {
        const itemRotulo = bloco[1].trim();
        const corpo = bloco[2];

        // Linha principal do produto: Descrição, Código (geralmente 8 a 12 dígitos), Preço, Quantidade, UN, Total
        // Exemplo: VALV. CH3 GM 5/2 1/2 ALAVANCA BIESTAVEL ND 0259000144 930,11 6,00 UN 5.580,68
        const linhaMatch = corpo.match(/([\w\.\/\-\s]+?)\s+([0-9]{7,14})\s+([0-9\.\,]+)\s+([0-9\.\,]+)\s*(?:UN|P[ÇC]|M|KG)?\s+([0-9\.\,]+)/i);

        let descricao = '';
        let codigo = '';
        let preco = 0;
        let quantidade = 1;
        let total = 0;

        if (linhaMatch) {
            descricao = linhaMatch[1].trim().replace(/\s+/g, ' ');
            codigo = linhaMatch[2].trim();
            preco = parsearNumeroMonetario(linhaMatch[3]);
            quantidade = parsearNumeroMonetario(linhaMatch[4]) || 1;
            total = parsearNumeroMonetario(linhaMatch[5]);
        } else {
            // Tentativa alternativa caso a ordem das colunas seja ligeiramente diferente
            const matchCod = corpo.match(/([0-9]{8,14})/);
            if (matchCod) codigo = matchCod[1];

            const valores = corpo.match(/([0-9]{1,3}(?:\.[0-9]{3})*\,[0-9]{2}|[0-9]+\,[0-9]{2})/g);
            if (valores && valores.length >= 2) {
                preco = parsearNumeroMonetario(valores[0]);
                total = parsearNumeroMonetario(valores[valores.length - 1]);
            }
            // Descrição aproximada
            const linhasCorpo = corpo.split('\n').map(l => l.trim()).filter(Boolean);
            if (linhasCorpo.length > 0) descricao = linhasCorpo[0].replace(codigo, '').trim();
        }

        // Informações complementares do item
        const matchEntrega = corpo.match(/Entrega\s+at[ée]:\s*([^\n]+)/i);
        const matchNcm = corpo.match(/Classif\.\s*Fiscal:\s*([0-9]+)/i);

        itens.push({
            item: itemRotulo,
            descricao: descricao || `Produto ${itemRotulo}`,
            codigo: codigo,
            preco: preco,
            quantidade: quantidade,
            unidade: 'UN',
            total: total || (preco * quantidade),
            entrega: matchEntrega ? matchEntrega[1].trim() : '',
            classifFiscal: matchNcm ? matchNcm[1].trim() : ''
        });
    }

    return itens;
}

// Sincroniza dados do orçamento com a ficha do Lead
function aplicarDadosPdfAoLead() {
    const lead = leads.find(l => l.id === itensEditLeadId);
    if (!lead || !itensEditPdfPrincipal || !itensEditPdfPrincipal.dadosExtraidos) {
        showToast('Nenhum dado do PDF disponível para sincronizar.', 'warning');
        return;
    }

    const ex = itensEditPdfPrincipal.dadosExtraidos;
    let atualizacoes = [];

    if (ex.cliente && ex.cliente.length > 3 && !/micro\s*automa/i.test(ex.cliente)) {
        lead.empresa = ex.cliente;
        document.getElementById('itensEmpresaNome').textContent = ex.cliente;
        atualizacoes.push('Empresa');
    }
    if (ex.clienteCnpj) {
        lead.codigoUnico = ex.clienteCnpj;
        lead.cnpj = ex.clienteCnpj;
        atualizacoes.push(`CNPJ/CPF (${ex.clienteCnpj})`);
    }
    if (ex.clienteTelefone && !lead.telefone) {
        lead.telefone = ex.clienteTelefone;
        atualizacoes.push('Telefone');
    }
    if (ex.numero) {
        lead.numeroPedido = ex.numero;
        atualizacoes.push('Nº Pedido/Orçamento');
    }

    lead.atualizadoEm = new Date().toISOString();
    salvarDados();
    if (typeof salvarLeadNoBanco === 'function') {
        salvarLeadNoBanco(lead);
    }
    renderizarAll();
    showToast(`Lead sincronizado com o PDF: ${atualizacoes.join(', ')}!`, 'success');
}

// Algoritmo de identificação do Preço Final
function extrairPrecoFinalDeTexto(texto) {
    if (!texto) return 0;
    const t = texto.replace(/\s+/g, ' ');

    // 1. PRIORIDADE MÁXIMA: "Total do Orçamento com impostos (+ Frete):"
    const regexPadraoExato = /(?:total\s+(?:do\s+or[çc]amento\s+)?(?:com|c\/)\s*impostos?(?:\s*\+\s*frete)?|total\s+com\s+impostos?(?:\s*\+\s*frete)?)[\s\:\-\=]*(?:R\$)?\s*([0-9]{1,3}(?:\.[0-9]{3})*\,[0-9]{2}|[0-9]+\,[0-9]{2}|[0-9]+(?:\.[0-9]{2}))/i;
    const matchExato = regexPadraoExato.exec(t);
    if (matchExato && matchExato[1]) {
        const val = parsearNumeroMonetario(matchExato[1]);
        if (val > 0) return val;
    }

    // 2. OUTROS TERMOS DE TOTALIZAÇÃO ESPECÍFICOS (Ignorando cláusulas de faturamento/pedido mínimo)
    const padroes = [
        /(?:total\s+do\s+or[çc]amento(?:\s+com\s+frete)?|valor\s+total\s+da\s+proposta|valor\s+total|total\s+geral|preço\s+final|preco\s+final|total\s+da\s+proposta|valor\s+da\s+proposta|total\s+do\s+pedido|total\s+orçamento|total\s+orcamento|valor\s+líquido|valor\s+liquido|valor\s+global)[\s\:\-\=]*(?:R\$)?\s*([0-9]{1,3}(?:\.[0-9]{3})*\,[0-9]{2}|[0-9]+\,[0-9]{2}|[0-9]+(?:\.[0-9]{2}))/gi,
        /(?:total\s+sem\s+ipi)[\s\:\-\=]*(?:R\$)?\s*([0-9]{1,3}(?:\.[0-9]{3})*\,[0-9]{2}|[0-9]+\,[0-9]{2}|[0-9]+(?:\.[0-9]{2}))/gi
    ];

    for (const regex of padroes) {
        let match;
        let lastVal = 0;
        while ((match = regex.exec(t)) !== null) {
            // Ignora se for mínimo / faturamento mínimo / parcela mínima
            const antes = t.slice(Math.max(0, match.index - 30), match.index).toLowerCase();
            const depois = t.slice(match.index, Math.min(t.length, match.index + 60)).toLowerCase();
            if (antes.includes('mínimo') || antes.includes('minimo') || antes.includes('parcela') ||
                depois.includes('mínimo') || depois.includes('minimo') || depois.includes('parcela')) {
                continue;
            }
            if (match[1]) {
                const val = parsearNumeroMonetario(match[1]);
                if (val > 0) lastVal = val;
            }
        }
        if (lastVal > 0) return lastVal;
    }

    return 0;
}

function parsearNumeroMonetario(str) {
    if (!str) return 0;
    let s = str.trim();
    if (s.includes(',') && s.includes('.')) {
        s = s.replace(/\./g, '').replace(',', '.');
    } else if (s.includes(',')) {
        s = s.replace(',', '.');
    }
    const num = parseFloat(s);
    return isNaN(num) ? 0 : num;
}

function removerPdfVisualOrcamento() {
    if (confirm('Deseja remover este anexo de PDF da proposta?')) {
        itensEditPdfPrincipal = null;
        const input = document.getElementById('orcPdfInput');
        if (input) input.value = '';
        renderizarVisualizadorPdfOrcamento();
        recalcularTotalItens();
        showToast('PDF removido.');
    }
}

function abrirPdfEmNovaAba() {
    if (!itensEditPdfPrincipal || !itensEditPdfPrincipal.dataUrl) return;
    const janela = window.open();
    if (!janela) {
        showToast('Permita pop-ups no navegador para abrir o PDF!', 'error');
        return;
    }
    janela.document.write(`<iframe src="${itensEditPdfPrincipal.dataUrl}" style="border:none;width:100%;height:100vh;"></iframe>`);
}

function editarValorDetectadoPdf() {
    const campo = document.getElementById('itemValorDiretoPdf');
    if (campo) {
        campo.focus();
        campo.select();
    }
}

// Configuração Drag & Drop na Dropzone do PDF
document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('orcPdfDropzone');
    if (dropzone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
            }, false);
        });

        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                processarPdfVisualOrcamento(files[0]);
            }
        }, false);
    }
});

// ---------- Anexos complementares do orçamento ----------
const ANEXO_LIMITE_MB = 8;
const ANEXO_MAX_ARQUIVOS = 5;

function renderizarAnexosOrcamento() {
    const lista = document.getElementById('orcAnexosLista');
    if (!lista) return;
    if (itensEditAnexos.length === 0) {
        lista.innerHTML = '<p class="text-sm text-muted">Nenhum anexo complementar adicionado.</p>';
        return;
    }
    lista.innerHTML = itensEditAnexos.map((anexo, i) => `
        <div class="anexo-row">
            <span class="icon-sm" data-icone="nota"></span>
            <span class="text-sm" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${anexo.nome}</span>
            <button type="button" class="btn btn-outline btn-xs" onclick="abrirAnexoOrcamento(${i})">Abrir</button>
            <button type="button" class="btn btn-danger btn-xs" onclick="removerAnexoOrcamento(${i})">Remover</button>
        </div>
    `).join('');
}

function processarAnexoOrcamento(file) {
    if (!file) return;
    if (itensEditAnexos.length >= ANEXO_MAX_ARQUIVOS) {
        showToast(`Máximo de ${ANEXO_MAX_ARQUIVOS} anexos por orçamento.`, 'error');
        return;
    }
    if (file.size > ANEXO_LIMITE_MB * 1024 * 1024) {
        showToast(`O arquivo precisa ter no máximo ${ANEXO_LIMITE_MB}MB.`, 'error');
        return;
    }
    const leitor = new FileReader();
    leitor.onload = () => {
        itensEditAnexos.push({ nome: file.name, tipo: file.type, dataUrl: leitor.result });
        renderizarAnexosOrcamento();
        showToast('Anexo adicionado — clique em "Salvar Orçamento" para confirmar.');
    };
    leitor.readAsDataURL(file);
    const input = document.getElementById('orcAnexoInput');
    if (input) input.value = '';
}

function abrirAnexoOrcamento(index) {
    const anexo = itensEditAnexos[index];
    if (!anexo) return;
    const janela = window.open();
    if (!janela) {
        showToast('Permita pop-ups para abrir o anexo!', 'error');
        return;
    }
    if (anexo.tipo === 'application/pdf' || anexo.tipo.startsWith('image/')) {
        const tag = anexo.tipo.startsWith('image/')
            ? `<img src="${anexo.dataUrl}" style="max-width:100%;">`
            : `<iframe src="${anexo.dataUrl}" style="border:none;width:100%;height:100vh;"></iframe>`;
        janela.document.write(tag);
    } else {
        janela.location.href = anexo.dataUrl;
    }
}

function removerAnexoOrcamento(index) {
    itensEditAnexos.splice(index, 1);
    renderizarAnexosOrcamento();
}

function recalcularTotalItens() {
    const campoValorDireto = document.getElementById('itemValorDiretoPdf');
    const valorDireto = campoValorDireto ? (parseFloat(campoValorDireto.value) || 0) : 0;
    const subtotal = valorDireto;

    const detalheEl = document.getElementById('itensTotalResumoDetalhe');
    if (detalheEl) {
        if (itensEditPdfPrincipal) {
            const ex = itensEditPdfPrincipal.dadosExtraidos;
            detalheEl.textContent = ex && ex.itens && ex.itens.length > 0
                ? `${ex.itens.length} produto(s) extraídos da proposta (${itensEditPdfPrincipal.nome})`
                : `Origem: Proposta PDF (${itensEditPdfPrincipal.nome})`;
        } else {
            detalheEl.textContent = 'Valor definido manualmente';
        }
    }

    const desconto = parseFloat(document.getElementById('itemDesconto')?.value) || 0;
    const frete = parseFloat(document.getElementById('itemFrete')?.value) || 0;
    const total = subtotal - (subtotal * desconto / 100) + frete;
    const totalFinal = Math.max(total, 0);

    const totalGeralEl = document.getElementById('itensTotalGeral');
    if (totalGeralEl) totalGeralEl.textContent = formatarMoeda(totalFinal);
    return totalFinal;
}

// ============================================
// GERADOR DE COBRANÇA PIX (abre em outra aba, já preenchido)
// ============================================
function abrirGeradorPix() {
    const lead = leads.find(l => l.id === itensEditLeadId);
    if (!lead) return;

    const numero = lead.numeroPedido || (itensEditPdfPrincipal?.dadosExtraidos?.numero) || lead.codigoUnico || lead.id;
    const total = recalcularTotalItens();
    const valorTexto = total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const descricao = `Pagamento referente ao Orçamento ${numero}`.slice(0, 59);

    const params = new URLSearchParams({ orcamento: numero, valor: valorTexto, descricao });
    window.open(`gerador-pix.html?${params.toString()}`, '_blank');
}

function salvarItensOrcamento() {
    const lead = leads.find(l => l.id === itensEditLeadId);
    if (!lead) return;
    if (usuarioAtual && usuarioAtual.papel !== 'admin' && lead.usuarioId !== usuarioAtual.id) {
        showToast('Você não tem permissão para salvar itens neste lead.', 'error');
        return;
    }

    const desconto = parseFloat(document.getElementById('itemDesconto').value) || 0;
    const frete = parseFloat(document.getElementById('itemFrete').value) || 0;
    const condicoes = document.getElementById('itemCondicoes').value.trim();
    const obsOrcamento = document.getElementById('itemObsOrcamento').value.trim();
    const total = recalcularTotalItens();

    // Se o PDF extraiu itens, salva-os no lead
    if (itensEditPdfPrincipal?.dadosExtraidos?.itens?.length > 0) {
        lead.itens = itensEditPdfPrincipal.dadosExtraidos.itens;
    }

    // Se extraiu o número do pedido/orçamento, salva no lead
    if (itensEditPdfPrincipal?.dadosExtraidos?.numero && !lead.numeroPedido) {
        lead.numeroPedido = itensEditPdfPrincipal.dadosExtraidos.numero;
    }

    // Se o PDF extraiu CNPJ/CPF do cliente, atualiza o lead caso não possua ou possua o CNPJ da Micro Automação
    if (itensEditPdfPrincipal?.dadosExtraidos?.clienteCnpj) {
        const cnpjsIgnorar = obterCnpjsEmissorParaIgnorar();
        const docExtraido = itensEditPdfPrincipal.dadosExtraidos.clienteCnpj;
        const cnpjLeadDigitos = (lead.cnpj || '').replace(/\D/g, '');
        const codigoLeadDigitos = (lead.codigoUnico || '').replace(/\D/g, '');

        if (!lead.cnpj || cnpjsIgnorar.has(cnpjLeadDigitos)) {
            lead.cnpj = docExtraido;
        }
        if (!lead.codigoUnico || cnpjsIgnorar.has(codigoLeadDigitos)) {
            lead.codigoUnico = docExtraido;
        }
    }

    // Se o PDF extraiu contato/decisor, salva no lead se ainda não preenchido
    if (itensEditPdfPrincipal?.dadosExtraidos?.contato && (!lead.decisor || lead.decisor === '—' || lead.decisor === 'Thomaz' || lead.decisor === 'Não informado')) {
        lead.decisor = itensEditPdfPrincipal.dadosExtraidos.contato;
    }

    const subtotal = parseFloat(document.getElementById('itemValorDiretoPdf').value) || 0;
    lead.valorProdutos = subtotal;
    lead.desconto = desconto;
    lead.frete = frete;
    lead.orcamentoAnexos = itensEditAnexos;
    lead.orcamentoPdfPrincipal = itensEditPdfPrincipal;
    lead.orcamentoModo = 'pdf';
    lead.condicoes = condicoes;
    lead.obsOrcamento = obsOrcamento;

    const selectLpModelo = document.getElementById('orcLpModeloSelect');
    if (selectLpModelo && selectLpModelo.value) {
        lead.landingPageModeloId = selectLpModelo.value;
    }

    lead.valor = total;
    lead.atualizadoEm = new Date().toISOString();
    lead._modificadoLocal = true;

    if (!lead.historico) lead.historico = [];
    lead.historico.push({
        data: hoje(),
        hora: new Date().toTimeString().slice(0, 5),
        tipo: 'Orçamento',
        descricao: itensEditPdfPrincipal
            ? `Orçamento em PDF anexado (${itensEditPdfPrincipal.nome}), total ${formatarMoeda(total)}`
            : `Orçamento atualizado, total ${formatarMoeda(total)}`
    });

    if (typeof salvarCacheLocalImediato === 'function') salvarCacheLocalImediato();
    salvarDados();
    if (typeof salvarLeadNoBanco === 'function') {
        salvarLeadNoBanco(lead);
    }
    fecharModal('itensModal');
    renderizarAll();
    showToast('Orçamento salvo com sucesso!', 'success');
}

function imprimirOrcamentoPDF() {
    // Se o lead possui um PDF principal anexado, dispara a impressão direta em alta fidelidade do documento original
    if (itensEditPdfPrincipal && itensEditPdfPrincipal.dataUrl) {
        imprimirPdfOrcamentoModal();
        return;
    }

    const lead = leads.find(l => l.id === itensEditLeadId);
    if (!lead) {
        showToast('Nenhum orçamento selecionado!', 'error');
        return;
    }

    const desconto = parseFloat(document.getElementById('itemDesconto').value) || 0;
    const frete = parseFloat(document.getElementById('itemFrete').value) || 0;
    const condicoes = document.getElementById('itemCondicoes').value.trim();
    const obsOrcamento = document.getElementById('itemObsOrcamento').value.trim();
    const total = recalcularTotalItens();
    const itens = lead.itens || [];

    const subtotal = itens.reduce((acc, item) => acc + (item.preco || 0) * (item.quantidade || 0), 0) || total;
    const descontoValor = subtotal * desconto / 100;
    const marcaEmpresa = (typeof empresaAtual !== 'undefined' && empresaAtual) ? empresaAtual : { nome: 'Feitosa CRM', cnpj: '', email: '', telefone: '', endereco: '' };

    let linhasItens = itens.map((item, i) => `
        <tr>
            <td style="text-align:center;">${i + 1}</td>
            <td>${item.descricao} ${item.codigo ? `<span style="color:#666;font-size:11px;">(${item.codigo})</span>` : ''}</td>
            <td style="text-align:center;">${item.quantidade}</td>
            <td style="text-align:right;">${formatarMoeda(item.preco || 0)}</td>
            <td style="text-align:right;font-weight:700;">${formatarMoeda((item.preco || 0) * (item.quantidade || 0))}</td>
        </tr>
    `).join('');

    if (!linhasItens && total > 0) {
        linhasItens = `
        <tr>
            <td style="text-align:center;">1</td>
            <td>Proposta Comercial / Orçamento</td>
            <td style="text-align:center;">1</td>
            <td style="text-align:right;">${formatarMoeda(total)}</td>
            <td style="text-align:right;font-weight:700;">${formatarMoeda(total)}</td>
        </tr>
        `;
    }

    const htmlPDF = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Orçamento - ${lead.empresa}</title>
    <style>
        body { font-family: Arial, Helvetica, sans-serif; padding: 40px; color: #1a2332; background: #fff; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2d4863; padding-bottom: 20px; }
        .header h1 { margin: 0; color: #2d4863; font-size: 28px; }
        .header p { margin: 4px 0; color: #666; font-size: 12px; }
        .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .info-block { background: #f0f2f5; padding: 15px; border-radius: 8px; }
        .info-block h3 { margin: 0 0 10px 0; font-size: 13px; color: #666; text-transform: uppercase; }
        .info-block p { margin: 4px 0; font-size: 14px; }
        .info-block strong { color: #1a2332; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #2d4863; color: #fff; padding: 12px; text-align: left; font-size: 13px; font-weight: 600; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        tr:nth-child(even) { background: #f9fafb; }
        .totals { margin-top: 20px; display: flex; justify-content: flex-end; }
        .totals-table { width: 300px; }
        .totals-table tr td { border: none; padding: 8px 12px; }
        .totals-table tr:last-child { border-top: 2px solid #2d4863; font-weight: 700; font-size: 16px; background: #f0f2f5; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666; }
        .footer-note { background: #f0f2f5; padding: 15px; border-radius: 8px; margin-top: 15px; }
        @media print { body { padding: 0; } .header { border-bottom: 2px solid #2d4863; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>ORÇAMENTO</h1>
        <p>${marcaEmpresa.nome || 'Sistema de Gestão de Vendas'}${marcaEmpresa.cnpj ? ` — CNPJ: ${marcaEmpresa.cnpj}` : ''}</p>
        ${marcaEmpresa.email || marcaEmpresa.telefone ? `<p>${marcaEmpresa.email || ''}${marcaEmpresa.email && marcaEmpresa.telefone ? ' • ' : ''}${marcaEmpresa.telefone || ''}</p>` : ''}
    </div>

    <div class="info-section">
        <div class="info-block">
            <h3>Empresa</h3>
            <p><strong>${lead.empresa}</strong></p>
            <p>CNPJ: <strong>${lead.codigoUnico || 'N/A'}</strong></p>
            <p>Contato: <strong>${lead.decisor || 'N/A'}</strong></p>
            <p>E-mail: <strong>${lead.email || 'N/A'}</strong></p>
            <p>Telefone: <strong>${lead.telefone || 'N/A'}</strong></p>
        </div>
        <div class="info-block">
            <h3>Detalhes do Orçamento</h3>
            <p>Data: <strong>${formatarData(hoje())}</strong></p>
            <p>Etapa: <strong>${typeof ETAPA_NOMES !== 'undefined' ? (ETAPA_NOMES[lead.etapa] || lead.etapa) : lead.etapa}</strong></p>
            <p>Potencial: <strong>${lead.potencial || 'N/A'}</strong></p>
            <p>Cidade: <strong>${lead.cidade || 'N/A'} / ${lead.estado || 'N/A'}</strong></p>
        </div>
    </div>

    <h3 style="margin-top:30px;margin-bottom:10px;">Itens do Orçamento</h3>
    <table>
        <thead>
            <tr>
                <th style="width:5%;">#</th>
                <th style="width:45%;">Descrição</th>
                <th style="width:15%;text-align:center;">Quantidade</th>
                <th style="width:15%;text-align:right;">Preço Unit.</th>
                <th style="width:20%;text-align:right;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            ${linhasItens || '<tr><td colspan="5" style="text-align:center;">Nenhum item adicionado</td></tr>'}
        </tbody>
    </table>

    <div class="totals">
        <table class="totals-table">
            <tr>
                <td>Subtotal:</td>
                <td style="text-align:right;">${formatarMoeda(subtotal)}</td>
            </tr>
            ${desconto > 0 ? `
            <tr>
                <td>Desconto (${desconto}%):</td>
                <td style="text-align:right;">-${formatarMoeda(descontoValor)}</td>
            </tr>
            ` : ''}
            ${frete > 0 ? `
            <tr>
                <td>Frete:</td>
                <td style="text-align:right;">+${formatarMoeda(frete)}</td>
            </tr>
            ` : ''}
            <tr>
                <td>TOTAL:</td>
                <td style="text-align:right;">${formatarMoeda(total)}</td>
            </tr>
        </table>
    </div>

    ${condicoes ? `
    <div class="footer-note">
        <strong>Condições de Pagamento:</strong><br>
        ${condicoes}
    </div>
    ` : ''}

    ${obsOrcamento ? `
    <div class="footer-note">
        <strong>Observações:</strong><br>
        ${obsOrcamento}
    </div>
    ` : ''}

    <div class="footer">
        <p style="margin:0;">Este orçamento foi gerado automaticamente por ${marcaEmpresa.nome || 'o CRM'} em ${formatarData(hoje())} às ${new Date().toTimeString().slice(0, 5)}.</p>
        <p style="margin:8px 0 0 0;">Para dúvidas ou alterações, favor entrar em contato conosco.</p>
    </div>
</body>
</html>
    `;

    const janela = window.open('', '_blank');
    if (!janela) {
        showToast('Permita pop-ups para gerar o PDF!', 'error');
        return;
    }
    janela.document.write(htmlPDF);
    janela.document.close();
    setTimeout(() => { janela.focus(); janela.print(); }, 500);
    showToast('Orçamento pronto para imprimir!');
}

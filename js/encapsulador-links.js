// =========================================================================
// FEITOSA CRM - ENCAPSULADOR DE LINKS EM PDF E IMAGEM
// Ferramenta rápida de marketing e propostas interativas para WhatsApp e E-mail
// =========================================================================

let encapsuladorEstado = {
    modoAtual: 'pdf', // 'pdf' | 'imagem'
    pdfAtual: {
        file: null,
        nome: '',
        tamanho: 0,
        bytes: null,
        numPaginas: 0,
        linkGeradoUrl: null,
        linkGeradoNome: '',
        blobGerado: null
    },
    imagemAtual: {
        file: null,
        nome: '',
        tamanho: 0,
        dataUrl: '',
        bytes: null,
        formato: 'png', // 'png' | 'jpeg'
        largura: 0,
        altura: 0,
        htmlGerado: '',
        pdfGeradoUrl: null,
        pdfGeradoBlob: null,
        pdfGeradoNome: ''
    },
    historico: []
};

// ================================================================
// INICIALIZAÇÃO
// ================================================================
function inicializarEncapsuladorLinks() {
    configurarDropzonesEncapsulador();
    carregarHistoricoEncapsulador();
    preencherSeletorLeadsEncapsulador();
    atualizarUiEncapsulador();
}

function alternarModoEncapsulador(modo) {
    encapsuladorEstado.modoAtual = modo;
    const btnPdf = document.getElementById('encBtnModoPdf');
    const btnImg = document.getElementById('encBtnModoImagem');
    const cardPdf = document.getElementById('encCardModoPdf');
    const cardImg = document.getElementById('encCardModoImagem');

    if (modo === 'imagem') {
        btnPdf?.classList.remove('btn-primary');
        btnPdf?.classList.add('btn-outline');
        btnImg?.classList.remove('btn-outline');
        btnImg?.classList.add('btn-primary');
        if (cardPdf) cardPdf.style.display = 'none';
        if (cardImg) cardImg.style.display = 'block';
    } else {
        btnImg?.classList.remove('btn-primary');
        btnImg?.classList.add('btn-outline');
        btnPdf?.classList.remove('btn-outline');
        btnPdf?.classList.add('btn-primary');
        if (cardImg) cardImg.style.display = 'none';
        if (cardPdf) cardPdf.style.display = 'block';
    }
}

// ================================================================
// DROPZONES E DRAG & DROP
// ================================================================
function configurarDropzonesEncapsulador() {
    const dropzonePdf = document.getElementById('encPdfDropzone');
    const inputPdf = document.getElementById('encPdfFileInput');

    if (dropzonePdf && inputPdf) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzonePdf.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzonePdf.classList.add('dragover');
            }, false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            dropzonePdf.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzonePdf.classList.remove('dragover');
            }, false);
        });
        dropzonePdf.addEventListener('drop', (e) => {
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                processarArquivoPdfSelecionado(files[0]);
            }
        });
    }

    const dropzoneImg = document.getElementById('encImgDropzone');
    const inputImg = document.getElementById('encImgFileInput');

    if (dropzoneImg && inputImg) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzoneImg.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzoneImg.classList.add('dragover');
            }, false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            dropzoneImg.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzoneImg.classList.remove('dragover');
            }, false);
        });
        dropzoneImg.addEventListener('drop', (e) => {
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                processarArquivoImagemSelecionado(files[0]);
            }
        });
    }
}

// ================================================================
// SELETOR DE LEADS CADASTRADOS (PRESETS RÁPIDOS)
// ================================================================
function preencherSeletorLeadsEncapsulador() {
    const selPdf = document.getElementById('encSeletorLeadPdf');
    const selLink = document.getElementById('encSeletorLeadLink');
    const selLinkImg = document.getElementById('encSeletorLeadLinkImg');

    const listaLeads = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads : [];

    // Preenche Leads com orçamentos em anexo para o Dropdown do PDF
    if (selPdf) {
        selPdf.innerHTML = '<option value="">📂 Ou selecione um orçamento de Lead já cadastrado...</option>';
        const leadsComPdf = listaLeads.filter(l => l.orcamentoPdfPrincipal || (l.orcamentoAnexos && l.orcamentoAnexos.length > 0));
        leadsComPdf.forEach(l => {
            const opt = document.createElement('option');
            opt.value = l.id;
            const valorFmt = typeof formatarMoeda === 'function' ? formatarMoeda(l.valor || 0) : ('R$ ' + (l.valor || 0));
            opt.textContent = `${l.empresa || l.nome || 'Lead sem nome'} - ${valorFmt}`;
            selPdf.appendChild(opt);
        });
        if (leadsComPdf.length === 0) {
            const opt = document.createElement('option');
            opt.value = "";
            opt.disabled = true;
            opt.textContent = "Nenhum lead com orçamento em anexo encontrado";
            selPdf.appendChild(opt);
        }
    }

    // Preenche seletor de Link de Destino da Landing Page
    const preencherSelLink = (selectEl) => {
        if (!selectEl) return;
        selectEl.innerHTML = '<option value="">🌐 Inserir Link da Landing Page de um Lead...</option>';
        listaLeads.slice(0, 100).forEach(l => {
            const opt = document.createElement('option');
            opt.value = l.id;
            opt.textContent = `${l.empresa || l.nome || 'Lead'} (ID: ${l.id || l.codigoUnico || ''})`;
            selectEl.appendChild(opt);
        });
    };

    preencherSelLink(selLink);
    preencherSelLink(selLinkImg);
}

// ================================================================
// MODO 1: PROCESSAR PDF
// ================================================================
async function processarArquivoPdfSelecionado(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        if (typeof showToast === 'function') showToast('Por favor, selecione um arquivo em formato PDF (.pdf).', 'error');
        return;
    }

    try {
        const buffer = await file.arrayBuffer();
        encapsuladorEstado.pdfAtual.file = file;
        encapsuladorEstado.pdfAtual.nome = file.name;
        encapsuladorEstado.pdfAtual.tamanho = file.size;
        encapsuladorEstado.pdfAtual.bytes = new Uint8Array(buffer);
        encapsuladorEstado.pdfAtual.linkGeradoUrl = null;
        encapsuladorEstado.pdfAtual.blobGerado = null;

        // Verifica com PDFLib
        if (window.PDFLib && window.PDFLib.PDFDocument) {
            const pdfDoc = await window.PDFLib.PDFDocument.load(encapsuladorEstado.pdfAtual.bytes);
            encapsuladorEstado.pdfAtual.numPaginas = pdfDoc.getPageCount();
        } else {
            encapsuladorEstado.pdfAtual.numPaginas = 1;
        }

        renderizarCardPdfCarregado();
        gerarMiniaturaPdfCanvas(encapsuladorEstado.pdfAtual.bytes);

        if (typeof showToast === 'function') {
            showToast(`PDF carregado: ${file.name} (${encapsuladorEstado.pdfAtual.numPaginas} páginas)`, 'success');
        }
    } catch (err) {
        console.error('Erro ao ler arquivo PDF:', err);
        if (typeof showToast === 'function') showToast('Não foi possível ler este arquivo PDF. Verifique se não está corrompido.', 'error');
    }
}

async function carregarPdfDoLeadSelecionado(leadId) {
    if (!leadId) return;
    const listaLeads = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads : [];
    const lead = listaLeads.find(l => l.id === leadId);
    if (!lead) return;

    let pdfDataUrl = null;
    let nomeArquivo = `proposta_${lead.empresa || lead.id}.pdf`;

    if (lead.orcamentoPdfPrincipal && lead.orcamentoPdfPrincipal.dataUrl) {
        pdfDataUrl = lead.orcamentoPdfPrincipal.dataUrl;
        if (lead.orcamentoPdfPrincipal.nome) nomeArquivo = lead.orcamentoPdfPrincipal.nome;
    } else if (lead.orcamentoAnexos && lead.orcamentoAnexos.length > 0) {
        const anexoPdf = lead.orcamentoAnexos.find(a => (a.tipo && a.tipo.includes('pdf')) || (a.nome && a.nome.endsWith('.pdf')));
        if (anexoPdf && anexoPdf.dataUrl) {
            pdfDataUrl = anexoPdf.dataUrl;
            if (anexoPdf.nome) nomeArquivo = anexoPdf.nome;
        }
    }

    if (!pdfDataUrl) {
        if (typeof showToast === 'function') showToast('Este lead não possui um orçamento em PDF anexado.', 'warning');
        return;
    }

    try {
        const res = await fetch(pdfDataUrl);
        const blob = await res.blob();
        const file = new File([blob], nomeArquivo, { type: 'application/pdf' });
        await processarArquivoPdfSelecionado(file);

        // Preenche automaticamente o link com a Landing Page deste lead se o campo de link estiver vazio
        const inputLink = document.getElementById('encPdfLinkDestino');
        if (inputLink && !inputLink.value.trim()) {
            aplicarLinkLandingPageLead(lead.id, 'pdf');
        }
    } catch (e) {
        console.error('Erro ao carregar PDF do lead:', e);
        if (typeof showToast === 'function') showToast('Erro ao carregar o PDF do lead.', 'error');
    }
}

function renderizarCardPdfCarregado() {
    const boxVazio = document.getElementById('encPdfVazioWrap');
    const boxCarregado = document.getElementById('encPdfCarregadoWrap');
    const lblNome = document.getElementById('encPdfNomeInfo');
    const lblMeta = document.getElementById('encPdfMetaInfo');
    const resultadoArea = document.getElementById('encPdfResultadoArea');

    if (resultadoArea) resultadoArea.style.display = 'none';

    if (encapsuladorEstado.pdfAtual.bytes) {
        if (boxVazio) boxVazio.style.display = 'none';
        if (boxCarregado) boxCarregado.style.display = 'flex';
        if (lblNome) lblNome.textContent = encapsuladorEstado.pdfAtual.nome;
        if (lblMeta) {
            const kb = (encapsuladorEstado.pdfAtual.tamanho / 1024).toFixed(1);
            const pags = encapsuladorEstado.pdfAtual.numPaginas;
            lblMeta.textContent = `${kb} KB • ${pags} ${pags === 1 ? 'página' : 'páginas'}`;
        }
    } else {
        if (boxVazio) boxVazio.style.display = 'block';
        if (boxCarregado) boxCarregado.style.display = 'none';
    }
}

function removerPdfCarregado() {
    encapsuladorEstado.pdfAtual = {
        file: null,
        nome: '',
        tamanho: 0,
        bytes: null,
        numPaginas: 0,
        linkGeradoUrl: null,
        linkGeradoNome: '',
        blobGerado: null
    };
    const inputPdf = document.getElementById('encPdfFileInput');
    if (inputPdf) inputPdf.value = '';
    const selLead = document.getElementById('encSeletorLeadPdf');
    if (selLead) selLead.value = '';
    renderizarCardPdfCarregado();
}

async function gerarMiniaturaPdfCanvas(bytes) {
    const canvas = document.getElementById('encPdfPreviewCanvas');
    if (!canvas || !window.pdfjsLib || !bytes) return;

    try {
        const loadingTask = window.pdfjsLib.getDocument({ data: bytes.slice() });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.35 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
    } catch (e) {
        console.warn('Miniatura canvas não renderizada:', e);
    }
}

// ================================================================
// ATALHOS RÁPIDOS DE LINK
// ================================================================
function aplicarLinkLandingPageLead(leadId, modo = 'pdf') {
    if (!leadId) return;
    const listaLeads = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads : [];
    const lead = listaLeads.find(l => l.id === leadId);
    if (!lead) return;

    let urlLp = '';
    if (typeof gerarUrlPublicaLandingPage === 'function') {
        urlLp = gerarUrlPublicaLandingPage(lead);
    } else {
        const baseUrl = window.location.origin + window.location.pathname;
        urlLp = `${baseUrl}?lp=1&lead_id=${encodeURIComponent(lead.id)}&cnpj=${encodeURIComponent(lead.cnpj || '')}`;
    }

    const inputTarget = (modo === 'imagem') 
        ? document.getElementById('encImgLinkDestino') 
        : document.getElementById('encPdfLinkDestino');

    if (inputTarget) {
        inputTarget.value = urlLp;
        inputTarget.focus();
        if (typeof showToast === 'function') showToast(`Link da Landing Page de ${lead.empresa || lead.nome} inserido!`, 'info');
    }
}

function aplicarAtalhoWhatsapp(modo = 'pdf') {
    let telefone = '';
    if (typeof usuarioAtual !== 'undefined' && usuarioAtual && usuarioAtual.telefone) {
        telefone = usuarioAtual.telefone.replace(/\D/g, '');
    }
    if (!telefone) {
        telefone = prompt('Digite o número de WhatsApp para onde o cliente será direcionado (com DDD, ex: 11999998888):', '11999998888');
    }
    if (!telefone) return;
    telefone = telefone.replace(/\D/g, '');
    if (!telefone.startsWith('55') && telefone.length <= 11) {
        telefone = '55' + telefone;
    }

    const msg = encodeURIComponent('Olá! Gostaria de conversar a respeito da proposta comercial.');
    const waUrl = `https://wa.me/${telefone}?text=${msg}`;

    const inputTarget = (modo === 'imagem') 
        ? document.getElementById('encImgLinkDestino') 
        : document.getElementById('encPdfLinkDestino');

    if (inputTarget) {
        inputTarget.value = waUrl;
        inputTarget.focus();
        if (typeof showToast === 'function') showToast('Link direto para seu WhatsApp inserido!', 'info');
    }
}

function aplicarAtalhoPortalProposta(modo = 'pdf') {
    const baseUrl = window.location.origin + window.location.pathname;
    const portalUrl = `${baseUrl}?portal=1`;

    const inputTarget = (modo === 'imagem') 
        ? document.getElementById('encImgLinkDestino') 
        : document.getElementById('encPdfLinkDestino');

    if (inputTarget) {
        inputTarget.value = portalUrl;
        inputTarget.focus();
        if (typeof showToast === 'function') showToast('Link do Portal de Propostas inserido!', 'info');
    }
}

// ================================================================
// FUSÃO / ENCAPSULAR LINK NO PDF (PASSO 3)
// ================================================================
async function executarFusaoEncapsularPdf() {
    const bytesOriginal = encapsuladorEstado.pdfAtual.bytes;
    if (!bytesOriginal || bytesOriginal.length === 0) {
        if (typeof showToast === 'function') showToast('Por favor, adicione um arquivo PDF primeiro (Passo 1).', 'warning');
        return;
    }

    const inputLink = document.getElementById('encPdfLinkDestino');
    let urlDestino = (inputLink ? inputLink.value : '').trim();

    if (!urlDestino) {
        if (typeof showToast === 'function') showToast('Por favor, informe a URL ou link de destino (Passo 2).', 'warning');
        inputLink?.focus();
        return;
    }

    // Corrige protocolo se esquecido
    if (!/^https?:\/\//i.test(urlDestino) && !urlDestino.startsWith('mailto:') && !urlDestino.startsWith('tel:') && !urlDestino.startsWith('wa.me')) {
        urlDestino = 'https://' + urlDestino;
        if (inputLink) inputLink.value = urlDestino;
    }

    const btnGerar = document.getElementById('encBtnGerarFusaoPdf');
    const textoOriginalBtn = btnGerar ? btnGerar.innerHTML : '';
    if (btnGerar) {
        btnGerar.disabled = true;
        btnGerar.innerHTML = '⏳ Gerando Fusão & Encapsulando Link...';
    }

    try {
        if (!window.PDFLib || !window.PDFLib.PDFDocument) {
            throw new Error('A biblioteca PDF-Lib não foi carregada no navegador.');
        }

        const { PDFDocument, PDFName, PDFString, rgb, StandardFonts } = window.PDFLib;
        const pdfDoc = await PDFDocument.load(bytesOriginal);
        const totalPaginas = pdfDoc.getPageCount();

        // Opções da UI
        const cobrirPaginaInteira = document.getElementById('encPdfOptPaginaInteira')?.checked !== false;
        const incluirBarraCta = document.getElementById('encPdfOptIncluirBarra')?.checked !== false;
        const textoBarra = (document.getElementById('encPdfTextoBarra')?.value || '👉 TOQUE AQUI PARA ABRIR A PROPOSTA ONLINE OU WHATSAPP').trim();
        const corBarraHex = document.getElementById('encPdfCorBarra')?.value || '#0057a8';
        const posicaoBarra = document.getElementById('encPdfPosicaoBarra')?.value || 'rodape'; // 'rodape' | 'cabecalho'
        const aplicarEm = document.getElementById('encPdfAplicarEm')?.value || 'todas'; // 'todas' | 'primeira' | 'ultima'

        // Converte cor hex para RGB (0..1)
        const hexToRgb = (hex) => {
            const h = hex.replace('#', '');
            const r = parseInt(h.substring(0, 2), 16) / 255;
            const g = parseInt(h.substring(2, 4), 16) / 255;
            const b = parseInt(h.substring(4, 6), 16) / 255;
            return rgb(isNaN(r) ? 0 : r, isNaN(g) ? 0.34 : g, isNaN(b) ? 0.66 : b);
        };
        const corRgb = hexToRgb(corBarraHex);

        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Define quais páginas receberão o link
        const indicesPaginas = [];
        if (aplicarEm === 'primeira') {
            indicesPaginas.push(0);
        } else if (aplicarEm === 'ultima') {
            indicesPaginas.push(totalPaginas - 1);
        } else {
            for (let i = 0; i < totalPaginas; i++) indicesPaginas.push(i);
        }

        // Processa cada página alvo
        for (const idx of indicesPaginas) {
            const page = pdfDoc.getPage(idx);
            const { width, height } = page.getSize();

            const barraAltura = 36;
            const barraMargem = 14;
            const barraLargura = width - (barraMargem * 2);
            let barraY = barraMargem;

            if (posicaoBarra === 'cabecalho') {
                barraY = height - barraAltura - barraMargem;
            }

            // 1. Desenha barra/botão visual de chamada se solicitado
            if (incluirBarraCta) {
                // Fundo do botão/banner
                page.drawRectangle({
                    x: barraMargem,
                    y: barraY,
                    width: barraLargura,
                    height: barraAltura,
                    color: corRgb,
                    borderWidth: 0,
                    borderRadius: 4
                });

                // Calcula tamanho do texto e centraliza
                let fontSize = 10;
                let textWidth = helveticaBold.widthOfTextAtSize(textoBarra, fontSize);
                if (textWidth > barraLargura - 20) {
                    fontSize = Math.max(7.5, (barraLargura - 20) / textoBarra.length * 1.6);
                    textWidth = helveticaBold.widthOfTextAtSize(textoBarra, fontSize);
                }

                const textX = barraMargem + Math.max(8, (barraLargura - textWidth) / 2);
                const textY = barraY + (barraAltura / 2) - (fontSize / 3);

                page.drawText(textoBarra, {
                    x: textX,
                    y: textY,
                    size: fontSize,
                    font: helveticaBold,
                    color: rgb(1, 1, 1)
                });
            }

            // 2. Cria anotação de Link interativo
            // Se cobrir página inteira: [0, 0, width, height]
            // Se apenas na barra: [barraMargem, barraY, barraMargem + barraLargura, barraY + barraAltura]
            const rect = cobrirPaginaInteira
                ? [0, 0, width, height]
                : [barraMargem, barraY, barraMargem + barraLargura, barraY + barraAltura];

            const linkAnnot = pdfDoc.context.obj({
                Type: 'Annot',
                Subtype: 'Link',
                Rect: rect,
                Border: [0, 0, 0],
                C: [0, 0, 0],
                A: {
                    Type: 'Action',
                    S: 'URI',
                    URI: PDFString.of(urlDestino)
                }
            });

            const linkRef = pdfDoc.context.register(linkAnnot);

            // Obtém ou cria array de anotações da página
            let annots = page.node.lookup(PDFName.of('Annots'));
            if (!annots) {
                annots = pdfDoc.context.obj([]);
                page.node.set(PDFName.of('Annots'), annots);
            }
            annots.push(linkRef);
        }

        // Salva com useObjectStreams false para compatibilidade universal com leitores de celular e WhatsApp
        const pdfModificadoBytes = await pdfDoc.save({ useObjectStreams: false });
        const blobModificado = new Blob([pdfModificadoBytes], { type: 'application/pdf' });
        const urlDownload = URL.createObjectURL(blobModificado);

        const nomeOriginalLimpo = (encapsuladorEstado.pdfAtual.nome || 'proposta').replace(/\.pdf$/i, '');
        const nomeFinal = `${nomeOriginalLimpo}_com_link_clicavel.pdf`;

        encapsuladorEstado.pdfAtual.linkGeradoUrl = urlDownload;
        encapsuladorEstado.pdfAtual.linkGeradoNome = nomeFinal;
        encapsuladorEstado.pdfAtual.blobGerado = blobModificado;

        // Exibe área de resultado com opções
        exibirResultadoPdfEncapsulado(urlDownload, nomeFinal, urlDestino, pdfModificadoBytes.length);

        // Salva no histórico
        salvarItemHistorico({
            tipo: 'pdf',
            nomeOriginal: encapsuladorEstado.pdfAtual.nome,
            nomeFinal: nomeFinal,
            linkDestino: urlDestino,
            tamanho: pdfModificadoBytes.length,
            dataHora: new Date().toISOString()
        });

        if (typeof showToast === 'function') {
            showToast('🎉 PDF encapsulado com sucesso! O link está ativo e clicável.', 'success');
        }
    } catch (err) {
        console.error('Erro na fusão do PDF com link:', err);
        if (typeof showToast === 'function') {
            showToast('Erro ao encapsular o PDF: ' + (err.message || 'Falha no processamento'), 'error');
        }
    } finally {
        if (btnGerar) {
            btnGerar.disabled = false;
            btnGerar.innerHTML = textoOriginalBtn;
        }
    }
}

function exibirResultadoPdfEncapsulado(urlDownload, nomeArquivo, urlDestino, tamanhoBytes) {
    const area = document.getElementById('encPdfResultadoArea');
    if (!area) return;

    const elNome = document.getElementById('encResPdfNome');
    const elLink = document.getElementById('encResPdfLink');
    const elTamanho = document.getElementById('encResPdfTamanho');
    const btnBaixar = document.getElementById('encBtnBaixarPdfPronto');
    const btnAbrir = document.getElementById('encBtnAbrirPdfPronto');

    if (elNome) elNome.textContent = nomeArquivo;
    if (elLink) {
        elLink.textContent = urlDestino;
        elLink.href = urlDestino;
    }
    if (elTamanho) {
        elTamanho.textContent = `${(tamanhoBytes / 1024).toFixed(1)} KB`;
    }

    if (btnBaixar) {
        btnBaixar.onclick = () => baixarPdfEncapsuladoPronto();
    }
    if (btnAbrir) {
        btnAbrir.onclick = () => window.open(urlDownload, '_blank');
    }

    area.style.display = 'block';
    area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function baixarPdfEncapsuladoPronto() {
    if (!encapsuladorEstado.pdfAtual.linkGeradoUrl) return;
    const a = document.createElement('a');
    a.href = encapsuladorEstado.pdfAtual.linkGeradoUrl;
    a.download = encapsuladorEstado.pdfAtual.linkGeradoNome || 'proposta_com_link.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof showToast === 'function') showToast('Download do PDF iniciado!', 'success');
}

function compartilharPdfEncapsuladoWhatsapp() {
    const linkDestino = (document.getElementById('encPdfLinkDestino')?.value || '').trim();
    const nomePdf = encapsuladorEstado.pdfAtual.linkGeradoNome || 'documento.pdf';
    
    baixarPdfEncapsuladoPronto();

    const texto = encodeURIComponent(
        `Olá! Segue em anexo a nossa proposta comercial em PDF interativo.\n\n` +
        `💡 Ao abrir o PDF anexo, basta clicar/tocar em qualquer página para acessar o link exclusivo: ${linkDestino}\n\n` +
        `Qualquer dúvida estou à disposição!`
    );

    window.open(`https://wa.me/?text=${texto}`, '_blank');
}

// ================================================================
// MODO 2: ENCAPSULADOR DE LINK EM IMAGEM (PNG / JPEG)
// ================================================================
function processarArquivoImagemSelecionado(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        if (typeof showToast === 'function') showToast('Por favor, selecione um arquivo de imagem (PNG, JPG, JPEG ou WEBP).', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUrl = e.target.result;
        const img = new Image();
        img.onload = async () => {
            const buffer = await file.arrayBuffer();
            const isPng = file.type.includes('png') || file.name.toLowerCase().endsWith('.png');

            encapsuladorEstado.imagemAtual = {
                file: file,
                nome: file.name,
                tamanho: file.size,
                dataUrl: dataUrl,
                bytes: new Uint8Array(buffer),
                formato: isPng ? 'png' : 'jpeg',
                largura: img.naturalWidth || img.width,
                altura: img.naturalHeight || img.height,
                htmlGerado: '',
                pdfGeradoUrl: null,
                pdfGeradoBlob: null,
                pdfGeradoNome: ''
            };

            renderizarCardImagemCarregada();
            if (typeof showToast === 'function') {
                showToast(`Imagem carregada: ${file.name} (${encapsuladorEstado.imagemAtual.largura}x${encapsuladorEstado.imagemAtual.altura}px)`, 'success');
            }
        };
        img.src = dataUrl;
    };
    reader.readAsDataURL(file);
}

function renderizarCardImagemCarregada() {
    const boxVazio = document.getElementById('encImgVazioWrap');
    const boxCarregado = document.getElementById('encImgCarregadoWrap');
    const previewEl = document.getElementById('encImgPreviewElem');
    const lblNome = document.getElementById('encImgNomeInfo');
    const lblMeta = document.getElementById('encImgMetaInfo');
    const resultadoArea = document.getElementById('encImgResultadoArea');

    if (resultadoArea) resultadoArea.style.display = 'none';

    if (encapsuladorEstado.imagemAtual.dataUrl) {
        if (boxVazio) boxVazio.style.display = 'none';
        if (boxCarregado) boxCarregado.style.display = 'flex';
        if (previewEl) previewEl.src = encapsuladorEstado.imagemAtual.dataUrl;
        if (lblNome) lblNome.textContent = encapsuladorEstado.imagemAtual.nome;
        if (lblMeta) {
            const kb = (encapsuladorEstado.imagemAtual.tamanho / 1024).toFixed(1);
            lblMeta.textContent = `${encapsuladorEstado.imagemAtual.largura}x${encapsuladorEstado.imagemAtual.altura} px • ${kb} KB • ${encapsuladorEstado.imagemAtual.formato.toUpperCase()}`;
        }
    } else {
        if (boxVazio) boxVazio.style.display = 'block';
        if (boxCarregado) boxCarregado.style.display = 'none';
    }
}

function removerImagemCarregada() {
    encapsuladorEstado.imagemAtual = {
        file: null,
        nome: '',
        tamanho: 0,
        dataUrl: '',
        bytes: null,
        formato: 'png',
        largura: 0,
        altura: 0,
        htmlGerado: '',
        pdfGeradoUrl: null,
        pdfGeradoBlob: null,
        pdfGeradoNome: ''
    };
    const input = document.getElementById('encImgFileInput');
    if (input) input.value = '';
    renderizarCardImagemCarregada();
}

async function executarFusaoEncapsularImagem() {
    const imgObj = encapsuladorEstado.imagemAtual;
    if (!imgObj.bytes || !imgObj.dataUrl) {
        if (typeof showToast === 'function') showToast('Por favor, carregue uma imagem PNG ou JPEG primeiro.', 'warning');
        return;
    }

    const inputLink = document.getElementById('encImgLinkDestino');
    let urlDestino = (inputLink ? inputLink.value : '').trim();

    if (!urlDestino) {
        if (typeof showToast === 'function') showToast('Por favor, informe a URL ou link de destino.', 'warning');
        inputLink?.focus();
        return;
    }

    if (!/^https?:\/\//i.test(urlDestino) && !urlDestino.startsWith('mailto:') && !urlDestino.startsWith('tel:') && !urlDestino.startsWith('wa.me')) {
        urlDestino = 'https://' + urlDestino;
        if (inputLink) inputLink.value = urlDestino;
    }

    const textoAlt = (document.getElementById('encImgTextoAlt')?.value || 'Acesse a proposta comercial').trim();
    const btnGerar = document.getElementById('encBtnGerarFusaoImagem');
    const textoOriginalBtn = btnGerar ? btnGerar.innerHTML : '';
    if (btnGerar) {
        btnGerar.disabled = true;
        btnGerar.innerHTML = '⏳ Gerando Encapsulamento...';
    }

    try {
        // 1. Gera código HTML limpo e responsivo para E-mail Marketing
        const htmlSnippet = `<a href="${urlDestino}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;border:none;">\n` +
            `  <img src="${imgObj.dataUrl}" alt="${textoAlt}" style="max-width:100%;height:auto;display:block;border:0;border-radius:6px;outline:none;" />\n` +
            `</a>`;

        imgObj.htmlGerado = htmlSnippet;

        // 2. Converte Imagem em PDF de 1 página 100% Clicável (Inovação para WhatsApp!)
        let pdfBytes = null;
        if (window.PDFLib && window.PDFLib.PDFDocument) {
            const { PDFDocument, PDFName, PDFString } = window.PDFLib;
            const pdfDoc = await PDFDocument.create();

            let embeddedImage = null;
            if (imgObj.formato === 'png') {
                embeddedImage = await pdfDoc.embedPng(imgObj.bytes);
            } else {
                embeddedImage = await pdfDoc.embedJpg(imgObj.bytes);
            }

            const imgWidth = embeddedImage.width;
            const imgHeight = embeddedImage.height;

            const page = pdfDoc.addPage([imgWidth, imgHeight]);
            page.drawImage(embeddedImage, {
                x: 0,
                y: 0,
                width: imgWidth,
                height: imgHeight
            });

            // Anotação cobrindo a imagem inteira
            const linkAnnot = pdfDoc.context.obj({
                Type: 'Annot',
                Subtype: 'Link',
                Rect: [0, 0, imgWidth, imgHeight],
                Border: [0, 0, 0],
                C: [0, 0, 0],
                A: {
                    Type: 'Action',
                    S: 'URI',
                    URI: PDFString.of(urlDestino)
                }
            });
            const linkRef = pdfDoc.context.register(linkAnnot);
            const annots = pdfDoc.context.obj([linkRef]);
            page.node.set(PDFName.of('Annots'), annots);

            pdfBytes = await pdfDoc.save({ useObjectStreams: false });
            const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(pdfBlob);

            const nomeBase = imgObj.nome.replace(/\.[a-zA-Z0-9]+$/, '');
            const pdfNome = `${nomeBase}_banner_clicavel_whatsapp.pdf`;

            imgObj.pdfGeradoUrl = pdfUrl;
            imgObj.pdfGeradoBlob = pdfBlob;
            imgObj.pdfGeradoNome = pdfNome;
        }

        exibirResultadoImagemEncapsulada(htmlSnippet, urlDestino, imgObj.pdfGeradoUrl, imgObj.pdfGeradoNome);

        salvarItemHistorico({
            tipo: 'imagem',
            nomeOriginal: imgObj.nome,
            nomeFinal: imgObj.pdfGeradoNome || imgObj.nome,
            linkDestino: urlDestino,
            tamanho: imgObj.tamanho,
            dataHora: new Date().toISOString()
        });

        if (typeof showToast === 'function') {
            showToast('🎉 Imagem encapsulada para E-mail e WhatsApp!', 'success');
        }
    } catch (err) {
        console.error('Erro ao encapsular imagem:', err);
        if (typeof showToast === 'function') showToast('Erro ao encapsular imagem: ' + err.message, 'error');
    } finally {
        if (btnGerar) {
            btnGerar.disabled = false;
            btnGerar.innerHTML = textoOriginalBtn;
        }
    }
}

function exibirResultadoImagemEncapsulada(htmlSnippet, urlDestino, pdfUrl, pdfNome) {
    const area = document.getElementById('encImgResultadoArea');
    if (!area) return;

    const elCodigo = document.getElementById('encResImgCodigoHtml');
    const elPreview = document.getElementById('encResImgPreviewWrap');
    const elLink = document.getElementById('encResImgLink');
    const btnBaixarPdf = document.getElementById('encBtnBaixarImgPdfPronto');

    if (elCodigo) elCodigo.value = htmlSnippet;
    if (elPreview) elPreview.innerHTML = htmlSnippet;
    if (elLink) {
        elLink.textContent = urlDestino;
        elLink.href = urlDestino;
    }

    if (btnBaixarPdf) {
        btnBaixarPdf.onclick = () => {
            if (!pdfUrl) return;
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = pdfNome || 'imagem_com_link.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            if (typeof showToast === 'function') showToast('Download do PDF da imagem iniciado!', 'success');
        };
    }

    area.style.display = 'block';
    area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function copiarCodigoHtmlImagem() {
    const elCodigo = document.getElementById('encResImgCodigoHtml');
    if (!elCodigo) return;
    try {
        await navigator.clipboard.writeText(elCodigo.value);
        if (typeof showToast === 'function') showToast('Código HTML copiado para a área de transferência!', 'success');
    } catch (e) {
        elCodigo.select();
        document.execCommand('copy');
        if (typeof showToast === 'function') showToast('Código HTML copiado!', 'success');
    }
}

async function copiarImagemComLinkRichText() {
    const snippet = encapsuladorEstado.imagemAtual.htmlGerado;
    const urlDestino = (document.getElementById('encImgLinkDestino')?.value || '').trim();
    if (!snippet) return;

    try {
        if (navigator.clipboard && window.ClipboardItem) {
            const blobHtml = new Blob([snippet], { type: 'text/html' });
            const blobText = new Blob([urlDestino], { type: 'text/plain' });
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': blobHtml,
                    'text/plain': blobText
                })
            ]);
            if (typeof showToast === 'function') {
                showToast('✨ Imagem com Link copiada! Você pode colar (Ctrl+V) direto no Gmail ou Outlook.', 'success');
            }
        } else {
            copiarCodigoHtmlImagem();
        }
    } catch (e) {
        console.warn('Fallback de cópia clipboard:', e);
        copiarCodigoHtmlImagem();
    }
}

function usarImagemEmNovoModeloEmail() {
    const snippet = encapsuladorEstado.imagemAtual.htmlGerado;
    if (!snippet) return;

    // Alterna para subaba de E-mail Marketing e abre modal de novo modelo com o HTML já preenchido
    if (typeof alternarSubabaMarketing === 'function') {
        alternarSubabaMarketing('email');
    }
    if (typeof abrirModalModelo === 'function') {
        abrirModalModelo();
        setTimeout(() => {
            const campoHtml = document.getElementById('modeloHtml') || document.getElementById('modeloCorpo');
            const campoNome = document.getElementById('modeloNome');
            if (campoHtml) {
                campoHtml.value = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:16px;">\n` +
                    `  <p>Olá {{nome}},</p>\n` +
                    `  <p>Confira a oportunidade que preparamos para a {{empresa}}:</p>\n` +
                    `  <div style="margin:20px 0;text-align:center;">\n` +
                    `    ${snippet}\n` +
                    `  </div>\n` +
                    `  <p>Toque na imagem acima para abrir.</p>\n` +
                    `</div>`;
            }
            if (campoNome && !campoNome.value) {
                campoNome.value = `Campanha com Imagem - ${encapsuladorEstado.imagemAtual.nome || 'Banner'}`;
            }
            if (typeof showToast === 'function') showToast('Imagem aplicada no novo modelo de e-mail!', 'info');
        }, 300);
    }
}

// ================================================================
// HISTÓRICO DE ARQUIVOS ENCAPSULADOS
// ================================================================
function carregarHistoricoEncapsulador() {
    try {
        const raw = localStorage.getItem('crm_encapsulador_historico');
        if (raw) {
            encapsuladorEstado.historico = JSON.parse(raw);
        }
    } catch (e) {
        encapsuladorEstado.historico = [];
    }
    renderizarHistoricoEncapsulador();
}

function salvarItemHistorico(item) {
    if (!Array.isArray(encapsuladorEstado.historico)) {
        encapsuladorEstado.historico = [];
    }
    encapsuladorEstado.historico.unshift(item);
    if (encapsuladorEstado.historico.length > 15) {
        encapsuladorEstado.historico = encapsuladorEstado.historico.slice(0, 15);
    }
    try {
        localStorage.setItem('crm_encapsulador_historico', JSON.stringify(encapsuladorEstado.historico));
    } catch (e) {}
    renderizarHistoricoEncapsulador();
}

function renderizarHistoricoEncapsulador() {
    const container = document.getElementById('encHistoricoLista');
    if (!container) return;

    if (!encapsuladorEstado.historico || encapsuladorEstado.historico.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:16px;color:var(--text-muted);font-size:13px;">
                Nenhum arquivo encapsulado recentemente. Faça a fusão de um PDF ou imagem acima!
            </div>`;
        return;
    }

    container.innerHTML = encapsuladorEstado.historico.map((h, i) => {
        const icon = h.tipo === 'pdf' ? '📄' : '🖼️';
        const dataFormatada = new Date(h.dataHora).toLocaleString('pt-BR');
        const kb = (h.tamanho / 1024).toFixed(1);
        return `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border-color);gap:12px;font-size:13px;background:var(--bg-card);">
                <div style="display:flex;align-items:center;gap:10px;min-width:0;">
                    <span style="font-size:20px;">${icon}</span>
                    <div style="min-width:0;">
                        <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-primary);">
                            ${h.nomeFinal || h.nomeOriginal}
                        </div>
                        <div style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                            ${dataFormatada} • ${kb} KB • Link: <a href="${h.linkDestino}" target="_blank" style="color:var(--primary);">${h.linkDestino}</a>
                        </div>
                    </div>
                </div>
                <div style="display:flex;gap:6px;flex-shrink:0;">
                    <button type="button" class="btn btn-outline btn-xs" onclick="window.open('${h.linkDestino}', '_blank')" title="Testar link de destino">
                        🔗 Testar Link
                    </button>
                    <button type="button" class="btn btn-danger btn-xs" onclick="removerItemHistoricoEncapsulador(${i})" title="Remover do histórico">
                        ✕
                    </button>
                </div>
            </div>`;
    }).join('');
}

function removerItemHistoricoEncapsulador(index) {
    if (encapsuladorEstado.historico[index]) {
        encapsuladorEstado.historico.splice(index, 1);
        try {
            localStorage.setItem('crm_encapsulador_historico', JSON.stringify(encapsuladorEstado.historico));
        } catch (e) {}
        renderizarHistoricoEncapsulador();
    }
}

function limparHistoricoEncapsulador() {
    encapsuladorEstado.historico = [];
    try {
        localStorage.removeItem('crm_encapsulador_historico');
    } catch (e) {}
    renderizarHistoricoEncapsulador();
}

function atualizarUiEncapsulador() {
    renderizarCardPdfCarregado();
    renderizarCardImagemCarregada();
    renderizarHistoricoEncapsulador();
}

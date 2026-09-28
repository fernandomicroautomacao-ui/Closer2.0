// ============================================
// AUTORIZAÇÃO DE EMISSÃO DE PEDIDO (assinatura do cliente por link)
// Só disponível na etapa Orçamento. Gera um link público (autorizacao.html)
// onde o cliente só pode digitar o nome para assinar — sem editar mais nada
// e sem opção de apagar depois de assinado.
// ============================================
function atualizarUIAutorizacao(lead) {
    const wrap = document.getElementById('autorizacaoPedidoWrap');
    if (!wrap) return;

    if (lead.etapa !== 'orcamento') {
        wrap.style.display = 'none';
        return;
    }
    wrap.style.display = 'block';

    const select = document.getElementById('autorizacaoAnexoSelect');
    const anexos = (lead.orcamentoAnexos && lead.orcamentoAnexos.length > 0)
        ? lead.orcamentoAnexos
        : (lead.orcamentoPdfPrincipal ? [lead.orcamentoPdfPrincipal] : []);

    select.innerHTML = anexos.length > 0
        ? anexos.map((a, i) => `<option value="${i}">${a.nome || 'Proposta em Anexo'}</option>`).join('')
        : '<option value="">Nenhum anexo salvo</option>';

    const info = document.getElementById('autorizacaoStatusInfo');
    if (!lead.autorizacaoPedidoId) {
        info.textContent = anexos.length === 0
            ? 'Anexe e salve um arquivo do pedido para poder gerar a autorização.'
            : 'Nenhuma autorização gerada ainda.';
    } else if (lead.autorizacaoPedidoStatus === 'assinado') {
        info.innerHTML = `<strong style="color:var(--stage-pedido);">Assinado pelo cliente.</strong> ` +
            `<button type="button" class="btn btn-outline btn-xs" onclick="copiarLinkAutorizacaoAtual()">Copiar link</button> ` +
            `<button type="button" class="btn btn-primary btn-xs" onclick="abrirLinkAutorizacaoAtual()" style="margin-left:6px;">Abrir assinador (nova aba)</button>`;
    } else {
        info.innerHTML = `Pendente de assinatura. ` +
            `<button type="button" class="btn btn-outline btn-xs" onclick="verificarStatusAutorizacao()">Verificar assinatura</button> ` +
            `<button type="button" class="btn btn-outline btn-xs" onclick="copiarLinkAutorizacaoAtual()">Copiar link</button> ` +
            `<button type="button" class="btn btn-primary btn-xs" onclick="abrirLinkAutorizacaoAtual()" style="margin-left:6px;">Abrir assinador (nova aba)</button>`;
    }
}

function linkAutorizacao(id) {
    const lead = typeof itensEditLeadId !== 'undefined' && leads ? leads.find(l => l.id === itensEditLeadId) : null;
    const leadParam = lead ? `&leadId=${lead.id}` : '';
    return `${window.location.origin}/autorizacao.html?token=${id}${leadParam}`;
}

async function copiarTexto(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        return true;
    } catch (e) {
        return false;
    }
}

function copiarLinkAutorizacaoAtual() {
    const lead = leads.find(l => l.id === itensEditLeadId);
    if (!lead || !lead.autorizacaoPedidoId) return;
    copiarTexto(linkAutorizacao(lead.autorizacaoPedidoId)).then(ok => {
        showToast(ok ? 'Link copiado! Cole onde quiser enviar ao cliente.' : 'Link: ' + linkAutorizacao(lead.autorizacaoPedidoId));
    });
}

function abrirLinkAutorizacaoAtual() {
    const lead = leads.find(l => l.id === itensEditLeadId);
    if (!lead || !lead.autorizacaoPedidoId) return;
    window.open(linkAutorizacao(lead.autorizacaoPedidoId), '_blank');
}

async function gerarAutorizacaoPedido() {
    const lead = leads.find(l => l.id === itensEditLeadId);
    if (!lead) return;

    const anexos = (lead.orcamentoAnexos && lead.orcamentoAnexos.length > 0)
        ? lead.orcamentoAnexos
        : (lead.orcamentoPdfPrincipal ? [lead.orcamentoPdfPrincipal] : []);

    if (anexos.length === 0) {
        showToast('Anexe e salve um arquivo do pedido antes de gerar a autorização.', 'error');
        return;
    }

    const select = document.getElementById('autorizacaoAnexoSelect');
    const anexoIndex = select ? parseInt(select.value) || 0 : 0;

    const btn = document.getElementById('btnGerarAutorizacao');
    if (btn) { btn.disabled = true; btn.textContent = 'Gerando...'; }

    let tokenId = null;
    try {
        const { data, error } = await supabaseClient.functions.invoke('super-responder', {
            body: { action: 'gerar', leadId: lead.id, anexoIndex }
        });
        if (data && data.id && !data.error) {
            tokenId = data.id;
        }
    } catch (e) {
        console.warn('Fallback local para geração de token de autorização:', e);
    }

    if (!tokenId) {
        tokenId = lead.autorizacaoPedidoId || ('AUT-' + lead.id.slice(0, 8) + '-' + Math.abs(lead.id.split('').reduce((a,b)=>(((a<<5)-a)+b.charCodeAt(0))|0,0)).toString(36).toUpperCase());
    }

    lead.autorizacaoPedidoId = tokenId;
    lead.autorizacaoPedidoStatus = 'pendente';
    salvarDados();
    atualizarUIAutorizacao(lead);

    if (btn) { btn.disabled = false; btn.textContent = 'Gerar link de autorização'; }

    const link = linkAutorizacao(tokenId);
    const ok = await copiarTexto(link);
    showToast(ok ? 'Link copiado! Cole onde quiser enviar ao cliente.' : 'Link gerado: ' + link);
}

async function verificarStatusAutorizacao() {
    const lead = leads.find(l => l.id === itensEditLeadId);
    if (!lead || !lead.autorizacaoPedidoId) return;

    const { data, error } = await supabaseClient.functions.invoke('super-responder', {
        body: { action: 'obter', token: lead.autorizacaoPedidoId }
    });

    if (error || !data || data.error) {
        showToast('Erro ao verificar status: ' + (error ? error.message : data.error), 'error');
        return;
    }

    lead.autorizacaoPedidoStatus = data.autorizacao.status;
    salvarDados();
    atualizarUIAutorizacao(lead);
    showToast(data.autorizacao.status === 'assinado' ? 'Documento assinado pelo cliente!' : 'Ainda pendente de assinatura.');
}

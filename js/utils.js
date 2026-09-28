// ============================================
// UTILITÁRIOS
// ============================================
function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatarData(data) {
    if (!data) return '—';
    const partData = String(data).split('T')[0];
    const partes = partData.split('-');
    if (partes.length === 3) {
        const [ano, mes, dia] = partes;
        return `${dia}/${mes}/${ano}`;
    }
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatarDataHora(dataHora) {
    if (!dataHora) return '—';
    try {
        const d = new Date(dataHora);
        if (isNaN(d.getTime())) return String(dataHora);
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const ano = d.getFullYear();
        const hora = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${ano} às ${hora}:${min}`;
    } catch (e) {
        return String(dataHora);
    }
}

function formatarMoeda(valor) {
    return 'R$ ' + Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Copia texto para a área de transferência com feedback visual (Toast) e fallback
function copiarTexto(texto, mensagemSucesso = 'Copiado para a área de transferência!') {
    if (!texto || String(texto).trim() === '' || String(texto).trim() === '—' || String(texto).trim() === 'N/A') {
        showToast('Nenhum código para copiar.', 'error');
        return;
    }
    const textoLimpo = String(texto).trim();

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textoLimpo)
            .then(() => {
                showToast(mensagemSucesso, 'success');
            })
            .catch(() => {
                fallbackCopiarTexto(textoLimpo, mensagemSucesso);
            });
    } else {
        fallbackCopiarTexto(textoLimpo, mensagemSucesso);
    }
}

function fallbackCopiarTexto(texto, mensagemSucesso) {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = texto;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.width = '2em';
        textarea.style.height = '2em';
        textarea.style.padding = '0';
        textarea.style.border = 'none';
        textarea.style.outline = 'none';
        textarea.style.boxShadow = 'none';
        textarea.style.background = 'transparent';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (ok) {
            showToast(mensagemSucesso, 'success');
        } else {
            showToast('Não foi possível copiar automaticamente.', 'error');
        }
    } catch (err) {
        showToast('Erro ao copiar texto.', 'error');
    }
}

function copiarCodigoUnico(event, codigo) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    copiarTexto(codigo, `Código "${codigo}" copiado com sucesso!`);
}

function hoje() {
    return new Date().toISOString().split('T')[0];
}

function getMesAtual() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getTaskStatus(data, leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead || !lead.tarefas) return 'pendente';
    const t = lead.tarefas[data];
    if (!t) return 'pendente';
    return typeof t === 'object' ? (t.status || 'pendente') : t;
}

function getTaskInfo(data, leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead || !lead.tarefas || !lead.tarefas[data]) return null;
    const t = lead.tarefas[data];
    return typeof t === 'object' ? t : { status: t };
}

function iniciais(nome) {
    if (!nome) return '?';
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function corAvatar(nome) {
    const paleta = ['#2d4863', '#3c6e91', '#a9761f', '#8a5a3c', '#2f7d5b', '#6b4468', '#4d7396', '#5b5a80'];
    if (!nome) return paleta[0];
    let hash = 0;
    for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    return paleta[Math.abs(hash) % paleta.length];
}

// ============================================
// TOAST
// ============================================
function showToast(mensagem, tipo = 'success', acaoLabel = null, acaoCallback = null) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;

    const texto = document.createElement('span');
    texto.textContent = mensagem;
    toast.appendChild(texto);

    if (acaoLabel && acaoCallback) {
        const btnAcao = document.createElement('button');
        btnAcao.className = 'toast-action';
        btnAcao.textContent = acaoLabel;
        btnAcao.onclick = () => {
            acaoCallback();
            toast.remove();
        };
        toast.appendChild(btnAcao);
    }

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, acaoLabel ? 6000 : 3000);
}

// ============================================
// CONTADORES
// ============================================
function setBadge(elId, valor) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = valor;
    el.classList.toggle('zero', valor === 0);
}

function atualizarContadores() {
    const leadsVisiveis = getLeadsVisiveis();
    const clientes = new Set(leadsVisiveis.filter(l => l.etapa === 'pedido').map(l => l.codigoUnico));
    setBadge('clientCount', clientes.size);
    setBadge('pipelineCount', leadsVisiveis.filter(l => l.etapa !== 'pedido').length);

    const tarefasPendentes = leadsVisiveis.filter(l => l.proximaData && l.proximaAcao).length;
    const tarefasAtrasadas = calcularTarefasMeuDia().atrasadas.length;
    const calBadge = document.getElementById('calendarioCount');
    if (calBadge) {
        calBadge.textContent = tarefasAtrasadas > 0 ? tarefasAtrasadas : tarefasPendentes;
        calBadge.classList.toggle('zero', tarefasAtrasadas === 0 && tarefasPendentes === 0);
        calBadge.classList.toggle('atrasado', tarefasAtrasadas > 0);
        calBadge.title = tarefasAtrasadas > 0 ? `${tarefasAtrasadas} tarefa(s) atrasada(s)` : '';
    }

    setBadge('marketingCount', campanhas.filter(c => c.status === 'ativa').length);
    setBadge('whatsappCount', whatsappLog.filter(log => log.data === hoje()).length);
    const pendentesColetor = coletorListas.reduce((acc, p) => acc + p.linhas.filter(l => l.tratado && !l.promovido).length, 0);
    setBadge('coletorCount', pendentesColetor);
    setBadge('perdidosCount', getPerdidosVisiveis().length);
    setBadge('pessoasCount', (typeof getPessoasVisiveis === 'function') ? getPessoasVisiveis().length : (pessoas || []).length);

    const comBadge = document.getElementById('comunicacaoCount');
    if (comBadge) {
        const atrasados = calcularContatosAtrasados().length;
        comBadge.textContent = atrasados;
        comBadge.classList.toggle('zero', atrasados === 0);
        comBadge.classList.toggle('atrasado', atrasados > 0);
        comBadge.title = atrasados > 0 ? `${atrasados} cliente(s) sem contato recente` : '';
    }
}

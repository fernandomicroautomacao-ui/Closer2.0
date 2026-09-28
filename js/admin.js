// ============================================
// ADMINISTRAÇÃO
// ============================================
function renderizarAdmin() {
    if (usuarioAtual.papel !== 'admin') {
        navegarPara('dashboard');
        showToast('Apenas administradores podem acessar esta área.', 'error');
        return;
    }
    renderizarUsuariosAdmin();
    if (typeof renderizarEmpresaAdmin === 'function') renderizarEmpresaAdmin();
    renderizarCheckpointsAdmin();
    renderizarLandingPagePadraoAdmin();
    popularAnoMetas();
    renderizarMetasAdmin();
    popularMesMetasVendedor();
    renderizarMetasVendedores();
}

function renderizarUsuariosAdmin() {
    const container = document.getElementById('adminUsersContainer');
    if (!container) return;

    if (usuarios.length === 0) {
        container.innerHTML = `<div class="empty-state compact"><span class="emoji-big"><span data-icone="clientes"></span></span><p class="text-sm">Nenhum usuário cadastrado</p></div>`;
        return;
    }

    const totalAdmins = usuarios.filter(u => u.papel === 'admin').length;

    container.innerHTML = usuarios.map(u => {
        const ehVoce = u.id === usuarioAtual.id;
        const totalLeadsUsuario = leads.filter(l => l.usuarioId === u.id).length;
        const podeExcluir = !ehVoce && !(u.papel === 'admin' && totalAdmins <= 1);

        return `
            <div class="admin-user-row ${u.papel === 'vendedor' ? 'vendedor' : ''}">
                <div class="flex gap-8" style="align-items:center;">
                    <div class="avatar-circle sm" style="background:${corAvatar(u.nome)};">${iniciais(u.nome)}</div>
                    <div>
                        <div style="font-size:13px;font-weight:600;">${u.nome} ${ehVoce ? '<span class="text-xs text-muted">(você)</span>' : ''}</div>
                        <div class="text-xs text-muted">${u.email} • ${totalLeadsUsuario} lead(s)</div>
                    </div>
                </div>
                <div class="flex gap-8" style="align-items:center;">
                    <span class="role-badge ${u.papel === 'vendedor' ? 'vendedor' : ''}">${u.papel}</span>
                    <button class="btn btn-danger btn-xs" onclick="excluirUsuario('${u.id}')" ${podeExcluir ? '' : 'disabled title="Não é possível remover"'}><span data-icone="excluir"></span></button>
                </div>
            </div>
        `;
    }).join('');
}

async function salvarUsuario(event) {
    event.preventDefault();

    const nome = document.getElementById('uNome').value.trim();
    const email = document.getElementById('uEmail').value.trim().toLowerCase();
    const senha = document.getElementById('uSenha').value;
    const papel = document.getElementById('uPapel').value;

    if (!nome || !email || !senha) {
        showToast('Preencha todos os campos!', 'error');
        return;
    }
    if (senha.length < 6) {
        showToast('A senha precisa ter ao menos 6 caracteres.', 'error');
        return;
    }
    if (usuarios.some(u => u.email.toLowerCase() === email)) {
        showToast('Já existe um usuário com esse e-mail!', 'error');
        return;
    }

    const { data, error } = await supabaseClient.functions.invoke('manage-user', {
        body: { action: 'create', nome, email, senha, papel }
    });

    if (error || (data && data.error)) {
        showToast('Erro ao criar usuário: ' + (error ? error.message : data.error), 'error');
        return;
    }

    await carregarUsuarios();
    document.getElementById('adminUserForm').reset();
    renderizarUsuariosAdmin();
    showToast(`Usuário "${nome}" adicionado!`);
}

async function excluirUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;

    if (id === usuarioAtual.id) {
        showToast('Você não pode remover seu próprio usuário.', 'error');
        return;
    }

    const totalAdmins = usuarios.filter(u => u.papel === 'admin').length;
    if (usuario.papel === 'admin' && totalAdmins <= 1) {
        showToast('É necessário manter ao menos um administrador.', 'error');
        return;
    }

    const totalLeadsUsuario = leads.filter(l => l.usuarioId === id).length;
    const aviso = totalLeadsUsuario > 0
        ? `"${usuario.nome}" possui ${totalLeadsUsuario} lead(s) vinculado(s), que continuarão no sistema. Remover mesmo assim?`
        : `Remover o usuário "${usuario.nome}"?`;
    if (!confirm(aviso)) return;

    const { data, error } = await supabaseClient.functions.invoke('manage-user', {
        body: { action: 'delete', userId: id }
    });

    if (error || (data && data.error)) {
        showToast('Erro ao remover usuário: ' + (error ? error.message : data.error), 'error');
        return;
    }

    await carregarUsuarios();
    renderizarUsuariosAdmin();
    showToast(`Usuário "${usuario.nome}" removido.`);
}

// ============================================
// CONFIGURAÇÃO DOS CHECKPOINTS DE COMUNICAÇÃO (ORÇAMENTO)
// ============================================
function renderizarCheckpointsAdmin() {
    const fases = typeof obterFasesCheckpointOrcamento === 'function' 
        ? obterFasesCheckpointOrcamento() 
        : [2, 5, 9, 14];

    const input1 = document.getElementById('cfgCheckpoint1');
    const input2 = document.getElementById('cfgCheckpoint2');
    const input3 = document.getElementById('cfgCheckpoint3');
    const input4 = document.getElementById('cfgCheckpoint4');

    if (input1) input1.value = fases[0] || 2;
    if (input2) input2.value = fases[1] || 5;
    if (input3) input3.value = fases[2] || 9;
    if (input4) input4.value = fases[3] || 14;

    atualizarPreviewCheckpointsAdmin();
}

function atualizarPreviewCheckpointsAdmin() {
    const v1 = parseInt(document.getElementById('cfgCheckpoint1')?.value, 10) || 2;
    const v2 = parseInt(document.getElementById('cfgCheckpoint2')?.value, 10) || 5;
    const v3 = parseInt(document.getElementById('cfgCheckpoint3')?.value, 10) || 9;
    const v4 = parseInt(document.getElementById('cfgCheckpoint4')?.value, 10) || 14;

    const normalContainer = document.getElementById('previewCheckpointsNormal');
    const alertaContainer = document.getElementById('previewCheckpointsAlerta');

    if (normalContainer) {
        normalContainer.innerHTML = [v1, v2, v3, v4].map(val => `
            <div class="checkpoint-circulo normal" style="cursor:default;" title="${val} dias">${val}</div>
        `).join('');
    }

    if (alertaContainer) {
        alertaContainer.innerHTML = [v1, v2, v3, v4].map(val => `
            <div class="checkpoint-circulo alerta-pulsante" style="cursor:default;" title="Alerta de ${val} dias">${val}</div>
        `).join('');
    }
}

function salvarConfiguracaoCheckpointsAdmin(event) {
    if (event) event.preventDefault();

    const v1 = parseInt(document.getElementById('cfgCheckpoint1')?.value, 10);
    const v2 = parseInt(document.getElementById('cfgCheckpoint2')?.value, 10);
    const v3 = parseInt(document.getElementById('cfgCheckpoint3')?.value, 10);
    const v4 = parseInt(document.getElementById('cfgCheckpoint4')?.value, 10);

    if (isNaN(v1) || v1 <= 0 || isNaN(v2) || v2 <= 0 || isNaN(v3) || v3 <= 0 || isNaN(v4) || v4 <= 0) {
        showToast('Todos os 4 checkpoints devem ser números inteiros maiores que zero.', 'error');
        return;
    }

    if (v1 >= v2 || v2 >= v3 || v3 >= v4) {
        if (!confirm(`Atenção: Os dias informados (${v1}, ${v2}, ${v3}, ${v4}) não estão em ordem crescente. Deseja salvar mesmo assim?`)) {
            return;
        }
    }

    const novasFases = [v1, v2, v3, v4];
    if (typeof salvarFasesCheckpointOrcamento === 'function') {
        salvarFasesCheckpointOrcamento(novasFases);
    } else {
        localStorage.setItem('crm_checkpoints_orcamento_dias', JSON.stringify(novasFases));
    }

    if (typeof registrarAuditoriaLocal === 'function') {
        registrarAuditoriaLocal('Alteração de Checkpoints', 'Orçamento', '', `Checkpoints alterados para: ${novasFases.join(', ')} dias`);
    }

    atualizarPreviewCheckpointsAdmin();
    if (typeof renderizarPipeline === 'function') {
        renderizarPipeline();
    }

    showToast(`Configuração dos checkpoints de orçamento atualizada (${novasFases.join(', ')} dias)!`, 'success');
}

function restaurarCheckpointsPadraoAdmin() {
    if (!confirm('Deseja restaurar a configuração padrão dos checkpoints (2, 5, 9 e 14 dias)?')) {
        return;
    }

    const padrao = [2, 5, 9, 14];
    if (typeof salvarFasesCheckpointOrcamento === 'function') {
        salvarFasesCheckpointOrcamento(padrao);
    } else {
        localStorage.setItem('crm_checkpoints_orcamento_dias', JSON.stringify(padrao));
    }

    const input1 = document.getElementById('cfgCheckpoint1');
    const input2 = document.getElementById('cfgCheckpoint2');
    const input3 = document.getElementById('cfgCheckpoint3');
    const input4 = document.getElementById('cfgCheckpoint4');

    if (input1) input1.value = 2;
    if (input2) input2.value = 5;
    if (input3) input3.value = 9;
    if (input4) input4.value = 14;

    atualizarPreviewCheckpointsAdmin();
    if (typeof renderizarPipeline === 'function') {
        renderizarPipeline();
    }

    showToast('Checkpoints restaurados para o padrão (2, 5, 9 e 14 dias).', 'info');
}

// ============================================
// CONFIGURAÇÃO DA LANDING PAGE PADRÃO (ADMIN)
// ============================================
function renderizarLandingPagePadraoAdmin() {
    const select = document.getElementById('adminSelectLpPadrao');
    if (!select) return;

    if (typeof inicializarModelosLandingPageExemplo === 'function') {
        inicializarModelosLandingPageExemplo();
    }

    const modelos = (typeof modelosLandingPage !== 'undefined' && Array.isArray(modelosLandingPage)) ? modelosLandingPage : [];
    if (modelos.length === 0) {
        select.innerHTML = '<option value="">Nenhum modelo cadastrado</option>';
        return;
    }

    const modeloPadrao = modelos.find(m => m.padrao) || modelos[0];

    select.innerHTML = modelos.map(m => `
        <option value="${m.id}" ${m.id === (modeloPadrao ? modeloPadrao.id : '') ? 'selected' : ''}>
            ${m.tipo === 'externo' || m.urlExterna ? '🔗 [Link Externo] ' : '💻 [HTML] '}${m.nome} ${m.padrao ? '★ (Padrão Atual)' : ''}
        </option>
    `).join('');

    atualizarDescricaoLpPadraoAdmin();
}

function atualizarDescricaoLpPadraoAdmin() {
    const select = document.getElementById('adminSelectLpPadrao');
    const descEl = document.getElementById('adminDescricaoLpPadrao');
    if (!select || !descEl) return;

    const modeloId = select.value;
    const modelos = (typeof modelosLandingPage !== 'undefined' && Array.isArray(modelosLandingPage)) ? modelosLandingPage : [];
    const modelo = modelos.find(m => m.id === modeloId);

    if (modelo) {
        const isExterno = modelo.tipo === 'externo' || Boolean(modelo.urlExterna);
        const tipoBadge = isExterno
            ? `<span style="background:#0284c7;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;">🔗 Link Externo Econômico</span>`
            : `<span style="background:#64748b;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;">💻 Código HTML Integrado</span>`;
        const urlInfo = isExterno && modelo.urlExterna
            ? `<div style="margin-top:4px;color:#0284c7;font-family:monospace;font-size:11.5px;">URL: ${modelo.urlExterna}</div>`
            : '';
        const flagsInfo = isExterno && Array.isArray(modelo.variaveisFlags) && modelo.variaveisFlags.length > 0
            ? `<div style="margin-top:4px;font-size:11px;color:var(--text-secondary);">Flags ativas: <code>${modelo.variaveisFlags.join(', ')}</code></div>`
            : '';

        descEl.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                ${tipoBadge}
                <strong>${modelo.nome}</strong>
            </div>
            <div><strong>Descrição:</strong> ${modelo.descricao || 'Sem descrição.'}</div>
            ${urlInfo}
            ${flagsInfo}
            <div style="margin-top:4px;font-size:11px;color:var(--text-muted);"><em>Última atualização: ${modelo.atualizadoEm ? new Date(modelo.atualizadoEm).toLocaleDateString('pt-BR') : 'Original'}</em></div>
        `;
    } else {
        descEl.textContent = 'Selecione um modelo para ver os detalhes.';
    }
}

function salvarModeloLandingPagePadraoAdmin(event) {
    if (event) event.preventDefault();

    const select = document.getElementById('adminSelectLpPadrao');
    if (!select) return;
    const modeloId = select.value;

    const modelos = (typeof modelosLandingPage !== 'undefined' && Array.isArray(modelosLandingPage)) ? modelosLandingPage : [];
    const modelo = modelos.find(m => m.id === modeloId);
    if (!modelo) {
        showToast('Selecione um modelo válido!', 'error');
        return;
    }

    // Define este modelo como padrao e remove dos demais
    modelos.forEach(m => {
        m.padrao = (m.id === modeloId);
    });

    if (typeof salvarCacheLocalImediato === 'function') salvarCacheLocalImediato();
    if (typeof salvarDados === 'function') salvarDados();
    if (typeof sincronizarModeloLandingPageNoBanco === 'function') {
        sincronizarModeloLandingPageNoBanco(modelo);
    }

    atualizarDescricaoLpPadraoAdmin();
    if (typeof renderizarPainelLandingPagesMarketing === 'function') {
        renderizarPainelLandingPagesMarketing();
    }

    const badge = document.getElementById('adminLpAutoSaveBadge');
    if (badge) {
        badge.textContent = '✓ Padrão salvo automaticamente!';
        badge.style.color = '#10b981';
        setTimeout(() => {
            if (badge) badge.textContent = '✓ Salvo automaticamente';
        }, 2500);
    }

    showToast(`✓ Modelo "${modelo.nome}" definido como padrão e salvo automaticamente!`, 'success');
}

function trocarModeloLandingPagePadraoAdminAuto(event) {
    salvarModeloLandingPagePadraoAdmin(event);
}

function testarModeloSelecionadoAdmin() {
    const select = document.getElementById('adminSelectLpPadrao');
    if (!select || !select.value) {
        showToast('Nenhum modelo selecionado para teste.', 'warning');
        return;
    }

    if (typeof abrirPreviewLandingPage === 'function') {
        abrirPreviewLandingPage(select.value, null);
    } else {
        showToast('Abrindo simulação do modelo...', 'info');
    }
}


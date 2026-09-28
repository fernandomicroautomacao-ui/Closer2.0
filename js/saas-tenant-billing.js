// ============================================
// SAAS MULTI-TENANCY INDIVIDUAL, MODO ENXUTO (ITENS 1 & 2 + PIX) E CHECKOUT MENSALIDADE
// ============================================

const SAAS_STORAGE_TENANTS_KEY = 'feitosa_saas_tenants_v1';
const SAAS_STORAGE_ACTIVE_TENANT_KEY = 'feitosa_saas_active_tenant_v1';
const SAAS_STORAGE_CONFIG_OWNER_KEY = 'feitosa_saas_owner_config_v1';
const SAAS_STORAGE_MODO_ENXUTO_KEY = 'feitosa_saas_modo_enxuto_v1';

const SAAS_PLANOS = {
    individual: {
        id: 'individual',
        nome: 'Plano Individual (Representante)',
        subtitulo: 'Para representantes comerciais autônomos e operação individual',
        precoMensal: 97.00,
        taxaSetup: 0.00,
        limiteUsuarios: 1,
        destaque: false,
        recursos: [
            '1 Usuário com Ambiente Individual Isolado (Tenant Próprio)',
            'Módulo 1: Coletor de Leads B2B (Busca Maps, CSV e Consulta CNPJ)',
            'Módulo 2: Funil Kanban + Extrator Automático de Orçamento em PDF',
            'Régua Visual de Cobrança de Orçamentos (D+2, D+5, D+9 e D+14)',
            'Gerador de PIX Comercial Integrado (QR Code EMV + Copia e Cola)',
            'Rastreamento de Propostas ("Quem Visualizou" em tempo real)'
        ]
    },
    equipe: {
        id: 'equipe',
        nome: 'Plano Equipe Comercial',
        subtitulo: 'Ideal para distribuidoras técnicas, revendas e pequenas indústrias',
        precoMensal: 247.00,
        taxaSetup: 497.00,
        limiteUsuarios: 5,
        destaque: true,
        recursos: [
            'Até 5 Usuários (Ex: 1 Pré-vendedor no Coletor + 3 Vendedores + 1 Gestor)',
            'Módulo 1 Completo: Coletor de Leads B2B com Trava Anti-Duplicidade CNPJ',
            'Módulo 2 Completo: Extrator de PDF calibrado para o layout do seu ERP',
            'Régua de Cobrança D+2 a D+14 com Disparo Rápido no WhatsApp',
            'Gerador de PIX Integrado com Preenchimento Automático do Orçamento',
            'Auditoria de Abertura de Propostas + Aceite Digital do Cliente'
        ]
    },
    industria: {
        id: 'industria',
        nome: 'Plano Distribuidora / Indústria',
        subtitulo: 'Operação comercial completa com banco dedicado opcional',
        precoMensal: 497.00,
        taxaSetup: 997.00,
        limiteUsuarios: 15,
        destaque: false,
        recursos: [
            'Até 15 Usuários com Permissões de Gestor e Vendedores',
            'Coletor de Leads B2B com Listas Regionais Ilimitadas',
            'Extrator de PDF Multi-Layout + Radar de Recompra e Curva ABC',
            'Opção de Conexão com Banco Supabase Dedicado Exclusivo da Empresa',
            'Gerador de PIX Corporativo Múltiplas Contas / Filiais',
            'Implantação Assistida e Calibração do Leitor de PDF para seu ERP'
        ]
    }
};

// Configuração padrão do proprietário do SaaS (Recebedor das mensalidades via PIX)
function obterConfigOwnerSaaS() {
    try {
        const salvo = localStorage.getItem(SAAS_STORAGE_CONFIG_OWNER_KEY);
        if (salvo) {
            return {
                chavePix: 'fernandomicroautomacao@gmail.com',
                nomeRecebedor: 'FEITOSA CRM SAAS',
                cidadeRecebedor: 'SAO PAULO',
                whatsappSuporte: '5511999999999',
                mostrarMainPageVisitantes: false,
                ...JSON.parse(salvo)
            };
        }
    } catch (e) {}
    return {
        chavePix: 'fernandomicroautomacao@gmail.com',
        nomeRecebedor: 'FEITOSA CRM SAAS',
        cidadeRecebedor: 'SAO PAULO',
        whatsappSuporte: '5511999999999',
        mostrarMainPageVisitantes: false
    };
}

function salvarConfigOwnerSaaS(novaConfig) {
    const atual = obterConfigOwnerSaaS();
    const mesclado = { ...atual, ...novaConfig };
    localStorage.setItem(SAAS_STORAGE_CONFIG_OWNER_KEY, JSON.stringify(mesclado));
    return mesclado;
}

// ============================================
// GESTÃO DE TENANTS INDIVIDUAIS
// ============================================

function normalizarTenantSlug(texto) {
    if (!texto) return 'matriz';
    const limpo = String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40);
    return limpo || 'matriz';
}

function listarTenantsSaaS() {
    let mapa = {};
    try {
        const raw = localStorage.getItem(SAAS_STORAGE_TENANTS_KEY);
        if (raw) mapa = JSON.parse(raw) || {};
    } catch (e) {
        mapa = {};
    }

    if (!mapa['matriz']) {
        mapa['matriz'] = {
            slug: 'matriz',
            empresa: 'Feitosa Matriz (Principal)',
            cnpj: '',
            plano: 'industria',
            statusAssinatura: 'ativa',
            limiteUsuarios: 99,
            modoEnxutoPadrao: true,
            criadoEm: '2026-01-01T00:00:00.000Z',
            proximoVencimento: '2027-12-31',
            chavePixEmpresa: '',
            supabaseUrlDedicado: '',
            supabaseKeyDedicado: '',
            usuariosLocais: []
        };
    }
    return mapa;
}

function salvarTenantsSaaS(mapa) {
    try {
        localStorage.setItem(SAAS_STORAGE_TENANTS_KEY, JSON.stringify(mapa));
    } catch (e) {
        console.warn('Erro ao salvar registro de tenants:', e);
    }
}

function obterTenantIdAtivo() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const tenantUrl = urlParams.get('tenant');
        if (tenantUrl) {
            const slug = normalizarTenantSlug(tenantUrl);
            localStorage.setItem(SAAS_STORAGE_ACTIVE_TENANT_KEY, slug);
            return slug;
        }
        const salvo = localStorage.getItem(SAAS_STORAGE_ACTIVE_TENANT_KEY);
        return salvo ? normalizarTenantSlug(salvo) : 'matriz';
    } catch (e) {
        return 'matriz';
    }
}

function obterTenantAtivoObj() {
    const slug = obterTenantIdAtivo();
    const mapa = listarTenantsSaaS();
    return mapa[slug] || mapa['matriz'];
}

function definirTenantAtivo(slug, recarregar = false) {
    const slugNorm = normalizarTenantSlug(slug);
    localStorage.setItem(SAAS_STORAGE_ACTIVE_TENANT_KEY, slugNorm);
    atualizarBadgeTenantUI();
    if (recarregar) {
        window.location.reload();
    }
}

function obterChaveStoragePorTenant(chaveBase) {
    const tenantId = obterTenantIdAtivo();
    if (!tenantId || tenantId === 'matriz') {
        return chaveBase;
    }
    return `${chaveBase}__tenant_${tenantId}`;
}

function leadPertenceAoTenantAtivo(lead) {
    if (!lead) return false;
    const tenantAtivo = obterTenantIdAtivo();
    const leadTenant = lead.tenantId || (lead.tarefas && lead.tarefas._ext && lead.tarefas._ext.tenantId) || 'matriz';
    return leadTenant === tenantAtivo;
}

// ============================================
// MODO SAAS ENXUTO (ITENS 1 E 2 + GERADOR DE PIX)
// ============================================

function isModoSaaSEnxutoAtivo() {
    const salvo = localStorage.getItem(SAAS_STORAGE_MODO_ENXUTO_KEY);
    if (salvo === null) {
        // Ativo por padrão conforme solicitado ("implemente 1 e 2 conforme conversado, incluir o gerador de pix")
        localStorage.setItem(SAAS_STORAGE_MODO_ENXUTO_KEY, 'true');
        return true;
    }
    return salvo === 'true';
}

function alternarModoSaaSEnxuto(forcarValor = null) {
    const novoEstado = forcarValor !== null ? Boolean(forcarValor) : !isModoSaaSEnxutoAtivo();
    localStorage.setItem(SAAS_STORAGE_MODO_ENXUTO_KEY, novoEstado ? 'true' : 'false');
    aplicarModoSaaSEnxutoUI();

    if (typeof showToast === 'function') {
        showToast(
            novoEstado
                ? 'Modo SaaS Focado ativado: 1. Coletor de Leads, 2. Funil & Orçamentos PDF e Gerador de PIX.'
                : 'Modo Completo ativado: Todas as abas secundárias estão visíveis no menu.',
            'info'
        );
    }
}

function aplicarModoSaaSEnxutoUI() {
    const enxuto = isModoSaaSEnxutoAtivo();
    const sidebarNav = document.querySelector('.sidebar nav');
    if (!sidebarNav) return;

    // Garante que o item "Gerador de PIX" e "Assinatura & Tenant" existam na barra lateral
    garantirItensMenuSaaS(sidebarNav);

    const secoesPermitidasModoEnxuto = new Set([
        'coletor',
        'pipeline',
        'gerador-pix',
        'saas-tenant',
        'admin'
    ]);

    sidebarNav.querySelectorAll('a[data-section]').forEach(link => {
        const sec = link.getAttribute('data-section');
        if (sec === 'admin') {
            const ehAdmin = typeof usuarioAtual !== 'undefined' && usuarioAtual && usuarioAtual.papel === 'admin';
            link.style.display = ehAdmin ? 'flex' : 'none';
            return;
        }
        if (enxuto) {
            link.style.display = secoesPermitidasModoEnxuto.has(sec) ? 'flex' : 'none';
        } else {
            link.style.display = 'flex';
        }
    });

    // Ajusta rótulos para destacar claramente os Pilares 1, 2 e PIX quando no Modo SaaS
    const linkColetor = sidebarNav.querySelector('a[data-section="coletor"] .label');
    const linkPipeline = sidebarNav.querySelector('a[data-section="pipeline"] .label');
    if (linkColetor) {
        linkColetor.textContent = enxuto ? '1. Coletor de Leads' : 'Coletor de Leads';
    }
    if (linkPipeline) {
        linkPipeline.textContent = enxuto ? '2. Funil & Orçamento PDF' : 'Pipeline';
    }

    // Oculta títulos de seção desnecessários no modo enxuto
    sidebarNav.querySelectorAll('.nav-section-title').forEach(titulo => {
        if (titulo.id === 'navAdminGroup') return;
        if (titulo.id === 'navSaasCoreTitle') {
            titulo.style.display = 'block';
            titulo.textContent = enxuto ? 'Módulos SaaS B2B' : 'Operação SaaS';
            return;
        }
        titulo.style.display = enxuto ? 'none' : 'block';
    });

    // Atualiza botão no cabeçalho
    const btnModo = document.getElementById('btnToggleModoSaaS');
    if (btnModo) {
        btnModo.innerHTML = enxuto
            ? '<span>⚡ Modo SaaS (1 &amp; 2 + PIX)</span>'
            : '<span>🛠️ Modo Completo</span>';
        btnModo.style.background = enxuto ? '#0f172a' : 'transparent';
        btnModo.style.color = enxuto ? '#ffffff' : 'var(--text-primary)';
        btnModo.style.borderColor = enxuto ? '#0f172a' : 'var(--border-color)';
    }

    atualizarBadgeTenantUI();

    // Se a seção ativa atual ficou oculta no modo enxuto, direciona para o Funil & Orçamento PDF (ou Coletor)
    const secaoAtivaEl = document.querySelector('.section.active');
    if (enxuto && secaoAtivaEl) {
        const idSec = secaoAtivaEl.id.replace('section-', '');
        if (!secoesPermitidasModoEnxuto.has(idSec) && typeof navegarPara === 'function') {
            navegarPara('pipeline');
        }
    }
}

function garantirItensMenuSaaS(sidebarNav) {
    if (document.getElementById('navItemGeradorPix')) return;

    const tituloCore = document.createElement('div');
    tituloCore.className = 'nav-section-title';
    tituloCore.id = 'navSaasCoreTitle';
    tituloCore.textContent = 'Módulos SaaS B2B';

    const linkColetor = sidebarNav.querySelector('a[data-section="coletor"]');
    const linkPipeline = sidebarNav.querySelector('a[data-section="pipeline"]');

    // Cria item Gerador de PIX
    const linkPix = document.createElement('a');
    linkPix.id = 'navItemGeradorPix';
    linkPix.dataset.section = 'gerador-pix';
    linkPix.innerHTML = `
        <span class="icon" style="display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">💠</span>
        <span class="label">Gerador de PIX</span>
    `;
    linkPix.addEventListener('click', function(e) {
        e.preventDefault();
        navegarPara('gerador-pix');
    });

    // Cria item Painel do Tenant / Assinatura
    const linkTenant = document.createElement('a');
    linkTenant.id = 'navItemSaasTenant';
    linkTenant.dataset.section = 'saas-tenant';
    linkTenant.innerHTML = `
        <span class="icon" style="display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">🏢</span>
        <span class="label">Ambiente &amp; Assinatura</span>
    `;
    linkTenant.addEventListener('click', function(e) {
        e.preventDefault();
        navegarPara('saas-tenant');
    });

    // Posiciona no topo da sidebar para fluxo direto: 1. Coletor -> 2. Funil PDF -> 3. Gerador de PIX -> Ambiente
    sidebarNav.insertBefore(tituloCore, sidebarNav.firstChild);
    if (linkColetor) sidebarNav.insertBefore(linkColetor, tituloCore.nextSibling);
    if (linkPipeline) sidebarNav.insertBefore(linkPipeline, linkColetor ? linkColetor.nextSibling : tituloCore.nextSibling);
    sidebarNav.insertBefore(linkPix, linkPipeline ? linkPipeline.nextSibling : null);
    sidebarNav.insertBefore(linkTenant, linkPix.nextSibling);
}

function atualizarBadgeTenantUI() {
    const tenant = obterTenantAtivoObj();
    const planoObj = SAAS_PLANOS[tenant.plano] || SAAS_PLANOS.equipe;

    const elBadgeHeader = document.getElementById('headerTenantBadge');
    if (elBadgeHeader) {
        elBadgeHeader.textContent = `🏢 ${tenant.empresa} (${tenant.slug})`;
        elBadgeHeader.title = `${planoObj.nome} • Clique para gerenciar Tenancy Individual ou trocar de empresa`;
    }

    const elLoginTenantInput = document.getElementById('loginTenantSlug');
    if (elLoginTenantInput && !elLoginTenantInput.value) {
        elLoginTenantInput.value = tenant.slug;
    }

    // Atualiza nome da empresa no topo da sidebar se não for matriz padrão
    if (tenant && tenant.slug !== 'matriz' && tenant.empresa) {
        document.querySelectorAll('[data-company-name]').forEach(el => {
            el.textContent = tenant.empresa;
        });
    }
}

// ============================================
// GERADOR DE PAYLOAD PIX EMV (PADRÃO BANCO CENTRAL BRCODE)
// ============================================

function formatarCampoEMV(id, valor) {
    const valStr = String(valor || '');
    const tam = String(valStr.length).padStart(2, '0');
    return `${id}${tam}${valStr}`;
}

function calcularCRC16Pix(payload) {
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        crc ^= (payload.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
            } else {
                crc = (crc << 1) & 0xFFFF;
            }
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

function limparTextoEMV(str, maxLen) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .toUpperCase()
        .trim()
        .slice(0, maxLen);
}

function gerarPayloadPixEMV({ chave, nome, cidade, valor, txid, descricao }) {
    const chaveLimpa = String(chave || '').trim();
    const nomeLimpo = limparTextoEMV(nome || 'FEITOSA CRM', 25) || 'FEITOSA CRM';
    const cidadeLimpa = limparTextoEMV(cidade || 'SAO PAULO', 15) || 'SAO PAULO';
    const txidLimpo = limparTextoEMV(txid || 'SAAS01', 25).replace(/\s+/g, '') || 'SAAS01';

    let merchantAccount = formatarCampoEMV('00', 'br.gov.bcb.pix') + formatarCampoEMV('01', chaveLimpa);
    if (descricao) {
        const descLimpa = limparTextoEMV(descricao, 40);
        if (descLimpa) {
            merchantAccount += formatarCampoEMV('02', descLimpa);
        }
    }

    let payload = '';
    payload += formatarCampoEMV('00', '01'); // Payload Format Indicator
    payload += formatarCampoEMV('26', merchantAccount); // Merchant Account Info
    payload += formatarCampoEMV('52', '0000'); // Merchant Category Code
    payload += formatarCampoEMV('53', '986'); // Transaction Currency (BRL)

    const numValor = Number(valor);
    if (!isNaN(numValor) && numValor > 0) {
        payload += formatarCampoEMV('54', numValor.toFixed(2));
    }

    payload += formatarCampoEMV('58', 'BR'); // Country Code
    payload += formatarCampoEMV('59', nomeLimpo); // Merchant Name
    payload += formatarCampoEMV('60', cidadeLimpa); // Merchant City
    payload += formatarCampoEMV('62', formatarCampoEMV('05', txidLimpo)); // Additional Data Field
    payload += '6304'; // CRC16 ID + Length

    const crc = calcularCRC16Pix(payload);
    return payload + crc;
}

// ============================================
// SEÇÃO DO GERADOR DE PIX EMBUTIDO E PAINEL DO TENANT
// ============================================

function renderizarSecaoGeradorPix() {
    const iframe = document.getElementById('iframeGeradorPixInterno');
    if (iframe && !iframe.getAttribute('src')) {
        iframe.setAttribute('src', 'gerador-pix.html');
    }
    popularSeletorLeadsPixRapido();
}

function abrirGeradorPixDoLead(leadId) {
    if (typeof navegarPara === 'function') {
        navegarPara('gerador-pix');
    }
    setTimeout(() => {
        popularSeletorLeadsPixRapido();
        const select = document.getElementById('selectLeadPixRapido');
        if (select) {
            select.value = leadId;
            gerarPixRapidoDeOrcamento();
        }
    }, 80);
}

function popularSeletorLeadsPixRapido() {
    const select = document.getElementById('selectLeadPixRapido');
    if (!select) return;
    const lista = (typeof getLeadsVisiveis === 'function') ? getLeadsVisiveis() : (typeof leads !== 'undefined' ? leads : []);
    const comValor = lista.filter(l => Number(l.valor) > 0);
    select.innerHTML = `<option value="">Selecione um Orçamento / Lead para gerar PIX imediato...</option>` +
        comValor.map(l => `<option value="${l.id}">${l.empresa} — ${formatarMoeda(l.valor)} (${l.codigoUnico || 'Sem cód'})</option>`).join('');
}

function gerarPixRapidoDeOrcamento() {
    const select = document.getElementById('selectLeadPixRapido');
    const boxResultado = document.getElementById('boxPixRapidoOrcamento');
    if (!select || !select.value) {
        if (typeof showToast === 'function') showToast('Selecione um orçamento com valor para gerar o PIX.', 'warning');
        return;
    }
    const lead = (typeof leads !== 'undefined' ? leads : []).find(l => l.id === select.value);
    if (!lead) return;

    const tenant = obterTenantAtivoObj();
    const ownerCfg = obterConfigOwnerSaaS();
    const chavePixUsar = tenant.chavePixEmpresa || ownerCfg.chavePix || 'fernandomicroautomacao@gmail.com';
    const nomeRecebedor = tenant.empresa || ownerCfg.nomeRecebedor || 'FEITOSA CRM';

    const txid = ('ORC' + (lead.codigoUnico || lead.id).replace(/[^a-zA-Z0-9]/g, '')).slice(0, 20);
    const payload = gerarPayloadPixEMV({
        chave: chavePixUsar,
        nome: nomeRecebedor,
        cidade: lead.cidade || 'SAO PAULO',
        valor: Number(lead.valor) || 0,
        txid,
        descricao: `Orcamento ${lead.empresa}`
    });

    if (boxResultado) {
        boxResultado.style.display = 'flex';
        const inputCopia = document.getElementById('inputPixCopiaColaOrcamento');
        const imgQr = document.getElementById('imgQrPixOrcamento');
        const infoLead = document.getElementById('infoPixOrcamentoCliente');
        if (inputCopia) inputCopia.value = payload;
        if (infoLead) {
            infoLead.innerHTML = `<strong>${lead.empresa}</strong> · Valor: <strong style="color:#059669;font-variant-numeric:tabular-nums;">${formatarMoeda(lead.valor)}</strong> · Chave: <code>${chavePixUsar}</code>`;
        }
        if (imgQr) {
            imgQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(payload)}`;
        }
    }
}

function copiarPixOrcamentoGerado() {
    const input = document.getElementById('inputPixCopiaColaOrcamento');
    if (!input || !input.value) return;
    navigator.clipboard.writeText(input.value).then(() => {
        if (typeof showToast === 'function') showToast('Código PIX Copia e Cola do orçamento copiado!', 'success');
    });
}

function renderizarSecaoSaasTenant() {
    const container = document.getElementById('saasTenantPainelContainer');
    if (!container) return;

    const tenant = obterTenantAtivoObj();
    const todosTenants = Object.values(listarTenantsSaaS());
    const plano = SAAS_PLANOS[tenant.plano] || SAAS_PLANOS.equipe;
    const ownerCfg = obterConfigOwnerSaaS();
    const leadsDoTenant = (typeof leads !== 'undefined' ? leads : []).filter(l => leadPertenceAoTenantAtivo(l));

    container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;margin-bottom:24px;">
            <!-- Card do Tenant Individual Ativo -->
            <div style="background:var(--bg-card,#fff);border:1px solid var(--border-color,#e2e8f0);border-radius:10px;padding:22px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;">
                    <div>
                        <div style="font-size:12px;color:var(--text-muted);font-weight:600;">Tenancy Individual Ativo</div>
                        <h3 style="margin:4px 0 0;font-size:20px;font-weight:700;color:var(--text-primary);">${tenant.empresa}</h3>
                    </div>
                    <span style="font-size:12px;font-weight:600;color:#15803d;background:#dcfce7;padding:4px 10px;border-radius:6px;">● Isolamento Ativo</span>
                </div>
                <div style="font-size:13px;color:var(--text-secondary);line-height:1.8;border-top:1px solid var(--border-color,#e2e8f0);padding-top:12px;">
                    <div>Código do Ambiente (Tenant Slug): <strong style="font-family:monospace;">${tenant.slug}</strong></div>
                    <div>CNPJ Cadastrado: <strong style="font-variant-numeric:tabular-nums;">${tenant.cnpj || 'Não informado'}</strong></div>
                    <div>Plano Contratado: <strong>${plano.nome}</strong> (${formatarMoeda(plano.precoMensal)}/mês)</div>
                    <div>Registros Isolados neste Tenant: <strong style="font-variant-numeric:tabular-nums;">${leadsDoTenant.length} leads/orçamentos</strong></div>
                    <div>Próximo Vencimento: <strong style="font-variant-numeric:tabular-nums;">${formatarData(tenant.proximoVencimento || '2026-10-28')}</strong></div>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;">
                    <button type="button" class="btn btn-primary btn-sm" onclick="abrirMainPageSaaS('${tenant.plano}')">💎 Ver Tela de Compra / Upgrade</button>
                    <button type="button" class="btn btn-outline btn-sm" onclick="copiarLinkAcessoTenant('${tenant.slug}')">🔗 Copiar Link Exclusivo do Tenant</button>
                </div>
            </div>

            <!-- Configuração de Chave PIX e Isolamento do Tenant -->
            <div style="background:var(--bg-card,#fff);border:1px solid var(--border-color,#e2e8f0);border-radius:10px;padding:22px;">
                <h3 style="margin:0 0 6px;font-size:16px;font-weight:700;">Configurações do Ambiente (${tenant.slug})</h3>
                <p class="text-xs text-muted" style="margin:0 0 14px;">Configure a chave PIX da empresa e, se desejar isolamento físico em nuvem, aponte um banco Supabase exclusivo para este cliente.</p>
                <form onsubmit="salvarConfiguracaoTenantIndividual(event)">
                    <div class="form-group" style="margin-bottom:10px;">
                        <label style="font-size:12px;font-weight:600;">Nome Comercial da Empresa (Tenant)</label>
                        <input type="text" id="cfgTenantEmpresa" class="form-control" value="${tenant.empresa || ''}" required>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:12px;font-weight:600;">CNPJ da Empresa</label>
                            <input type="text" id="cfgTenantCnpj" class="form-control" value="${tenant.cnpj || ''}" placeholder="00.000.000/0001-00">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:12px;font-weight:600;">Chave PIX p/ Orçamentos</label>
                            <input type="text" id="cfgTenantPix" class="form-control" value="${tenant.chavePixEmpresa || ''}" placeholder="CNPJ, E-mail ou Celular">
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:12px;font-weight:600;">Supabase URL Dedicado (Opcional)</label>
                            <input type="url" id="cfgTenantSbUrl" class="form-control" value="${tenant.supabaseUrlDedicado || ''}" placeholder="https://xyz.supabase.co">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:12px;font-weight:600;">Supabase Anon Key (Opcional)</label>
                            <input type="password" id="cfgTenantSbKey" class="form-control" value="${tenant.supabaseKeyDedicado || ''}" placeholder="eyJhbGciOi...">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-sm">Salvar Configurações do Tenant</button>
                </form>
            </div>
        </div>

        <!-- Gerenciador Multi-Tenant (Para o Dono do SaaS alternar ou criar ambientes de clientes) -->
        <div style="background:var(--bg-card,#fff);border:1px solid var(--border-color,#e2e8f0);border-radius:10px;padding:22px;margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
                <div>
                    <h3 style="margin:0;font-size:16px;font-weight:700;">Central de Ambientes / Clientes SaaS (Multi-Tenancy)</h3>
                    <p class="text-xs text-muted" style="margin:2px 0 0;">Cada empresa possui banco local e partição de leads 100% isolados. Clique em "Ativar Ambiente" para operar em nome de outra empresa.</p>
                </div>
                <button type="button" class="btn btn-primary btn-sm" onclick="abrirMainPageSaaS('equipe')">+ Cadastrar Nova Empresa / Assinante</button>
            </div>

            <div style="overflow-x:auto;border:1px solid var(--border-color,#e2e8f0);border-radius:8px;">
                <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;">
                    <thead>
                        <tr style="background:var(--bg-primary,#f8fafc);border-bottom:1px solid var(--border-color,#e2e8f0);">
                            <th style="padding:10px 14px;">Tenant Slug</th>
                            <th style="padding:10px 14px;">Empresa Assinante</th>
                            <th style="padding:10px 14px;">CNPJ</th>
                            <th style="padding:10px 14px;">Plano</th>
                            <th style="padding:10px 14px;">Status</th>
                            <th style="padding:10px 14px;text-align:right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${todosTenants.map(t => {
                            const isAtivo = t.slug === tenant.slug;
                            const pl = SAAS_PLANOS[t.plano] || SAAS_PLANOS.equipe;
                            return `
                                <tr style="border-bottom:1px solid var(--border-color,#e2e8f0);background:${isAtivo ? 'rgba(37,99,235,0.04)' : 'transparent'};">
                                    <td style="padding:10px 14px;font-family:monospace;font-weight:700;">${t.slug} ${isAtivo ? '<span style="color:#2563eb;font-family:sans-serif;font-size:11px;">(Atual)</span>' : ''}</td>
                                    <td style="padding:10px 14px;font-weight:600;">${t.empresa}</td>
                                    <td style="padding:10px 14px;font-variant-numeric:tabular-nums;">${t.cnpj || '—'}</td>
                                    <td style="padding:10px 14px;">${pl.nome} (${formatarMoeda(pl.precoMensal)})</td>
                                    <td style="padding:10px 14px;"><span style="color:#15803d;font-weight:600;">● Ativo</span></td>
                                    <td style="padding:10px 14px;text-align:right;">
                                        ${isAtivo
                                            ? `<span class="text-xs text-muted">Em uso</span>`
                                            : `<button type="button" class="btn btn-outline btn-xs" onclick="definirTenantAtivo('${t.slug}', true)">Ativar Ambiente</button>`
                                        }
                                        <button type="button" class="btn btn-outline btn-xs" onclick="copiarLinkAcessoTenant('${t.slug}')">Link</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Configuração do Recebedor SaaS (Chave PIX da Main Page) -->
        <div style="background:var(--bg-card,#fff);border:1px solid var(--border-color,#e2e8f0);border-radius:10px;padding:22px;">
            <h3 style="margin:0 0 6px;font-size:16px;font-weight:700;">Configuração de Recebimento da Main Page (Proprietário do SaaS)</h3>
            <p class="text-xs text-muted" style="margin:0 0 14px;">Defina a sua chave PIX que receberá o pagamento das mensalidades e setups na Tela de Compra (Main Page).</p>
            <form onsubmit="salvarConfigRecebedorMainPage(event)" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;align-items:end;">
                <div class="form-group" style="margin:0;">
                    <label style="font-size:12px;font-weight:600;">Sua Chave PIX (Recebedor SaaS)</label>
                    <input type="text" id="ownerPixKeyInput" class="form-control" value="${ownerCfg.chavePix}" required>
                </div>
                <div class="form-group" style="margin:0;">
                    <label style="font-size:12px;font-weight:600;">Nome no PIX (Até 25 letras)</label>
                    <input type="text" id="ownerPixNomeInput" class="form-control" value="${ownerCfg.nomeRecebedor}" required>
                </div>
                <div class="form-group" style="margin:0;">
                    <label style="font-size:12px;font-weight:600;">WhatsApp Comercial / Suporte</label>
                    <input type="text" id="ownerWhatsappInput" class="form-control" value="${ownerCfg.whatsappSuporte}">
                </div>
                <div>
                    <button type="submit" class="btn btn-primary btn-sm" style="width:100%;height:38px;">Atualizar Chave PIX do SaaS</button>
                </div>
            </form>
        </div>
    `;
}

function salvarConfiguracaoTenantIndividual(event) {
    event.preventDefault();
    const slug = obterTenantIdAtivo();
    const mapa = listarTenantsSaaS();
    const atual = mapa[slug] || obterTenantAtivoObj();

    atual.empresa = document.getElementById('cfgTenantEmpresa')?.value.trim() || atual.empresa;
    atual.cnpj = document.getElementById('cfgTenantCnpj')?.value.trim() || '';
    atual.chavePixEmpresa = document.getElementById('cfgTenantPix')?.value.trim() || '';
    atual.supabaseUrlDedicado = document.getElementById('cfgTenantSbUrl')?.value.trim() || '';
    atual.supabaseKeyDedicado = document.getElementById('cfgTenantSbKey')?.value.trim() || '';

    mapa[slug] = atual;
    salvarTenantsSaaS(mapa);
    atualizarBadgeTenantUI();
    renderizarSecaoSaasTenant();
    if (typeof showToast === 'function') showToast('Configurações do ambiente (Tenant) salvas com sucesso!', 'success');
}

function salvarConfigRecebedorMainPage(event) {
    event.preventDefault();
    const chavePix = document.getElementById('ownerPixKeyInput')?.value.trim() || 'fernandomicroautomacao@gmail.com';
    const nomeRecebedor = document.getElementById('ownerPixNomeInput')?.value.trim() || 'FEITOSA CRM SAAS';
    const whatsappSuporte = document.getElementById('ownerWhatsappInput')?.value.trim() || '';
    salvarConfigOwnerSaaS({ chavePix, nomeRecebedor, whatsappSuporte });
    if (typeof showToast === 'function') showToast('Chave PIX da Main Page atualizada!', 'success');
}

function copiarLinkAcessoTenant(slug) {
    const url = `${window.location.origin}${window.location.pathname}?tenant=${encodeURIComponent(slug)}`;
    navigator.clipboard.writeText(url).then(() => {
        if (typeof showToast === 'function') showToast(`Link exclusivo do ambiente "${slug}" copiado!`, 'success');
    });
}

// ============================================
// MAIN PAGE COMERCIAL & TELA DE COMPRA DA MENSALIDADE (CHECKOUT PIX)
// ============================================

let planoSelecionadoCheckout = 'equipe';
let incluirSetupCheckout = false;

function abrirMainPageSaaS(planoInicial = 'equipe') {
    const overlay = document.getElementById('saasMainPageOverlay');
    if (!overlay) return;
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    selecionarPlanoMainPage(planoInicial);
}

function fecharMainPageSaaS() {
    const overlay = document.getElementById('saasMainPageOverlay');
    if (overlay) overlay.style.display = 'none';
    if (!document.querySelector('.modal-overlay.open')) {
        document.body.style.overflow = '';
    }
}

function selecionarPlanoMainPage(planoId, rolarParaCheckout = false) {
    if (!SAAS_PLANOS[planoId]) planoId = 'equipe';
    planoSelecionadoCheckout = planoId;

    document.querySelectorAll('.saas-plan-card').forEach(card => {
        const isEste = card.dataset.plan === planoId;
        card.classList.toggle('selected', isEste);
    });

    atualizarCalculoCheckoutSaaS();

    if (rolarParaCheckout) {
        const checkoutEl = document.getElementById('saasCheckoutSection');
        if (checkoutEl) checkoutEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function alternarSetupCheckout(checkbox) {
    incluirSetupCheckout = Boolean(checkbox && checkbox.checked);
    atualizarCalculoCheckoutSaaS();
}

function atualizarSlugAutomaticoCheckout() {
    const empInput = document.getElementById('chkEmpresaNome');
    const slugInput = document.getElementById('chkTenantSlug');
    if (!empInput || !slugInput) return;
    const gerado = normalizarTenantSlug(empInput.value);
    slugInput.value = gerado === 'matriz' ? 'minha-empresa' : gerado;
}

function atualizarCalculoCheckoutSaaS() {
    const plano = SAAS_PLANOS[planoSelecionadoCheckout] || SAAS_PLANOS.equipe;
    const ownerCfg = obterConfigOwnerSaaS();

    const elNomePlano = document.getElementById('chkResumoNomePlano');
    const elValorMensal = document.getElementById('chkResumoValorMensal');
    const elBoxSetup = document.getElementById('chkBoxSetupOpcional');
    const elLabelSetup = document.getElementById('chkLabelValorSetup');
    const elValorTotal = document.getElementById('chkResumoValorTotal');
    const elUsuarios = document.getElementById('chkResumoLimiteUsuarios');

    if (elNomePlano) elNomePlano.textContent = plano.nome;
    if (elValorMensal) elValorMensal.textContent = `${formatarMoeda(plano.precoMensal)} / mês`;
    if (elUsuarios) elUsuarios.textContent = `Até ${plano.limiteUsuarios} ${plano.limiteUsuarios === 1 ? 'usuário' : 'usuários'} inclusos`;

    if (elBoxSetup) {
        if (plano.taxaSetup > 0) {
            elBoxSetup.style.display = 'flex';
            if (elLabelSetup) {
                elLabelSetup.textContent = `+ ${formatarMoeda(plano.taxaSetup)} (Implantação & Calibração do Leitor PDF p/ seu ERP)`;
            }
        } else {
            elBoxSetup.style.display = 'none';
            incluirSetupCheckout = false;
        }
    }

    const totalPagar = plano.precoMensal + (incluirSetupCheckout ? plano.taxaSetup : 0);
    if (elValorTotal) elValorTotal.textContent = formatarMoeda(totalPagar);

    // Gera PIX Copia e Cola e QR Code em tempo real para o valor do checkout
    const slug = document.getElementById('chkTenantSlug')?.value || 'novo-cliente';
    const txid = ('ASSIN' + slug.replace(/[^a-zA-Z0-9]/g, '')).toUpperCase().slice(0, 20);
    const payloadPix = gerarPayloadPixEMV({
        chave: ownerCfg.chavePix,
        nome: ownerCfg.nomeRecebedor,
        cidade: ownerCfg.cidadeRecebedor,
        valor: totalPagar,
        txid,
        descricao: `Assinatura ${plano.id} Feitosa CRM`
    });

    const inputPix = document.getElementById('chkPixPayloadInput');
    const imgQr = document.getElementById('chkPixQrImage');
    const spanChave = document.getElementById('chkPixChaveExibicao');

    if (inputPix) inputPix.value = payloadPix;
    if (spanChave) spanChave.textContent = ownerCfg.chavePix;
    if (imgQr) {
        imgQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=210x210&margin=8&data=${encodeURIComponent(payloadPix)}`;
    }
}

function copiarCodigoPixCheckout() {
    const input = document.getElementById('chkPixPayloadInput');
    if (!input || !input.value) return;
    navigator.clipboard.writeText(input.value).then(() => {
        if (typeof showToast === 'function') {
            showToast('Código PIX Copia e Cola copiado! Realize o pagamento no app do seu banco.', 'success');
        }
    });
}

async function concluirAssinaturaEProvisionarTenant(event) {
    event.preventDefault();

    const empresa = document.getElementById('chkEmpresaNome')?.value.trim();
    const cnpj = document.getElementById('chkEmpresaCnpj')?.value.trim();
    const slugRaw = document.getElementById('chkTenantSlug')?.value.trim();
    const nomeAdmin = document.getElementById('chkAdminNome')?.value.trim();
    const emailAdmin = document.getElementById('chkAdminEmail')?.value.trim().toLowerCase();
    const whatsappAdmin = document.getElementById('chkAdminWhatsapp')?.value.trim();
    const senhaAdmin = document.getElementById('chkAdminSenha')?.value;

    if (!empresa || !nomeAdmin || !emailAdmin || !senhaAdmin) {
        if (typeof showToast === 'function') showToast('Preencha todos os dados obrigatórios da empresa e do administrador.', 'error');
        return;
    }

    let slug = normalizarTenantSlug(slugRaw || empresa);
    if (slug === 'matriz') slug = 'empresa-' + Date.now().toString(36).slice(-4);

    const plano = SAAS_PLANOS[planoSelecionadoCheckout] || SAAS_PLANOS.equipe;
    const mapa = listarTenantsSaaS();

    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + 30);

    const novoUsuarioAdmin = {
        id: 'usr_' + slug + '_admin',
        nome: nomeAdmin,
        email: emailAdmin,
        whatsapp: whatsappAdmin || '',
        senhaHash: btoa(unescape(encodeURIComponent(senhaAdmin))),
        papel: 'admin'
    };

    mapa[slug] = {
        slug,
        empresa,
        cnpj: cnpj || '',
        plano: plano.id,
        statusAssinatura: 'ativa',
        limiteUsuarios: plano.limiteUsuarios,
        modoEnxutoPadrao: true,
        criadoEm: new Date().toISOString(),
        proximoVencimento: vencimento.toISOString().split('T')[0],
        chavePixEmpresa: cnpj || emailAdmin,
        supabaseUrlDedicado: '',
        supabaseKeyDedicado: '',
        usuariosLocais: [novoUsuarioAdmin]
    };

    salvarTenantsSaaS(mapa);

    // Ativa o Tenant recém-criado e o Modo SaaS Enxuto (Itens 1 & 2 + PIX)
    localStorage.setItem(SAAS_STORAGE_ACTIVE_TENANT_KEY, slug);
    localStorage.setItem(SAAS_STORAGE_MODO_ENXUTO_KEY, 'true');

    // Salva sessão local do Tenant para entrada imediata
    sessionStorage.setItem('feitosa_saas_tenant_session', JSON.stringify({
        tenantSlug: slug,
        usuario: {
            id: novoUsuarioAdmin.id,
            nome: novoUsuarioAdmin.nome,
            email: novoUsuarioAdmin.email,
            papel: 'admin'
        }
    }));

    // Limpa estado em memória do tenant anterior e inicializa o novo ambiente limpo
    if (typeof leads !== 'undefined') leads = [];
    if (typeof perdidos !== 'undefined') perdidos = [];
    if (typeof coletorListas !== 'undefined') {
        coletorListas = [{ id: 'lista_1', nome: 'Prospecção Inicial', dados: [] }];
    }
    if (typeof usuarios !== 'undefined') {
        usuarios = [{ id: novoUsuarioAdmin.id, nome: novoUsuarioAdmin.nome, email: novoUsuarioAdmin.email, papel: 'admin' }];
    }
    if (typeof usuarioAtual !== 'undefined') {
        usuarioAtual = usuarios[0];
    }

    if (typeof salvarDados === 'function') {
        salvarDados();
    }

    fecharMainPageSaaS();
    if (typeof mostrarApp === 'function') {
        mostrarApp();
    }
    aplicarModoSaaSEnxutoUI();
    if (typeof navegarPara === 'function') {
        navegarPara('coletor');
    }

    if (typeof showToast === 'function') {
        showToast(`Ambiente "${empresa}" (${slug}) provisionado com sucesso! Bem-vindo ao seu SaaS.`, 'success');
    }
}

// ============================================
// AUTENTICAÇÃO MULTI-TENANT (SUPORTE A TENANTS INDIVIDUAIS + SUPABASE)
// ============================================

function tentarLoginTenantLocal(email, senha, slugInformado) {
    const slug = normalizarTenantSlug(slugInformado || obterTenantIdAtivo());
    const mapa = listarTenantsSaaS();
    const tenant = mapa[slug];
    if (!tenant || !Array.isArray(tenant.usuariosLocais)) return null;

    const senhaCod = btoa(unescape(encodeURIComponent(senha)));
    const encontrado = tenant.usuariosLocais.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.senhaHash === senhaCod
    );
    if (!encontrado) return null;

    return {
        tenant,
        perfil: {
            id: encontrado.id,
            nome: encontrado.nome,
            email: encontrado.email,
            papel: encontrado.papel || 'admin'
        }
    };
}

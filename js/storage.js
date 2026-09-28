// ============================================
// PERSISTÊNCIA & BANCO DE DADOS (SUPABASE + INDEXEDDB)
// ============================================
let leadsIdsCarregados = new Set(); // ids que vieram do banco na última carga, usado para detectar remoções

// ============================================
// ARMAZENAMENTO INDEXEDDB LOCAL ROBUSTO (Sem limites de 5MB do localStorage)
// ============================================
const CRM_IDB_NOME = 'FeitosaCrmDB';
const CRM_IDB_VERSAO = 2;
const CRM_IDB_STORE = 'leads_cache';
const CRM_IDB_STORE_APP = 'app_state_cache';

function obterNomeBancoIndexedDBAtivo() {
    const tId = (typeof obterTenantIdAtivo === 'function') ? obterTenantIdAtivo() : 'matriz';
    return (!tId || tId === 'matriz') ? CRM_IDB_NOME : `${CRM_IDB_NOME}__${tId}`;
}

function abrirIndexedDB() {
    return new Promise((resolve) => {
        if (!window.indexedDB) {
            resolve(null);
            return;
        }
        try {
            const request = window.indexedDB.open(obterNomeBancoIndexedDBAtivo(), CRM_IDB_VERSAO);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(CRM_IDB_STORE)) {
                    db.createObjectStore(CRM_IDB_STORE, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(CRM_IDB_STORE_APP)) {
                    db.createObjectStore(CRM_IDB_STORE_APP, { keyPath: 'chave' });
                }
            };
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = () => resolve(null);
        } catch (e) {
            resolve(null);
        }
    });
}

async function salvarLeadsNoIndexedDB(listaLeads) {
    if (!listaLeads || !Array.isArray(listaLeads)) return;
    const db = await abrirIndexedDB();
    if (!db) return;
    try {
        const tx = db.transaction(CRM_IDB_STORE, 'readwrite');
        const store = tx.objectStore(CRM_IDB_STORE);
        store.clear();
        listaLeads.forEach(lead => store.put(lead));
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        });
    } catch (e) {
        console.warn('Aviso ao salvar leads no IndexedDB:', e);
    }
}

async function carregarLeadsDoIndexedDB() {
    const db = await abrirIndexedDB();
    if (!db) return [];
    try {
        const tx = db.transaction(CRM_IDB_STORE, 'readonly');
        const store = tx.objectStore(CRM_IDB_STORE);
        const req = store.getAll();
        return new Promise((resolve) => {
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
        });
    } catch (e) {
        return [];
    }
}

async function salvarEstadoAppNoIndexedDB(dadosApp) {
    if (!dadosApp || typeof dadosApp !== 'object') return false;
    const db = await abrirIndexedDB();
    if (!db) return false;
    try {
        const tx = db.transaction(CRM_IDB_STORE_APP, 'readwrite');
        const store = tx.objectStore(CRM_IDB_STORE_APP);
        store.put({ chave: 'dados_principais', ...dadosApp, salvoEm: new Date().toISOString() });
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        });
    } catch (e) {
        console.warn('Aviso ao salvar estado do app no IndexedDB:', e);
        return false;
    }
}

async function carregarEstadoAppDoIndexedDB() {
    const db = await abrirIndexedDB();
    if (!db) return null;
    try {
        const tx = db.transaction(CRM_IDB_STORE_APP, 'readonly');
        const store = tx.objectStore(CRM_IDB_STORE_APP);
        const req = store.get('dados_principais');
        return new Promise((resolve) => {
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
    } catch (e) {
        return null;
    }
}

// Colunas conhecidas que não existem no schema de leads do Supabase
const COLUNAS_INEXISTENTES_PADRAO = [
    'updated_at',
    'created_at',
    'valor_produtos',
    'landing_page_modelo_id',
    'landing_page_mensagem',
    'landing_page_views',
    'landing_page_ultimo_acesso',
    'metodo_envio'
];

let colunasSalvasMem = [];
try {
    const rawCol = localStorage.getItem('crm_colunas_rejeitadas_supabase');
    if (rawCol) colunasSalvasMem = JSON.parse(rawCol);
} catch (e) {}

const colunasRejeitadasSupabase = new Set([
    ...COLUNAS_INEXISTENTES_PADRAO,
    ...(Array.isArray(colunasSalvasMem) ? colunasSalvasMem : [])
]);

function salvarColunasRejeitadasLocal() {
    try {
        localStorage.setItem('crm_colunas_rejeitadas_supabase', JSON.stringify([...colunasRejeitadasSupabase]));
    } catch (e) {}
}

function detectarEAdicionarColunaRejeitada(erroMsg) {
    if (!erroMsg || typeof erroMsg !== 'string') return null;
    const m1 = erroMsg.match(/Could not find the ['"]?([a-zA-Z0-9_\-]+)['"]? column/i);
    if (m1 && m1[1]) {
        colunasRejeitadasSupabase.add(m1[1]);
        salvarColunasRejeitadasLocal();
        return m1[1];
    }
    const m2 = erroMsg.match(/column ['"]?([a-zA-Z0-9_\-]+)['"]? of relation/i);
    if (m2 && m2[1]) {
        colunasRejeitadasSupabase.add(m2[1]);
        salvarColunasRejeitadasLocal();
        return m2[1];
    }
    const m3 = erroMsg.match(/column (?:[a-zA-Z0-9_\-]+\.)?['"]?([a-zA-Z0-9_\-]+)['"]? does not exist/i);
    if (m3 && m3[1]) {
        colunasRejeitadasSupabase.add(m3[1]);
        salvarColunasRejeitadasLocal();
        return m3[1];
    }
    return null;
}

function sanitizarLinhaParaSupabase(linha) {
    if (!linha || typeof linha !== 'object') return linha;
    const copia = { ...linha };
    colunasRejeitadasSupabase.forEach(col => {
        delete copia[col];
    });
    if (copia.orcamento_pdf_principal && copia.orcamento_pdf_principal.dataUrl && copia.orcamento_pdf_principal.dataUrl.length > 5000000) {
        const pdfClean = { ...copia.orcamento_pdf_principal };
        delete pdfClean.dataUrl;
        copia.orcamento_pdf_principal = pdfClean;
    }
    return copia;
}

function salvarCacheLocalImediato(acionarSyncRemoto = true) {
    if (!Array.isArray(leads)) return;

    const agora = new Date().toISOString();
    leads.forEach(l => {
        if (!l.atualizadoEm) l.atualizadoEm = agora;
    });

    // 1. Salva de forma assíncrona no IndexedDB (sem limite de 5MB)
    salvarLeadsNoIndexedDB(leads);

    // 2. Salva no localStorage com proteção contra QuotaExceededError
    const chaveCacheLeads = (typeof obterChaveStoragePorTenant === 'function') ? obterChaveStoragePorTenant('ploomesLeadsCache') : 'ploomesLeadsCache';
    try {
        localStorage.setItem(chaveCacheLeads, JSON.stringify(leads));
    } catch (errQuota) {
        try {
            // Em caso de cota cheia no localStorage por arquivos base64, salva versão limpa de dados pesados
            const leadsLeves = leads.map(l => {
                if (l.orcamentoPdfPrincipal && l.orcamentoPdfPrincipal.dataUrl && l.orcamentoPdfPrincipal.dataUrl.length > 50000) {
                    const clone = { ...l, orcamentoPdfPrincipal: { ...l.orcamentoPdfPrincipal } };
                    delete clone.orcamentoPdfPrincipal.dataUrl;
                    return clone;
                }
                return l;
            });
            localStorage.setItem(chaveCacheLeads, JSON.stringify(leadsLeves));
        } catch (e) {
            console.warn('Aviso: Quota do localStorage atingida. Leads preservados com integridade no IndexedDB.');
        }
    }

    // 3. Auto-save para o banco Supabase: dispara sincronização automática em segundo plano
    if (acionarSyncRemoto && typeof salvarDadosDebounced === 'function') {
        salvarDadosDebounced(400);
    }
}

async function obterMelhorCacheLocalLeads() {
    // 1. Tenta carregar do IndexedDB
    try {
        const idbLeads = await carregarLeadsDoIndexedDB();
        if (idbLeads && idbLeads.length > 0) return idbLeads;
    } catch (e) {}

    // 2. Fallback para localStorage
    try {
        const chaveCacheLeads = (typeof obterChaveStoragePorTenant === 'function') ? obterChaveStoragePorTenant('ploomesLeadsCache') : 'ploomesLeadsCache';
        const rawCache = localStorage.getItem(chaveCacheLeads);
        if (rawCache) {
            const parsed = JSON.parse(rawCache);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {}

    return [];
}

function sanitizarOrcamentoPdfParaBanco(pdf) {
    if (!pdf) return null;
    const sanitizado = {
        nome: pdf.nome || 'orcamento.pdf',
        tipo: pdf.tipo || 'application/pdf',
        tamanho: pdf.tamanho || 0,
        valorDetectado: pdf.valorDetectado || 0,
        dadosExtraidos: pdf.dadosExtraidos || {},
        textoCompleto: (pdf.textoCompleto || '').slice(0, 3000)
    };
    // Se dataUrl for moderado (< 250KB), pode ir no banco
    if (pdf.dataUrl && typeof pdf.dataUrl === 'string' && pdf.dataUrl.length < 6000000) {
        sanitizado.dataUrl = pdf.dataUrl;
    }
    return sanitizado;
}

function leadParaLinhaSupabase(l) {
    const tarefasObj = (typeof l.tarefas === 'object' && l.tarefas !== null) ? { ...l.tarefas } : {};
    const tenantIdAtual = l.tenantId || (typeof obterTenantIdAtivo === 'function' ? obterTenantIdAtivo() : 'matriz');
    tarefasObj._ext = {
        tenantId: tenantIdAtual,
        valorProdutos: l.valorProdutos || l.valor_produtos || 0,
        landingPageModeloId: l.landingPageModeloId || l.landing_page_modelo_id || null,
        landingPageMensagem: l.landingPageMensagem || l.landing_page_mensagem || null,
        landingPageViews: l.landingPageViews || l.landing_page_views || 0,
        landingPageUltimoAcesso: l.landingPageUltimoAcesso || l.landing_page_ultimo_acesso || null,
        metodoEnvio: l.metodoEnvio || l.metodo_envio || '',
        atualizadoEm: l.atualizadoEm || new Date().toISOString()
    };

    return {
        id: l.id,
        codigo_unico: l.codigoUnico || '',
        cnpj: l.cnpj || '',
        empresa: l.empresa || '',
        cidade: l.cidade || '',
        estado: l.estado || '',
        telefone: l.telefone || '',
        whatsapp: l.whatsapp || '',
        email: l.email || '',
        decisor: l.decisor || '',
        valor: l.valor || 0,
        potencial: l.potencial || 'B',
        classificacao: l.classificacao || 'outros',
        etapa: l.etapa || 'leads',
        observacoes: l.observacoes || '',
        data_criacao: l.dataCriacao || new Date().toISOString(),
        cliente: !!l.cliente,
        recorrente: !!l.recorrente,
        numero_pedido: l.numeroPedido || '',
        obs_orcamento: l.obsOrcamento || '',
        condicoes: l.condicoes || '',
        desconto: l.desconto || 0,
        frete: l.frete || 0,
        itens: l.itens || [],
        pedidos: l.pedidos || [],
        data_pedido: l.dataPedido || '',
        proxima_acao: l.proximaAcao || '',
        proxima_data: l.proximaData || '',
        tarefas: tarefasObj,
        usuario_id: l.usuarioId || (typeof usuarioAtual !== 'undefined' && usuarioAtual ? usuarioAtual.id : null),
        historico: l.historico || [],
        orcamento_anexos: l.orcamentoAnexos || [],
        orcamento_pdf_principal: sanitizarOrcamentoPdfParaBanco(l.orcamentoPdfPrincipal),
        orcamento_modo: l.orcamentoModo || 'pdf',
        orcamento_reset_em: l.orcamentoResetEm || null,
        data_entrada_etapa: l.dataEntradaEtapa || l.dataCriacao || new Date().toISOString(),
        card_obs: l.cardObs || '',
        autorizacao_pedido_id: l.autorizacaoPedidoId || null,
        autorizacao_pedido_status: l.autorizacaoPedidoStatus || null
    };
}

function linhaSupabaseParaLead(r) {
    const ext = (r.tarefas && r.tarefas._ext) ? r.tarefas._ext : {};
    const tarefasLimpas = (typeof r.tarefas === 'object' && r.tarefas !== null) ? { ...r.tarefas } : {};
    delete tarefasLimpas._ext;

    return {
        id: r.id,
        codigoUnico: r.codigo_unico || '',
        cnpj: r.cnpj || '',
        empresa: r.empresa || '',
        cidade: r.cidade || '',
        estado: r.estado || '',
        telefone: r.telefone || '',
        whatsapp: r.whatsapp || '',
        email: r.email || '',
        decisor: r.decisor || '',
        valor: r.valor || 0,
        potencial: r.potencial || 'B',
        classificacao: r.classificacao || 'outros',
        etapa: r.etapa || 'leads',
        observacoes: r.observacoes || '',
        dataCriacao: r.data_criacao || new Date().toISOString(),
        cliente: !!r.cliente,
        recorrente: !!r.recorrente,
        numeroPedido: r.numero_pedido || '',
        obsOrcamento: r.obs_orcamento || '',
        condicoes: r.condicoes || '',
        desconto: r.desconto || 0,
        frete: r.frete || 0,
        itens: r.itens || [],
        pedidos: r.pedidos || [],
        dataPedido: r.data_pedido || '',
        proximaAcao: r.proxima_acao || '',
        proximaData: r.proxima_data || '',
        tarefas: tarefasLimpas,
        usuarioId: r.usuario_id || null,
        historico: r.historico || [],
        orcamentoAnexos: r.orcamento_anexos || [],
        orcamentoPdfPrincipal: r.orcamento_pdf_principal || null,
        orcamentoModo: r.orcamento_modo || 'pdf',
        orcamentoResetEm: r.orcamento_reset_em || null,
        dataEntradaEtapa: r.data_entrada_etapa || r.data_criacao || new Date().toISOString(),
        cardObs: r.card_obs || '',
        valorProdutos: (r.valor_produtos !== undefined && r.valor_produtos !== null) ? r.valor_produtos : (ext.valorProdutos || 0),
        landingPageModeloId: r.landing_page_modelo_id || ext.landingPageModeloId || null,
        landingPageMensagem: r.landing_page_mensagem || ext.landingPageMensagem || null,
        landingPageViews: (r.landing_page_views !== undefined && r.landing_page_views !== null) ? r.landing_page_views : (ext.landingPageViews || 0),
        landingPageUltimoAcesso: r.landing_page_ultimo_acesso || ext.landingPageUltimoAcesso || null,
        autorizacaoPedidoId: r.autorizacao_pedido_id || null,
        autorizacaoPedidoStatus: r.autorizacao_pedido_status || null,
        metodoEnvio: r.metodo_envio || ext.metodoEnvio || '',
        metodo_envio: r.metodo_envio || ext.metodoEnvio || '',
        tenantId: ext.tenantId || 'matriz',
        atualizadoEm: ext.atualizadoEm || r.updated_at || r.atualizado_em || r.data_criacao || null
    };
}

let pessoasIdsCarregados = new Set();

function pessoaParaLinhaSupabase(p) {
    return {
        id: p.id,
        codigo_unico_pessoa: p.codigoUnicoPessoa || p.id,
        codigo_unico: p.codigoUnico || '',
        empresa: p.empresa || '',
        nome: p.nome || '',
        titulo: p.titulo || '',
        setor: p.setor || '',
        email: p.email || '',
        whatsapp: p.whatsapp || '',
        telefone: p.telefone || '',
        decisor: p.decisor || 'nao',
        status: p.status || 'ativo',
        observacoes: p.observacoes || '',
        usuario_id: p.usuarioId || null,
        created_at: p.dataCadastro || new Date().toISOString()
    };
}

function linhaSupabaseParaPessoa(r) {
    return {
        id: r.id,
        codigoUnicoPessoa: r.codigo_unico_pessoa || r.id,
        codigoUnico: r.codigo_unico || '',
        empresa: r.empresa || '',
        nome: r.nome || '',
        titulo: r.titulo || '',
        setor: r.setor || '',
        email: r.email || '',
        whatsapp: r.whatsapp || '',
        telefone: r.telefone || '',
        decisor: r.decisor || 'nao',
        status: r.status || 'ativo',
        observacoes: r.observacoes || '',
        usuarioId: r.usuario_id || null,
        dataCadastro: r.created_at || new Date().toISOString()
    };
}

async function carregarDados() {
    let appStateCarregado = null;
    try {
        appStateCarregado = await carregarEstadoAppDoIndexedDB();
    } catch (e) {}

    let dataLocal = null;
    if (appStateCarregado) {
        dataLocal = appStateCarregado;
    } else {
        const chaveV5 = (typeof obterChaveStoragePorTenant === 'function') ? obterChaveStoragePorTenant('ploomesLeadsV5') : 'ploomesLeadsV5';
        const saved = localStorage.getItem(chaveV5);
        if (saved) {
            try {
                dataLocal = JSON.parse(saved);
            } catch (e) {}
        }
        if (!dataLocal) {
            try {
                const modEmail = localStorage.getItem('crm_modelos_email');
                const modWa = localStorage.getItem('crm_modelos_whatsapp');
                if (modEmail || modWa) {
                    dataLocal = {
                        modelos: modEmail ? JSON.parse(modEmail) : [],
                        modelosWhatsapp: modWa ? JSON.parse(modWa) : []
                    };
                }
            } catch (e) {}
        }
    }

    if (dataLocal) {
        modelos = dataLocal.modelos || [];
        campanhas = dataLocal.campanhas || [];
        emailLog = dataLocal.emailLog || [];
        modelosWhatsapp = dataLocal.modelosWhatsapp || [];
        whatsappLog = dataLocal.whatsappLog || [];
        whatsappCampanhas = dataLocal.whatsappCampanhas || [];
        whatsappOptOut = dataLocal.whatsappOptOut || [];
        whatsappConsentimentos = dataLocal.whatsappConsentimentos || {};
        whatsappFilaAtual = dataLocal.whatsappFilaAtual || null;
        perdidos = dataLocal.perdidos || [];
        metas = dataLocal.metas || {};
        coletorListas = dataLocal.coletorListas || [];
        coletorListaAtivaId = dataLocal.coletorListaAtivaId || null;
        segmentosBusca = dataLocal.segmentosBusca || [];
        modelosLandingPage = dataLocal.modelosLandingPage || [];
    }

    // Tenta carregar backup remoto de templates gerais (E-mail e WhatsApp) do Supabase
    try {
        if (typeof supabaseClient !== 'undefined' && supabaseClient.from) {
            const { data: tData } = await supabaseClient
                .from('landing_page_modelos')
                .select('html, css')
                .eq('id', '__feitosa_crm_templates__')
                .maybeSingle();
            if (tData) {
                if (tData.html) {
                    try {
                        const parsedMod = JSON.parse(tData.html);
                        if (Array.isArray(parsedMod) && parsedMod.length > 0) {
                            const mapaMod = new Map(modelos.map(m => [m.id, m]));
                            parsedMod.forEach(pm => { if (!mapaMod.has(pm.id)) modelos.push(pm); });
                        }
                    } catch (e) {}
                }
                if (tData.css) {
                    try {
                        const parsedWa = JSON.parse(tData.css);
                        if (Array.isArray(parsedWa) && parsedWa.length > 0) {
                            const mapaWa = new Map(modelosWhatsapp.map(m => [m.id, m]));
                            parsedWa.forEach(pw => { if (!mapaWa.has(pw.id)) modelosWhatsapp.push(pw); });
                        }
                    } catch (e) {}
                }
            }
        }
    } catch (e) {}

    if (typeof inicializarModelosLandingPageExemplo === 'function') {
        inicializarModelosLandingPageExemplo();
    }

    // 1. Carrega o melhor cache local (IndexedDB + localStorage) antes de consultar o banco
    const cacheLocalLeads = await obterMelhorCacheLocalLeads();
    const mapaCache = new Map((cacheLocalLeads || []).map(cl => [cl.id, cl]));
    const backupPendente = localStorage.getItem('crm_backup_pendente_sincronizacao') === 'true';

    // 2. Consulta o Supabase
    let linhas = null;
    let erroBanco = null;
    try {
        const resp = await supabaseClient.from('leads').select('*');
        if (resp.error) {
            erroBanco = resp.error;
            console.warn('Aviso ao carregar leads do Supabase (utilizando cache local seguro):', resp.error);
        } else {
            linhas = resp.data || [];
        }
    } catch (errRede) {
        erroBanco = errRede;
        console.warn('Exceção de rede ao carregar leads do Supabase:', errRede);
    }

    // 3. RECONCILIAÇÃO INTELIGENTE: Garante permanência de alterações e backups
    let precisaPersistirNoBanco = false;

    if (erroBanco || !linhas || (linhas.length === 0 && cacheLocalLeads.length > 0)) {
        // Se o banco falhou ou retornou vazio mas temos dados no cache local:
        console.info(`Supabase ${erroBanco ? 'com aviso' : 'sem registros'}. Preservando ${cacheLocalLeads.length} leads do cache local.`);
        leads = cacheLocalLeads;
        if (!erroBanco && leads.length > 0) {
            precisaPersistirNoBanco = true;
        }
    } else {
        // O banco retornou registros (filtra pelo Tenant Individual ativo)
        const leadsDoBancoTodos = (linhas || []).map(linhaSupabaseParaLead);
        const leadsDoBanco = leadsDoBancoTodos.filter(l => typeof leadPertenceAoTenantAtivo === 'function' ? leadPertenceAoTenantAtivo(l) : true);
        const mapaBanco = new Map(leadsDoBanco.map(l => [l.id, l]));

        if (backupPendente && cacheLocalLeads.length > 0) {
            // Backup restaurado recentemente: o estado do backup local prevalece sobre o banco anterior!
            console.info('Backup restaurado pendente detectado no refresh. Forçando permanência do backup no banco...');
            leads = cacheLocalLeads;
            precisaPersistirNoBanco = true;
        } else {
            const reconciliados = [];

            // A. Avalia cada lead vindo do banco com fusão à prova de regressão
            leadsDoBanco.forEach(leadBanco => {
                const leadCache = mapaCache.get(leadBanco.id);
                if (!leadCache) {
                    reconciliados.push(leadBanco);
                    return;
                }

                // Critérios de reconciliação garantindo que edições do usuário NUNCA sejam revertidas
                const localModificado = !!leadCache._modificadoLocal;
                const timeCache = leadCache.atualizadoEm ? new Date(leadCache.atualizadoEm).getTime() : 0;
                const timeBanco = leadBanco.atualizadoEm ? new Date(leadBanco.atualizadoEm).getTime() : 0;

                const cacheTemOrcamento = !!(leadCache.orcamentoPdfPrincipal || (leadCache.itens && leadCache.itens.length > 0) || (leadCache.valor && leadCache.valor > 0) || leadCache.obsOrcamento);
                const bancoSemOrcamento = !leadBanco.orcamentoPdfPrincipal && (!leadBanco.itens || leadBanco.itens.length === 0) && (!leadBanco.valor || leadBanco.valor === 0) && !leadBanco.obsOrcamento;
                const cacheMaisHistorico = (leadCache.historico?.length || 0) > (leadBanco.historico?.length || 0);

                // O cache local prevalece se foi editado localmente, se tem data recente, se tem orçamento ou mais histórico
                const cachePrevalece = localModificado
                    || (timeCache > 0 && timeCache >= timeBanco)
                    || (timeBanco === 0 && timeCache > 0)
                    || cacheMaisHistorico
                    || (cacheTemOrcamento && bancoSemOrcamento);

                // Fusão não-destrutiva: o lead resultante sempre herda campos do cache e do banco
                let leadFinal;
                if (cachePrevalece) {
                    leadFinal = { ...leadBanco, ...leadCache };
                    precisaPersistirNoBanco = true;
                } else {
                    leadFinal = { ...leadCache, ...leadBanco };
                }

                // Blindagem absoluta de anexos, PDF original e itens contra exclusão involuntária
                if (leadCache.orcamentoPdfPrincipal) {
                    if (!leadFinal.orcamentoPdfPrincipal) {
                        leadFinal.orcamentoPdfPrincipal = leadCache.orcamentoPdfPrincipal;
                    } else if (leadCache.orcamentoPdfPrincipal.dataUrl && !leadFinal.orcamentoPdfPrincipal.dataUrl) {
                        leadFinal.orcamentoPdfPrincipal = {
                            ...leadFinal.orcamentoPdfPrincipal,
                            dataUrl: leadCache.orcamentoPdfPrincipal.dataUrl
                        };
                    }
                }
                if (Array.isArray(leadCache.orcamentoAnexos) && leadCache.orcamentoAnexos.length > 0) {
                    if (!Array.isArray(leadFinal.orcamentoAnexos) || leadFinal.orcamentoAnexos.length === 0) {
                        leadFinal.orcamentoAnexos = leadCache.orcamentoAnexos;
                    }
                }
                if (Array.isArray(leadCache.itens) && leadCache.itens.length > 0) {
                    if (!Array.isArray(leadFinal.itens) || leadFinal.itens.length === 0) {
                        leadFinal.itens = leadCache.itens;
                    }
                }
                if (leadCache.valorProdutos && !leadFinal.valorProdutos) {
                    leadFinal.valorProdutos = leadCache.valorProdutos;
                }
                if (leadCache.cardObs && !leadFinal.cardObs) {
                    leadFinal.cardObs = leadCache.cardObs;
                }
                if (leadCache.obsOrcamento && !leadFinal.obsOrcamento) {
                    leadFinal.obsOrcamento = leadCache.obsOrcamento;
                }
                if (leadCache.condicoes && !leadFinal.condicoes) {
                    leadFinal.condicoes = leadCache.condicoes;
                }
                if (leadCache.landingPageModeloId && !leadFinal.landingPageModeloId) {
                    leadFinal.landingPageModeloId = leadCache.landingPageModeloId;
                }
                if (leadCache.landingPageMensagem && !leadFinal.landingPageMensagem) {
                    leadFinal.landingPageMensagem = leadCache.landingPageMensagem;
                }

                reconciliados.push(leadFinal);
            });

            // B. Adiciona leads presentes apenas no cache local (ex: restaurados de backup ou criados offline)
            cacheLocalLeads.forEach(leadCache => {
                if (!mapaBanco.has(leadCache.id)) {
                    console.info(`Lead local ${leadCache.id} (${leadCache.empresa}) preservado e preparado para gravação no banco.`);
                    reconciliados.push(leadCache);
                    precisaPersistirNoBanco = true;
                }
            });

            leads = reconciliados;
        }
    }

    leadsIdsCarregados = new Set(leads.map(l => l.id));

    // Normalização padrão dos leads
    leads = leads.map(l => {
        const itemCache = mapaCache.get(l.id);
        if ((!l.classificacao || l.classificacao === 'outros') && itemCache && itemCache.classificacao && itemCache.classificacao !== 'outros') {
            l.classificacao = itemCache.classificacao;
        }
        if (!l.orcamentoPdfPrincipal && itemCache && itemCache.orcamentoPdfPrincipal) {
            l.orcamentoPdfPrincipal = itemCache.orcamentoPdfPrincipal;
        }
        if ((!l.itens || l.itens.length === 0) && itemCache && Array.isArray(itemCache.itens) && itemCache.itens.length > 0) {
            l.itens = itemCache.itens;
        }
        if (!l.codigoUnico) l.codigoUnico = l.empresa ? l.empresa.trim().toLowerCase().replace(/\s+/g, '-') : l.id;
        if (!l.historico) l.historico = [];
        if (!l.dataCriacao) l.dataCriacao = new Date().toISOString();
        if (!l.etapa) l.etapa = 'leads';
        if (!l.valor) l.valor = 0;
        if (!l.classificacao) l.classificacao = 'outros';
        if (!l.itens) l.itens = [];
        if (!l.numeroPedido) l.numeroPedido = '';
        if (!l.obsOrcamento) l.obsOrcamento = '';
        if (!l.condicoes) l.condicoes = '';
        if (!l.desconto) l.desconto = 0;
        if (!l.frete) l.frete = 0;
        if (!l.cliente) l.cliente = (l.etapa === 'pedido');
        if (!l.pedidos) l.pedidos = [];
        if (!l.proximaAcao) l.proximaAcao = '';
        if (!l.proximaData) l.proximaData = '';
        if (!l.tarefas) l.tarefas = {};
        if (!l.dataPedido) {
            l.dataPedido = (l.pedidos && l.pedidos.length > 0) ?
                l.pedidos[l.pedidos.length - 1].data :
                (l.etapa === 'pedido' ? (l.dataCriacao || '').split('T')[0] : '');
        }
        if (!l.usuarioId) {
            const admin = usuarios.find(u => u.papel === 'admin');
            l.usuarioId = admin ? admin.id : (usuarios[0] ? usuarios[0].id : null);
        }
        return l;
    });

    // Auto-correção para leads legados com CNPJ da Micro Automação
    if (typeof obterCnpjsEmissorParaIgnorar === 'function' && Array.isArray(leads)) {
        const cnpjsIgnorar = obterCnpjsEmissorParaIgnorar();
        leads.forEach(l => {
            const digCnpj = (l.cnpj || '').replace(/\D/g, '');
            const digCod = (l.codigoUnico || '').replace(/\D/g, '');
            const digPdf = (l.orcamentoPdfPrincipal?.dadosExtraidos?.clienteCnpj || '').replace(/\D/g, '');

            if (cnpjsIgnorar.has(digCnpj) || cnpjsIgnorar.has(digCod) || cnpjsIgnorar.has(digPdf)) {
                if (l.orcamentoPdfPrincipal && l.orcamentoPdfPrincipal.textoCompleto && typeof extrairDadosCompletosPdf === 'function') {
                    try {
                        const corrigidos = extrairDadosCompletosPdf(l.orcamentoPdfPrincipal.textoCompleto);
                        if (corrigidos && corrigidos.clienteCnpj) {
                            l.orcamentoPdfPrincipal.dadosExtraidos.clienteCnpj = corrigidos.clienteCnpj;
                            l.cnpj = corrigidos.clienteCnpj;
                            l.codigoUnico = corrigidos.clienteCnpj;
                        } else {
                            if (cnpjsIgnorar.has(digCnpj)) l.cnpj = '';
                            if (cnpjsIgnorar.has(digCod)) l.codigoUnico = '';
                            if (l.orcamentoPdfPrincipal.dadosExtraidos) l.orcamentoPdfPrincipal.dadosExtraidos.clienteCnpj = '';
                        }
                    } catch (e) {
                        console.warn('Erro ao reparar CNPJ de lead legado:', e);
                    }
                } else {
                    if (cnpjsIgnorar.has(digCnpj)) l.cnpj = '';
                    if (cnpjsIgnorar.has(digCod)) l.codigoUnico = '';
                    if (l.orcamentoPdfPrincipal?.dadosExtraidos) l.orcamentoPdfPrincipal.dadosExtraidos.clienteCnpj = '';
                }
            }
        });
    }

    perdidos = perdidos.map(p => {
        if (!p.usuarioId) {
            const admin = usuarios.find(u => u.papel === 'admin');
            p.usuarioId = admin ? admin.id : (usuarios[0] ? usuarios[0].id : null);
        }
        return p;
    });

    if (perdidos.length === 0) carregarExemplosPerdidos();
    if (modelos.length === 0) carregarModelosExemplo();
    if (modelosWhatsapp.length === 0) carregarModelosWhatsappExemplo();
    if (coletorListas.length === 0) {
        coletorListas = [{ id: gerarId(), nome: 'Minha lista', linhas: [] }];
        coletorListaAtivaId = coletorListas[0].id;
    }
    if (!coletorListas.some(p => p.id === coletorListaAtivaId)) {
        coletorListaAtivaId = coletorListas[0].id;
    }
    if (segmentosBusca.length === 0) carregarSegmentosExemplo();

    // Carregar Pessoas
    const savedPessoas = localStorage.getItem('ploomesPessoasV1');
    if (savedPessoas) {
        try {
            pessoas = JSON.parse(savedPessoas);
        } catch (e) {
            pessoas = [];
        }
    }
    try {
        const { data: linhasPessoas, error: errPessoas } = await supabaseClient.from('pessoas').select('*');
        if (!errPessoas && linhasPessoas && linhasPessoas.length > 0) {
            pessoas = linhasPessoas.map(linhaSupabaseParaPessoa);
        }
    } catch (e) {
        console.warn('Aviso ao carregar pessoas do Supabase:', e);
    }
    pessoasIdsCarregados = new Set((pessoas || []).map(p => p.id));
    if (!pessoas || pessoas.length === 0) {
        carregarExemplosPessoas();
    }

    // Se precisamos forçar a permanência no banco de dados (ex: após restaurar backup ou ações de orçamento locais)
    if (precisaPersistirNoBanco) {
        console.info('Forçando sincronização e permanência dos dados no banco de dados Supabase...');
        setTimeout(() => {
            forcarPersistenciaBanco({ mostrarProgresso: false });
        }, 1200);
    } else {
        atualizarIndicadorStatusSync('sucesso');
    }
}

let salvarDadosTimeout = null;
let salvandoDadosEmExecucao = false;
let salvarNovamenteAoTerminar = false;

function salvarDadosDebounced(delay = 350) {
    salvarCacheLocalImediato(false);
    try {
        const chaveV5 = (typeof obterChaveStoragePorTenant === 'function') ? obterChaveStoragePorTenant('ploomesLeadsV5') : 'ploomesLeadsV5';
        localStorage.setItem(chaveV5, JSON.stringify({
            modelos,
            campanhas,
            emailLog,
            modelosWhatsapp,
            whatsappLog,
            whatsappCampanhas,
            whatsappOptOut,
            whatsappConsentimentos,
            whatsappFilaAtual,
            perdidos,
            metas,
            coletorListas,
            coletorListaAtivaId,
            segmentosBusca,
            modelosLandingPage
        }));
    } catch (e) {}

    atualizarIndicadorStatusSync('sincronizando');

    if (salvarDadosTimeout) clearTimeout(salvarDadosTimeout);
    salvarDadosTimeout = setTimeout(() => {
        salvarDados();
    }, delay);
}

async function salvarDados() {
    if (salvandoDadosEmExecucao) {
        salvarNovamenteAoTerminar = true;
        return;
    }
    salvandoDadosEmExecucao = true;
    try {
        await executarSalvarDadosInterno();
    } finally {
        salvandoDadosEmExecucao = false;
        if (salvarNovamenteAoTerminar) {
            salvarNovamenteAoTerminar = false;
            salvarDados();
        }
    }
}

async function upsertLeadsNoSupabaseEmLotes(linhas, tamanhoLote = 15) {
    let totalSalvos = 0;
    let erros = [];

    const sanitizadas = linhas.map(sanitizarLinhaParaSupabase);

    for (let i = 0; i < sanitizadas.length; i += tamanhoLote) {
        let lote = sanitizadas.slice(i, i + tamanhoLote);
        let tentativas = 0;
        let res = null;

        while (tentativas < 6) {
            res = await supabaseClient.from('leads').upsert(lote, { onConflict: 'id' });
            if (!res.error) break;
            const colRejeitada = detectarEAdicionarColunaRejeitada(res.error.message);
            if (colRejeitada) {
                lote = lote.map(sanitizarLinhaParaSupabase);
                tentativas++;
            } else {
                break;
            }
        }

        if (res && res.error) {
            console.warn(`Lote ${i}..${i + lote.length} falhou no upsert em grupo. Tentando individualmente...`, res.error);
            for (const itemLinha of lote) {
                let linha = sanitizarLinhaParaSupabase(itemLinha);
                let tentativasIndiv = 0;
                let resIndiv = null;

                while (tentativasIndiv < 6) {
                    resIndiv = await supabaseClient.from('leads').upsert([linha], { onConflict: 'id' });
                    if (!resIndiv.error) break;
                    const colRejIndiv = detectarEAdicionarColunaRejeitada(resIndiv.error.message);
                    if (colRejIndiv) {
                        linha = sanitizarLinhaParaSupabase(linha);
                        tentativasIndiv++;
                    } else {
                        break;
                    }
                }

                if (resIndiv && resIndiv.error) {
                    const clone = { ...linha };
                    if (clone.orcamento_pdf_principal && clone.orcamento_pdf_principal.dataUrl) {
                        clone.orcamento_pdf_principal = { ...clone.orcamento_pdf_principal };
                        delete clone.orcamento_pdf_principal.dataUrl;
                    }
                    let retry = await supabaseClient.from('leads').upsert([clone], { onConflict: 'id' });
                    if (retry.error) {
                        erros.push({ id: linha.id, empresa: linha.empresa, erro: retry.error.message });
                    } else {
                        totalSalvos++;
                        const leadCorrespondente = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads.find(l => l.id === linha.id) : null;
                        if (leadCorrespondente) leadCorrespondente._modificadoLocal = false;
                    }
                } else {
                    totalSalvos++;
                    const leadCorrespondente = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads.find(l => l.id === linha.id) : null;
                    if (leadCorrespondente) leadCorrespondente._modificadoLocal = false;
                }
            }
        } else {
            totalSalvos += lote.length;
            lote.forEach(linhaSalva => {
                const leadCorrespondente = (typeof leads !== 'undefined' && Array.isArray(leads)) ? leads.find(l => l.id === linhaSalva.id) : null;
                if (leadCorrespondente) leadCorrespondente._modificadoLocal = false;
            });
        }
    }

    return { totalSalvos, erros };
}

async function salvarLeadNoBanco(lead) {
    if (!lead || !lead.id) return false;
    try {
        lead.atualizadoEm = new Date().toISOString();
        await salvarCacheLocalImediato(false);
        let linha = sanitizarLinhaParaSupabase(leadParaLinhaSupabase(lead));
        let tentativas = 0;
        let res = null;

        while (tentativas < 6) {
            res = await supabaseClient.from('leads').upsert([linha], { onConflict: 'id' });
            if (!res.error) break;
            const colRej = detectarEAdicionarColunaRejeitada(res.error.message);
            if (colRej) {
                linha = sanitizarLinhaParaSupabase(leadParaLinhaSupabase(lead));
                tentativas++;
            } else {
                break;
            }
        }

        if (res && res.error) {
            const clone = { ...linha };
            if (clone.orcamento_pdf_principal && clone.orcamento_pdf_principal.dataUrl) {
                clone.orcamento_pdf_principal = { ...clone.orcamento_pdf_principal };
                delete clone.orcamento_pdf_principal.dataUrl;
            }
            let retry = await supabaseClient.from('leads').upsert([clone], { onConflict: 'id' });
            if (!retry.error) {
                lead._modificadoLocal = false;
                atualizarIndicadorStatusSync('sucesso');
                return true;
            } else {
                console.warn(`Aviso ao persistir lead individual ${lead.id}:`, retry.error);
                atualizarIndicadorStatusSync('parcial');
                return false;
            }
        } else {
            lead._modificadoLocal = false;
            atualizarIndicadorStatusSync('sucesso');
            return true;
        }
    } catch (e) {
        console.warn('Exceção ao persistir lead único no Supabase:', e);
        atualizarIndicadorStatusSync('offline');
        return false;
    }
}

async function sincronizarTemplatesGeraisNoBanco() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient.from) return false;
    try {
        const payload = {
            id: '__feitosa_crm_templates__',
            nome: 'Backup de Modelos CRM (E-mail e WhatsApp)',
            descricao: 'Backup remoto automático dos modelos de comunicação do Feitosa CRM',
            padrao: false,
            html: JSON.stringify(modelos || []),
            css: JSON.stringify(modelosWhatsapp || []),
            js: '',
            hero_img: '',
            logo_img: '',
            cor_primaria: '#0057a8',
            imagens: [],
            usuario_id: (typeof usuarioAtual !== 'undefined' && usuarioAtual ? usuarioAtual.id : null)
        };
        const { error } = await supabaseClient.from('landing_page_modelos').upsert([payload], { onConflict: 'id' });
        return !error;
    } catch (e) {
        return false;
    }
}

async function forcarPersistenciaBanco(opcoes = {}) {
    const mostrarProgresso = opcoes.mostrarProgresso !== false;
    if (mostrarProgresso && typeof showToast === 'function') {
        showToast('Gravando alterações no banco de dados...', 'info');
    }
    atualizarIndicadorStatusSync('sincronizando');

    salvarCacheLocalImediato(false);

    if (!leads || leads.length === 0) {
        atualizarIndicadorStatusSync('sucesso');
        if (mostrarProgresso && typeof showToast === 'function') {
            showToast('Nenhum lead para persistir no momento.', 'warning');
        }
        return { sucesso: true, totalSalvos: 0, erros: [] };
    }

    const agora = new Date().toISOString();
    leads.forEach(l => {
        if (!l.atualizadoEm) l.atualizadoEm = agora;
    });

    const linhas = leads.map(leadParaLinhaSupabase);
    const { totalSalvos, erros } = await upsertLeadsNoSupabaseEmLotes(linhas, 15);

    leadsIdsCarregados = new Set(leads.map(l => l.id));
    localStorage.setItem('crm_ultima_persistencia_banco', agora);
    localStorage.removeItem('crm_backup_pendente_sincronizacao');

    if (erros.length > 0) {
        console.warn('Persistência no banco concluída com avisos em alguns itens:', erros);
        atualizarIndicadorStatusSync('parcial');
        if (mostrarProgresso && typeof showToast === 'function') {
            showToast(`✓ ${totalSalvos} leads gravados no banco de dados (sincronizando os demais em segundo plano).`, 'warning');
        }
    } else {
        atualizarIndicadorStatusSync('sucesso');
        if (mostrarProgresso && typeof showToast === 'function') {
            showToast(`✓ Todos os ${totalSalvos} leads e orçamentos estão gravados e atualizados no banco de dados!`, 'success');
        }
    }

    return { sucesso: erros.length === 0, totalSalvos, erros };
}

let timerAutoSyncNovamente = null;
function agendarAutoSyncNovamente(delayMs = 4000) {
    if (timerAutoSyncNovamente) clearTimeout(timerAutoSyncNovamente);
    timerAutoSyncNovamente = setTimeout(() => {
        if (typeof salvarDados === 'function' && !salvandoDadosEmExecucao) {
            salvarDados();
        }
    }, delayMs);
}

function atualizarIndicadorStatusSync(status) {
    const btn = document.getElementById('btnSyncBanco');
    const icone = document.getElementById('iconeStatusSync');
    const texto = document.getElementById('textoStatusSync');
    if (!btn || !icone || !texto) return;

    if (status === 'sincronizando') {
        icone.textContent = '🔄';
        texto.textContent = 'Salvando no banco...';
        btn.style.borderColor = 'var(--primary, #0057a8)';
        btn.style.color = 'var(--primary, #0057a8)';
        btn.title = 'Salvando automaticamente alterações no banco de dados...';
    } else if (status === 'sucesso') {
        icone.textContent = '☁️';
        texto.textContent = 'Banco Atualizado';
        btn.style.borderColor = 'var(--success, #10b981)';
        btn.style.color = 'var(--success, #10b981)';
        btn.title = 'Todas as alterações estão salvas automaticamente no banco de dados.';
    } else if (status === 'parcial' || status === 'offline') {
        icone.textContent = '🔄';
        texto.textContent = 'Sincronizando auto...';
        btn.style.borderColor = 'var(--warning, #f59e0b)';
        btn.style.color = 'var(--warning, #f59e0b)';
        btn.title = 'Sincronizando automaticamente alterações pendentes com o banco...';
        agendarAutoSyncNovamente(4000);
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.info('Conexão restabelecida. Sincronizando com o banco automaticamente...');
        salvarDados();
    });
    // Verificação periódica suave de auto-persistência a cada 60s
    setInterval(() => {
        if (typeof leads !== 'undefined' && Array.isArray(leads) && leads.some(l => l._modificadoLocal)) {
            if (!salvandoDadosEmExecucao) salvarDados();
        }
    }, 60000);
}

async function executarSalvarDadosInterno() {
    await salvarCacheLocalImediato(false);

    const pacoteAppState = {
        modelos,
        campanhas,
        emailLog,
        modelosWhatsapp,
        whatsappLog,
        whatsappCampanhas,
        whatsappOptOut,
        whatsappConsentimentos,
        whatsappFilaAtual,
        perdidos,
        metas,
        coletorListas,
        coletorListaAtivaId,
        segmentosBusca,
        modelosLandingPage
    };

    // 1. Salva estado completo no IndexedDB (sem limitação de quota de 5MB do localStorage)
    try {
        await salvarEstadoAppNoIndexedDB(pacoteAppState);
    } catch (eIdb) {
        console.warn('Aviso ao salvar estado do app no IndexedDB:', eIdb);
    }

    // 2. Salva no localStorage com proteção contra QuotaExceededError
    try {
        localStorage.setItem('ploomesLeadsV5', JSON.stringify(pacoteAppState));
    } catch (eQuota) {
        console.warn('Quota do localStorage excedida para ploomesLeadsV5. Salvando em chaves particionadas...');
        try {
            localStorage.setItem('crm_modelos_email', JSON.stringify(modelos || []));
            localStorage.setItem('crm_modelos_whatsapp', JSON.stringify(modelosWhatsapp || []));
            localStorage.setItem('crm_perdidos', JSON.stringify(perdidos || []));
            localStorage.setItem('crm_metas', JSON.stringify(metas || {}));
        } catch (ePart) {}
    }

    try {
        localStorage.setItem('ploomesPessoasV1', JSON.stringify(pessoas || []));
    } catch (e) {}

    // 3. Backup de modelos no Supabase
    sincronizarTemplatesGeraisNoBanco().catch(() => {});

    atualizarContadores();
    atualizarIndicadorStatusSync('sincronizando');

    const idsAtuais = new Set((leads || []).map(l => l.id));
    let idsParaExcluir = [];
    if (leadsIdsCarregados && leadsIdsCarregados.size > 0 && leads.length > 0) {
        idsParaExcluir = [...leadsIdsCarregados].filter(id => !idsAtuais.has(id));
    }
    leadsIdsCarregados = idsAtuais;

    try {
        if (leads && leads.length > 0) {
            const linhas = leads.map(leadParaLinhaSupabase);
            const { totalSalvos, erros } = await upsertLeadsNoSupabaseEmLotes(linhas, 15);
            if (erros.length > 0) {
                console.warn(`Sincronização parcial: ${totalSalvos} salvos, ${erros.length} avisos.`, erros);
                atualizarIndicadorStatusSync('parcial');
            } else {
                atualizarIndicadorStatusSync('sucesso');
                localStorage.setItem('crm_ultima_persistencia_banco', new Date().toISOString());
                localStorage.removeItem('crm_backup_pendente_sincronizacao');
            }
        }
        if (idsParaExcluir.length > 0) {
            const { error: errDel } = await supabaseClient.from('leads').delete().in('id', idsParaExcluir);
            if (errDel) console.warn('Aviso ao excluir leads no Supabase:', errDel);
        }
    } catch (errSupabase) {
        console.warn('Aviso de rede ao sincronizar leads com Supabase (mantido no cache local):', errSupabase);
        atualizarIndicadorStatusSync('offline');
    }

    // Sincronizar Pessoas com Supabase (com detecção graciosa de erros se tabela ainda não criada)
    try {
        if (pessoas && pessoas.length > 0) {
            const linhasPessoas = pessoas.map(pessoaParaLinhaSupabase);
            const { error: errPessoas } = await supabaseClient.from('pessoas').upsert(linhasPessoas, { onConflict: 'id' });
            if (errPessoas) {
                console.warn('Supabase pessoas upsert:', errPessoas.message);
            }
        }
        const idsAtuaisPessoas = new Set((pessoas || []).map(p => p.id));
        const idsPessoasParaExcluir = [...pessoasIdsCarregados].filter(id => !idsAtuaisPessoas.has(id));
        pessoasIdsCarregados = idsAtuaisPessoas;
        if (idsPessoasParaExcluir.length > 0) {
            await supabaseClient.from('pessoas').delete().in('id', idsPessoasParaExcluir);
        }
    } catch (e) {
        console.warn('Erro ao sincronizar pessoas com Supabase:', e);
    }
}

function carregarExemplos() {
    const adminId = usuarios.find(u => u.papel === 'admin')?.id || (usuarios[0]?.id || 'admin');
    const exemplos = [{
        id: '1',
        codigoUnico: '99.999.999/0001-11',
        empresa: 'Tech Solutions Ltda',
        cidade: 'São Paulo',
        estado: 'SP',
        telefone: '(11) 99999-1111',
        whatsapp: '(11) 98888-1111',
        email: 'contato@techsolutions.com',
        decisor: 'Carlos Silva',
        valor: 150000,
        potencial: 'A',
        etapa: 'oportunidades',
        observacoes: 'Cliente estratégico',
        dataCriacao: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        cliente: false,
        recorrente: false,
        numeroPedido: '',
        obsOrcamento: '',
        condicoes: '',
        desconto: 0,
        frete: 0,
        itens: [{ descricao: 'Serviço de Consultoria', quantidade: 10, preco: 0, observacao: '' }],
        pedidos: [],
        proximaAcao: 'Enviar proposta',
        proximaData: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tarefas: {},
        usuarioId: adminId,
        historico: [{
            data: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            hora: '10:00',
            tipo: 'Ligação',
            descricao: 'Primeiro contato'
        }]
    }, {
        id: '2',
        codigoUnico: '88.888.888/0002-22',
        empresa: 'Distribuidora Norte',
        cidade: 'Recife',
        estado: 'PE',
        telefone: '(81) 99999-2222',
        whatsapp: '(81) 98888-2222',
        email: 'contato@distribuidoranorte.com',
        decisor: 'Mariana Santos',
        valor: 45000,
        potencial: 'B',
        etapa: 'qualificacao',
        observacoes: 'Em processo de qualificação',
        dataCriacao: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        cliente: false,
        recorrente: false,
        numeroPedido: '',
        obsOrcamento: '',
        condicoes: '',
        desconto: 0,
        frete: 0,
        itens: [],
        pedidos: [],
        proximaAcao: 'Agendar reunião',
        proximaData: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tarefas: {},
        usuarioId: adminId,
        historico: [{
            data: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            hora: '11:00',
            tipo: 'Ligação',
            descricao: 'Apresentação inicial'
        }]
    }, {
        id: '3',
        codigoUnico: '77.777.777/0003-33',
        empresa: 'Construtora Alpha',
        cidade: 'Belo Horizonte',
        estado: 'MG',
        telefone: '(31) 99999-3333',
        whatsapp: '(31) 98888-3333',
        email: 'contato@construtoraalpha.com',
        decisor: 'Roberto Almeida',
        valor: 320000,
        potencial: 'A',
        etapa: 'orcamento',
        observacoes: 'Orçamento em análise',
        dataCriacao: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        cliente: false,
        recorrente: false,
        numeroPedido: 'ORC-2024-001',
        obsOrcamento: 'Desconto de 10% para pagamento à vista',
        condicoes: '30 dias para pagamento',
        desconto: 10,
        frete: 1500,
        itens: [
            { descricao: 'Estrutura Metálica', quantidade: 500, preco: 450, observacao: 'Aço galvanizado' },
            { descricao: 'Telhas', quantidade: 1000, preco: 95, observacao: 'Telhas termoacústicas' }
        ],
        pedidos: [],
        proximaAcao: 'Ligar para feedback',
        proximaData: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tarefas: {},
        usuarioId: adminId,
        historico: [{
            data: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            hora: '09:00',
            tipo: 'Ligação',
            descricao: 'Primeiro contato'
        }, {
            data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            hora: '16:30',
            tipo: 'Orçamento',
            descricao: 'Enviei orçamento detalhado'
        }]
    }, {
        id: '4',
        codigoUnico: '66.666.666/0004-44',
        empresa: 'Startup Inovação',
        cidade: 'Florianópolis',
        estado: 'SC',
        telefone: '(48) 99999-4444',
        whatsapp: '(48) 98888-4444',
        email: 'contato@startupinovacao.com',
        decisor: 'Ana Paula',
        valor: 28000,
        potencial: 'B',
        etapa: 'leads',
        observacoes: 'Lead frio',
        dataCriacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        cliente: false,
        recorrente: false,
        numeroPedido: '',
        obsOrcamento: '',
        condicoes: '',
        desconto: 0,
        frete: 0,
        itens: [],
        pedidos: [],
        proximaAcao: '',
        proximaData: '',
        tarefas: {},
        usuarioId: adminId,
        historico: []
    }, {
        id: '5',
        codigoUnico: '55.555.555/0005-55',
        empresa: 'Indústria Sul',
        cidade: 'Porto Alegre',
        estado: 'RS',
        telefone: '(51) 99999-5555',
        whatsapp: '(51) 98888-5555',
        email: 'contato@industriasul.com',
        decisor: 'Fernando Lima',
        valor: 210000,
        potencial: 'A',
        etapa: 'pedido',
        observacoes: 'Pedido confirmado',
        dataCriacao: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        cliente: true,
        recorrente: true,
        numeroPedido: 'PED-2024-002',
        obsOrcamento: 'Entrega em 30 dias',
        condicoes: '50% entrada, 50% na entrega',
        desconto: 5,
        frete: 2000,
        itens: [{ descricao: 'Máquinas Industriais', quantidade: 3, preco: 70000, observacao: 'Modelo X-2000' }],
        pedidos: [
            { numero: 'PED-2024-001', data: '2024-01-15', valor: 180000, itens: 2 },
            { numero: 'PED-2024-002', data: '2024-02-20', valor: 210000, itens: 3 }
        ],
        proximaAcao: 'Agendar visita de pós-venda',
        proximaData: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tarefas: {},
        usuarioId: adminId,
        historico: [{
            data: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            hora: '10:00',
            tipo: 'Ligação',
            descricao: 'Apresentação'
        }, {
            data: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            hora: '11:30',
            tipo: 'Orçamento',
            descricao: 'Enviei orçamento'
        }, {
            data: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            hora: '16:00',
            tipo: 'Pedido',
            descricao: 'Pedido confirmado!'
        }]
    }];
    leads = exemplos;
    carregarExemplosPerdidos();
    carregarExemplosPessoas();
    salvarDados();
}

function carregarExemplosPessoas() {
    const adminId = (typeof usuarios !== 'undefined' && usuarios.find(u => u.papel === 'admin')?.id) || (usuarios?.[0]?.id || 'admin');
    const agora = Date.now();
    const diaMs = 24 * 60 * 60 * 1000;

    pessoas = [
        {
            id: 'pes-1001',
            codigoUnicoPessoa: 'PES-0001',
            codigoUnico: '99.999.999/0001-11',
            empresa: 'Tech Solutions Ltda',
            nome: 'Carlos Eduardo Silveira',
            titulo: 'Diretor de Tecnologia & Inovação',
            setor: 'Diretoria / C-Level',
            email: 'carlos.silva@techsolutions.com',
            whatsapp: '11988881111',
            telefone: '(11) 99999-1111',
            decisor: 'sim',
            status: 'ativo',
            observacoes: 'Tomador de decisão final de Capex e novos contratos de software e infraestrutura. Exige relatórios de ROI e cronograma de implantação detalhado.',
            usuarioId: adminId,
            dataCadastro: new Date(agora - 28 * diaMs).toISOString()
        },
        {
            id: 'pes-1002',
            codigoUnicoPessoa: 'PES-0002',
            codigoUnico: '99.999.999/0001-11',
            empresa: 'Tech Solutions Ltda',
            nome: 'Mariana Duarte Prado',
            titulo: 'Compradora Corporativa Sênior',
            setor: 'Compras / Suprimentos',
            email: 'mariana.compras@techsolutions.com',
            whatsapp: '11976543210',
            telefone: '(11) 3456-7890 (Ramal 204)',
            decisor: 'influenciador',
            status: 'ativo',
            observacoes: 'Negocia prazos de pagamento, notas fiscais e homologação cadastral. Pede proposta formal em PDF timbrado.',
            usuarioId: adminId,
            dataCadastro: new Date(agora - 25 * diaMs).toISOString()
        },
        {
            id: 'pes-1003',
            codigoUnicoPessoa: 'PES-0003',
            codigoUnico: '88.888.888/0002-22',
            empresa: 'Distribuidora Norte',
            nome: 'Mariana Santos',
            titulo: 'Gerente Geral de Operações',
            setor: 'Operações / Logística',
            email: 'contato@distribuidoranorte.com',
            whatsapp: '81988882222',
            telefone: '(81) 99999-2222',
            decisor: 'sim',
            status: 'ativo',
            observacoes: 'Lidera toda a operação de distribuição do Nordeste. Muito objetiva, prefere reuniões curtas via videoconferência.',
            usuarioId: adminId,
            dataCadastro: new Date(agora - 15 * diaMs).toISOString()
        },
        {
            id: 'pes-1004',
            codigoUnicoPessoa: 'PES-0004',
            codigoUnico: '88.888.888/0002-22',
            empresa: 'Distribuidora Norte',
            nome: 'Ricardo Bezerra',
            titulo: 'Coordenador de Almoxarifado e Frotas',
            setor: 'Almoxarifado / Logística',
            email: 'ricardo.bezerra@distribuidoranorte.com',
            whatsapp: '81987112233',
            telefone: '(81) 3224-5566 (Ramal 12)',
            decisor: 'tecnico',
            status: 'ativo',
            observacoes: 'Acompanha a implantação na prática e valida os equipamentos e embalagens recebidas.',
            usuarioId: adminId,
            dataCadastro: new Date(agora - 12 * diaMs).toISOString()
        },
        {
            id: 'pes-1005',
            codigoUnicoPessoa: 'PES-0005',
            codigoUnico: '77.777.777/0003-33',
            empresa: 'Construtora Alpha',
            nome: 'Roberto Almeida',
            titulo: 'Diretor de Suprimentos & Engenharia Civil',
            setor: 'Diretoria / Compras',
            email: 'contato@construtoraalpha.com',
            whatsapp: '31988883333',
            telefone: '(31) 99999-3333',
            decisor: 'sim',
            status: 'ativo',
            observacoes: 'Autoriza pedidos de grande porte. Exige conformidade técnica com normas ABNT e garantia estendida.',
            usuarioId: adminId,
            dataCadastro: new Date(agora - 40 * diaMs).toISOString()
        },
        {
            id: 'pes-1006',
            codigoUnicoPessoa: 'PES-0006',
            codigoUnico: '77.777.777/0003-33',
            empresa: 'Construtora Alpha',
            nome: 'Eng. Fernando Guimarães',
            titulo: 'Engenheiro Residente Chefe de Obras',
            setor: 'Engenharia de Projetos',
            email: 'eng.fernando@construtoraalpha.com',
            whatsapp: '31991234567',
            telefone: '(31) 3456-9900',
            decisor: 'influenciador',
            status: 'ativo',
            observacoes: 'Especificador técnico dos materiais e dimensionamento de estruturas.',
            usuarioId: adminId,
            dataCadastro: new Date(agora - 35 * diaMs).toISOString()
        },
        {
            id: 'pes-1007',
            codigoUnicoPessoa: 'PES-0007',
            codigoUnico: '66.666.666/0004-44',
            empresa: 'Indústria Beta',
            nome: 'Patrícia Lima',
            titulo: 'Gerente de Manutenção Industrial',
            setor: 'Manutenção Industrial',
            email: 'contato@industriabeta.com',
            whatsapp: '41988884444',
            telefone: '(41) 99999-4444',
            decisor: 'sim',
            status: 'ativo',
            observacoes: 'Foco em manutenção preditiva e disponibilidade das linhas de produção 24/7.',
            usuarioId: adminId,
            dataCadastro: new Date(agora - 20 * diaMs).toISOString()
        },
        {
            id: 'pes-1008',
            codigoUnicoPessoa: 'PES-0008',
            codigoUnico: '55.555.555/0005-55',
            empresa: 'Comércio Gama',
            nome: 'Lucas Mendes',
            titulo: 'Proprietário & Diretor Comercial',
            setor: 'Diretoria / C-Level',
            email: 'contato@comerciogama.com',
            whatsapp: '51988885555',
            telefone: '(51) 99999-5555',
            decisor: 'sim',
            status: 'ativo',
            observacoes: 'Decisão rápida para entregas pontuais com pagamento facilitado.',
            usuarioId: adminId,
            dataCadastro: new Date(agora - 10 * diaMs).toISOString()
        }
    ];

    try {
        localStorage.setItem('ploomesPessoasV1', JSON.stringify(pessoas));
    } catch (e) {}
}

window.carregarExemplosPessoas = carregarExemplosPessoas;

function carregarExemplosPerdidos() {
    const adminId = (typeof usuarios !== 'undefined' && usuarios.find(u => u.papel === 'admin')?.id) || (usuarios?.[0]?.id || 'admin');
    const vendedorId = (typeof usuarios !== 'undefined' && usuarios.find(u => u.papel === 'vendedor')?.id) || adminId;
    const agora = Date.now();
    const diaMs = 24 * 60 * 60 * 1000;

    perdidos = [
        {
            id: 'perd-ex-1',
            empresa: 'Logística TransBrasil S.A.',
            decisor: 'Marcos Vinícius (Diretor de Operações)',
            telefone: '(11) 98765-4321',
            cidade: 'Campinas',
            estado: 'SP',
            email: 'marcos@transbrasil.com.br',
            valor: 85000,
            potencial: 'A',
            etapaOrigem: 'orcamento',
            motivo: 'Perdido por preço',
            motivoDetalhe: 'Concorrente ofereceu desconto agressivo de 18% para pagamento à vista.',
            dataCriacao: new Date(agora - 28 * diaMs).toISOString(),
            dataExclusao: new Date(agora - 2 * diaMs).toISOString(),
            dataEntradaEtapa: new Date(agora - 24 * diaMs).toISOString(),
            usuarioId: adminId,
            cardObs: 'Proposta inicial R$ 92.000, ajustada para R$ 85.000.',
            itens: [
                { descricao: 'Sistema de Rastreamento e Gestão de Frotas', quantidade: 50, preco: 1700, observacao: 'Módulos IoT' }
            ],
            historico: [
                { data: new Date(agora - 25 * diaMs).toISOString().split('T')[0], hora: '10:00', tipo: 'Ligação', descricao: 'Apresentação da proposta' },
                { data: new Date(agora - 10 * diaMs).toISOString().split('T')[0], hora: '14:30', tipo: 'Follow-up', descricao: 'Negociação de valores' }
            ]
        },
        {
            id: 'perd-ex-2',
            empresa: 'Supermercados Alvorada',
            decisor: 'Renata Figueiredo (Gerente de Compras)',
            telefone: '(21) 99123-4567',
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
            email: 'compras@alvorada.com.br',
            valor: 142000,
            potencial: 'A',
            etapaOrigem: 'orcamento',
            motivo: 'Concorrente com melhor prazo',
            motivoDetalhe: 'Concorrente prometeu entrega em 10 dias úteis, nosso prazo era de 30 dias.',
            dataCriacao: new Date(agora - 45 * diaMs).toISOString(),
            dataExclusao: new Date(agora - 8 * diaMs).toISOString(),
            dataEntradaEtapa: new Date(agora - 40 * diaMs).toISOString(),
            usuarioId: vendedorId,
            cardObs: 'Necessidade urgente para inauguração da filial Barra da Tijuca.',
            itens: [
                { descricao: 'Gôndolas e Estruturas Metálicas de Exposição', quantidade: 200, preco: 710, observacao: 'Pintura eletrostática branca' }
            ],
            historico: [
                { data: new Date(agora - 40 * diaMs).toISOString().split('T')[0], hora: '11:00', tipo: 'Orçamento', descricao: 'Envio de orçamento completo' },
                { data: new Date(agora - 12 * diaMs).toISOString().split('T')[0], hora: '16:00', tipo: 'Ligação', descricao: 'Cobrança de posicionamento da diretoria' }
            ]
        },
        {
            id: 'perd-ex-3',
            empresa: 'Metalúrgica Imperial Ltda',
            decisor: 'Eng. Cláudio Fontes',
            telefone: '(31) 98456-7890',
            cidade: 'Belo Horizonte',
            estado: 'MG',
            email: 'engenharia@metimperial.ind.br',
            valor: 64500,
            potencial: 'B',
            etapaOrigem: 'orcamento',
            motivo: 'Cliente sem orçamento aprovado',
            motivoDetalhe: 'Diretoria congelou investimentos de Capex para o semestre atual.',
            dataCriacao: new Date(agora - 60 * diaMs).toISOString(),
            dataExclusao: new Date(agora - 15 * diaMs).toISOString(),
            dataEntradaEtapa: new Date(agora - 52 * diaMs).toISOString(),
            usuarioId: adminId,
            cardObs: 'Retomar contato no próximo trimestre para reavaliação de verba.',
            itens: [
                { descricao: 'Pintura Industrial e Tratamento Anticorrosivo', quantidade: 1, preco: 64500, observacao: 'Tanques de decapagem' }
            ],
            historico: [
                { data: new Date(agora - 50 * diaMs).toISOString().split('T')[0], hora: '09:30', tipo: 'Reunião', descricao: 'Visita técnica realizada na planta' }
            ]
        },
        {
            id: 'perd-ex-4',
            empresa: 'Hospitalar Medic Prime',
            decisor: 'Dra. Beatriz Moura',
            telefone: '(41) 97890-1234',
            cidade: 'Curitiba',
            estado: 'PR',
            email: 'compras@medicprime.med.br',
            valor: 198000,
            potencial: 'A',
            etapaOrigem: 'orcamento',
            motivo: 'Condições de pagamento',
            motivoDetalhe: 'Exigiam parcelamento em 12x sem juros faturado, nosso limite era de 4x.',
            dataCriacao: new Date(agora - 35 * diaMs).toISOString(),
            dataExclusao: new Date(agora - 22 * diaMs).toISOString(),
            dataEntradaEtapa: new Date(agora - 30 * diaMs).toISOString(),
            usuarioId: vendedorId,
            cardObs: 'Cliente de grande porte, mas política de crédito não flexibilizou.',
            itens: [
                { descricao: 'Lote de Equipamentos e Acessórios Clínicos', quantidade: 12, preco: 16500, observacao: 'Garantia estendida 24 meses' }
            ],
            historico: [
                { data: new Date(agora - 30 * diaMs).toISOString().split('T')[0], hora: '15:00', tipo: 'Orçamento', descricao: 'Envio de condições comerciais' }
            ]
        },
        {
            id: 'perd-ex-5',
            empresa: 'Construtora Horizonte Nobre',
            decisor: 'Ricardo Antunes (Suprimentos)',
            telefone: '(19) 99345-6789',
            cidade: 'Campinas',
            estado: 'SP',
            email: 'suprimentos@horizonteobras.com',
            valor: 48900,
            potencial: 'C',
            etapaOrigem: 'orcamento',
            motivo: 'Desistiu do projeto',
            motivoDetalhe: 'Obra cancelada pelo investidor do condomínio fechado.',
            dataCriacao: new Date(agora - 20 * diaMs).toISOString(),
            dataExclusao: new Date(agora - 5 * diaMs).toISOString(),
            dataEntradaEtapa: new Date(agora - 18 * diaMs).toISOString(),
            usuarioId: adminId,
            cardObs: 'Projeto cancelado sem previsão de retomada.',
            itens: [
                { descricao: 'Cobertura em Policarbonato Alveolar e Perfis de Alumínio', quantidade: 1, preco: 48900, observacao: 'Área externa' }
            ],
            historico: [
                { data: new Date(agora - 18 * diaMs).toISOString().split('T')[0], hora: '14:00', tipo: 'WhatsApp', descricao: 'Esclarecimento de especificações do projeto' }
            ]
        }
    ];
}

window.carregarExemplosPerdidos = carregarExemplosPerdidos;
window.carregarExemplosPerdidosEAtualizar = function() {
    carregarExemplosPerdidos();
    if (typeof salvarDados === 'function') salvarDados();
    if (typeof renderizarAll === 'function') renderizarAll();
    if (typeof showToast === 'function') showToast('5 exemplos de orçamentos perdidos foram carregados com sucesso!');
};

function carregarModelosExemplo() {
    modelos = [{
        id: 'm1',
        nome: 'Proposta Comercial',
        assunto: 'Proposta para {{empresa}}',
        conteudo: 'Olá {{decisor}},\n\nSegue nossa proposta comercial para {{empresa}}.\n\nValor: {{valor}}\n\nAguardamos seu retorno.\n\nAtenciosamente,\nEquipe Comercial'
    }, {
        id: 'm2',
        nome: 'Follow-up',
        assunto: 'Acompanhamento - {{empresa}}',
        conteudo: 'Olá {{decisor}},\n\nGostaríamos de saber se você teve a oportunidade de analisar nossa proposta.\n\nQualquer dúvida, estamos à disposição.\n\nAtenciosamente,\nEquipe Comercial'
    }, {
        id: 'm3',
        nome: 'Newsletter',
        assunto: 'Novidades para {{empresa}}',
        conteudo: 'Olá {{decisor}},\n\nTemos novidades que podem interessar à {{empresa}}.\n\nEntre em contato para mais informações.\n\nAtenciosamente,\nEquipe de Marketing'
    }];
    salvarDados();
}

function carregarModelosWhatsappExemplo() {
    modelosWhatsapp = [{
        id: 'w1',
        nome: 'Primeiro Contato',
        conteudo: 'Olá {{decisor}}! Aqui é da equipe comercial. Tudo bem? Gostaríamos de apresentar uma proposta para a {{empresa}}. Podemos conversar?'
    }, {
        id: 'w2',
        nome: 'Follow-up',
        conteudo: 'Oi {{decisor}}, passando para saber se conseguiu ver nossa proposta para a {{empresa}} (valor: {{valor}}). Fico à disposição!'
    }, {
        id: 'w3',
        nome: 'Confirmação de Pedido',
        conteudo: 'Olá {{decisor}}! Seu pedido para a {{empresa}} foi confirmado. Qualquer dúvida, estou por aqui. Obrigado pela confiança!'
    }];
    salvarDados();
}

function carregarSegmentosExemplo() {
    segmentosBusca = [
        { id: gerarId(), termo: 'indústria metalúrgica' },
        { id: gerarId(), termo: 'usinagem CNC' },
        { id: gerarId(), termo: 'fábrica de embalagens' },
        { id: gerarId(), termo: 'indústria de plásticos' },
        { id: gerarId(), termo: 'fundição' },
        { id: gerarId(), termo: 'marcenaria industrial' },
        { id: gerarId(), termo: 'indústria alimentícia' }
    ];
    salvarDados();
}

function confirmarCarregarExemplos() {
    if (leads.length > 0) {
        if (!confirm('Isso irá SUBSTITUIR todos os dados atuais. Deseja continuar?')) return;
        if (!confirm('Tem certeza? Os dados atuais serão PERDIDOS!')) return;
    }
    carregarExemplos();
    renderizarAll();
    showToast('Exemplos carregados com sucesso!');
}

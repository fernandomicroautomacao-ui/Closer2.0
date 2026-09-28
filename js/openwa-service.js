// ============================================
// SERVIÇO OPEN-WA (WA-AUTOMATE) REST API CLIENT
// Integração oficial com https://www.open-wa.org / @open-wa/wa-automate
// ============================================

const OpenWAService = {
    // Configurações salvas no localStorage
    obterConfig() {
        const salvo = localStorage.getItem('openwa_config');
        if (salvo) {
            try {
                return { ...this.configPadrao(), ...JSON.parse(salvo) };
            } catch (e) {
                console.error('Erro ao ler openwa_config do localStorage:', e);
            }
        }
        return this.configPadrao();
    },

    configPadrao() {
        return {
            ativo: false,
            serverUrl: (typeof CONFIG !== 'undefined' && CONFIG.OPENWA_SERVER_URL) ? CONFIG.OPENWA_SERVER_URL : 'http://localhost:8080',
            apiKey: (typeof CONFIG !== 'undefined' && CONFIG.OPENWA_API_KEY) ? CONFIG.OPENWA_API_KEY : '',
            sessionId: (typeof CONFIG !== 'undefined' && CONFIG.OPENWA_SESSION_ID) ? CONFIG.OPENWA_SESSION_ID : 'default',
            delayMinSegundos: 5,
            delayMaxSegundos: 15,
            pausarAposN: 20,
            tempoPausaMinutos: 5,
            simularDigitando: true
        };
    },

    salvarConfig(novosDados) {
        const atual = this.obterConfig();
        const mesclado = { ...atual, ...novosDados };
        localStorage.setItem('openwa_config', JSON.stringify(mesclado));
        return mesclado;
    },

    // Testa a conectividade com o host Open-WA via endpoint proxy do servidor Node
    async testarConexao() {
        const cfg = this.obterConfig();
        if (!cfg.serverUrl) {
            return { ok: false, error: 'URL do servidor Open-WA não configurada.' };
        }

        try {
            const resp = await fetch('/api/openwa/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serverUrl: cfg.serverUrl,
                    apiKey: cfg.apiKey,
                    sessionId: cfg.sessionId
                })
            });

            const data = await resp.json();
            if (resp.ok && data.success) {
                return { ok: true, data: data.data };
            } else {
                return { ok: false, error: data.error || 'Falha na resposta do servidor Open-WA.' };
            }
        } catch (err) {
            return { ok: false, error: `Não foi possível acessar a rota de teste: ${err.message}` };
        }
    },

    // Envia uma mensagem de texto via Open-WA
    async enviarTexto(telefone, texto) {
        const cfg = this.obterConfig();
        if (!cfg.serverUrl) {
            throw new Error('URL do servidor Open-WA não configurada.');
        }

        const resp = await fetch('/api/openwa/send-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                serverUrl: cfg.serverUrl,
                apiKey: cfg.apiKey,
                to: telefone,
                content: texto,
                pass_filter: true
            })
        });

        const json = await resp.json();
        if (!resp.ok || !json.success) {
            throw new Error(json.error || 'Erro desconhecido ao enviar mensagem pelo Open-WA.');
        }

        return json.data;
    },

    // Envia uma imagem com legenda via Open-WA
    async enviarImagem(telefone, base64DataUrl, legenda = '') {
        const cfg = this.obterConfig();
        if (!cfg.serverUrl) {
            throw new Error('URL do servidor Open-WA não configurada.');
        }

        const resp = await fetch('/api/openwa/send-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                serverUrl: cfg.serverUrl,
                apiKey: cfg.apiKey,
                to: telefone,
                file: base64DataUrl,
                filename: 'imagem.jpg',
                caption: legenda
            })
        });

        const json = await resp.json();
        if (!resp.ok || !json.success) {
            throw new Error(json.error || 'Erro ao enviar imagem pelo Open-WA.');
        }

        return json.data;
    },

    // Utilitário para sleep com promise
    dormir(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Gera um delay seguro e aleatório entre delayMin e delayMax segundos
    obterDelayAleatorioMs() {
        const cfg = this.obterConfig();
        const min = Math.max(2, parseInt(cfg.delayMinSegundos, 10) || 5);
        const max = Math.max(min, parseInt(cfg.delayMaxSegundos, 10) || 15);
        const sec = Math.floor(Math.random() * (max - min + 1)) + min;
        return sec * 1000;
    }
};

window.OpenWAService = OpenWAService;

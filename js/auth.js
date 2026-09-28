// ============================================
// LOGIN / USUÁRIOS
// ============================================
function alternarVisibilidadeSenha() {
    const input = document.getElementById('loginSenha');
    const btn = document.getElementById('btnToggleSenha');
    const oculto = input.type === 'password';
    input.type = oculto ? 'text' : 'password';
    btn.innerHTML = svgIcone(oculto ? 'ocultar' : 'olho');
    btn.title = oculto ? 'Ocultar senha' : 'Mostrar senha';
}

async function carregarUsuarios() {
    try {
        const { data, error } = await supabaseClient.from('profiles').select('id, nome, email, papel');
        if (error) {
            console.warn('Aviso ao carregar usuários do Supabase:', error);
            usuarios = [];
            return;
        }
        usuarios = data || [];
    } catch (e) {
        console.warn('Exceção ao carregar usuários do Supabase:', e);
        usuarios = [];
    }
}

async function verificarLogin() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('page') === 'planos' || urlParams.get('saas') === '1') {
            setTimeout(() => {
                if (typeof abrirMainPageSaaS === 'function') abrirMainPageSaaS('equipe');
            }, 150);
        }

        // 1. Verifica se há sessão ativa de Tenant Individual provisionado via Checkout SaaS
        const sessaoTenantRaw = sessionStorage.getItem('feitosa_saas_tenant_session');
        if (sessaoTenantRaw) {
            try {
                const sessaoTenant = JSON.parse(sessaoTenantRaw);
                if (sessaoTenant && sessaoTenant.usuario && sessaoTenant.tenantSlug) {
                    if (typeof definirTenantAtivo === 'function') {
                        definirTenantAtivo(sessaoTenant.tenantSlug, false);
                    }
                    usuarios = [sessaoTenant.usuario];
                    usuarioAtual = sessaoTenant.usuario;
                    await carregarDados();
                    mostrarApp();
                    return;
                }
            } catch (e) {}
        }

        const { data, error } = await supabaseClient.auth.getSession();
        const session = data && data.session;
        if (error || !session) {
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('appWrapper').style.display = 'none';
            if (typeof atualizarBadgeTenantUI === 'function') atualizarBadgeTenantUI();
            return;
        }

        // Só agora, com sessão confirmada, é que dá pra buscar profiles/leads (RLS exige autenticação)
        await carregarUsuarios();
        const perfil = usuarios.find(u => u.id === session.user.id);
        if (!perfil) {
            // Sessão do Supabase existe mas o profile ainda não foi encontrado (ex: acabou de ser criado)
            await supabaseClient.auth.signOut();
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('appWrapper').style.display = 'none';
            return;
        }
        await carregarDados();
        usuarioAtual = perfil;
        if (typeof carregarDadosEmpresa === 'function') await carregarDadosEmpresa();
        mostrarApp();
    } catch (err) {
        console.warn('Exceção ao verificar sessão com Supabase:', err);
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appWrapper').style.display = 'none';
    }
}

async function fazerLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const senha = document.getElementById('loginSenha').value;
    const slugInput = document.getElementById('loginTenantSlug')?.value.trim() || '';
    const errEl = document.getElementById('loginError');

    if (slugInput && typeof definirTenantAtivo === 'function') {
        definirTenantAtivo(slugInput, false);
    }

    // 1. Verifica se o login pertence a um Tenant Individual provisionado via SaaS Checkout
    if (typeof tentarLoginTenantLocal === 'function') {
        const resLocal = tentarLoginTenantLocal(email, senha, slugInput);
        if (resLocal) {
            definirTenantAtivo(resLocal.tenant.slug, false);
            sessionStorage.setItem('feitosa_saas_tenant_session', JSON.stringify({
                tenantSlug: resLocal.tenant.slug,
                usuario: resLocal.perfil
            }));
            usuarios = [resLocal.perfil];
            usuarioAtual = resLocal.perfil;
            errEl.style.display = 'none';
            await carregarDados();
            mostrarApp();
            return;
        }
    }

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });

        if (error || !data.session) {
            errEl.textContent = 'E-mail, senha ou código de ambiente (Tenant) inválidos.';
            errEl.style.display = 'block';
            const card = document.getElementById('loginCard');
            if (card) {
                card.classList.remove('shake');
                void card.offsetWidth;
                card.classList.add('shake');
            }
            return;
        }

        await carregarUsuarios();
        const perfil = usuarios.find(u => u.id === data.session.user.id);
        if (!perfil) {
            errEl.textContent = 'Login válido, mas não encontramos seu perfil. Fale com um administrador.';
            errEl.style.display = 'block';
            await supabaseClient.auth.signOut();
            return;
        }
        await carregarDados();

        errEl.style.display = 'none';
        usuarioAtual = perfil;
        if (typeof carregarDadosEmpresa === 'function') await carregarDadosEmpresa();
        mostrarApp();
    } catch (errNet) {
        console.warn('Erro de conexão ao tentar fazer login:', errNet);
        errEl.textContent = 'Falha de conexão com o servidor de autenticação. Verifique sua internet.';
        errEl.style.display = 'block';
    }
}

async function logout() {
    sessionStorage.removeItem('feitosa_saas_tenant_session');
    try {
        await supabaseClient.auth.signOut();
    } catch (e) {}
    usuarioAtual = null;
    document.getElementById('loginForm').reset();
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appWrapper').style.display = 'none';
    if (typeof atualizarBadgeTenantUI === 'function') atualizarBadgeTenantUI();
}

function mostrarApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appWrapper').style.display = 'flex';

    const avatarEl = document.getElementById('userAvatar');
    avatarEl.textContent = iniciais(usuarioAtual.nome);
    avatarEl.style.background = corAvatar(usuarioAtual.nome);
    document.getElementById('userNome').textContent = usuarioAtual.nome;
    const ehAdmin = usuarioAtual.papel === 'admin';
    document.getElementById('navAdmin').style.display = ehAdmin ? 'flex' : 'none';
    const adminGroup = document.getElementById('navAdminGroup');
    if (adminGroup) adminGroup.style.display = ehAdmin ? 'block' : 'none';
    const roleEl = document.getElementById('headerUserRole');
    if (roleEl) roleEl.textContent = ehAdmin ? 'Administrador' : 'Vendedor';

    // Admin filter
    const filterContainer = document.getElementById('adminFilterContainer');
    if (usuarioAtual.papel === 'admin') {
        filterContainer.style.display = 'flex';
        const select = document.getElementById('filtroUsuarioAdmin');
        select.innerHTML = '<option value="">Todos</option>' +
            usuarios.map(u => `<option value="${u.id}">${u.nome}</option>`).join('');
        select.value = filtroAdminUsuarioId; // mantém seleção anterior
    } else {
        filterContainer.style.display = 'none';
        filtroAdminUsuarioId = ''; // reset
    }

    if (typeof aplicarModoSaaSEnxutoUI === 'function') {
        aplicarModoSaaSEnxutoUI();
    }

    renderizarAll();
}

// ============================================
// FILTRO DE LEADS POR USUÁRIO
// ============================================
function getLeadsVisiveis() {
    if (!usuarioAtual) return [];
    let resultado = leads;
    if (usuarioAtual.papel === 'admin') {
        if (filtroAdminUsuarioId) {
            resultado = leads.filter(l => l.usuarioId === filtroAdminUsuarioId);
        }
        // se não houver filtro, retorna todos
    } else {
        resultado = leads.filter(l => l.usuarioId === usuarioAtual.id);
    }
    return resultado;
}

function getPerdidosVisiveis() {
    if (!usuarioAtual) return [];
    let resultado = perdidos;
    if (usuarioAtual.papel === 'admin') {
        if (filtroAdminUsuarioId) {
            resultado = perdidos.filter(p => p.usuarioId === filtroAdminUsuarioId);
        }
    } else {
        resultado = perdidos.filter(p => p.usuarioId === usuarioAtual.id);
    }
    return resultado;
}

// ============================================
// MODAIS
// ============================================
function abrirModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
        el.classList.add('open');
        el.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        console.warn(`[Modals] Modal #${modalId} não encontrado no DOM.`);
    }
}

function fecharModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
        el.classList.remove('open');
        el.style.display = '';
        if (!document.querySelector('.modal-overlay.open')) {
            document.body.style.overflow = '';
        }
    }
}

function fecharTodosModais() {
    document.querySelectorAll('.modal-overlay.open').forEach(el => {
        el.classList.remove('open');
        el.style.display = '';
    });
    document.body.style.overflow = '';
}

function mostrarGuiaConfig() {
    abrirModal('configModal');
}

// ─────────────────────────────────────────────────────────────
// utils.js — Utilidades y Modales de Confirmación
// ─────────────────────────────────────────────────────────────

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP', 
        minimumFractionDigits: 0 
    }).format(Number(price) || 0);
};

// ─── Sistema de Notificaciones ───────────────────────────────
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✓' : '✕'}</div>
        <div class="toast-text">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('hide'), 3000);
    toast.addEventListener('transitionend', () => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    });
}

// ─── Modal de Confirmación Genérico ─────────────────────────
function openConfirmModal({ title, text, onConfirm, confirmText = 'Confirmar', danger = false }) {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-title');
    const textEl = document.getElementById('confirm-text');
    const actionBtn = document.getElementById('confirm-action-btn');

    if (!modal) return;

    titleEl.textContent = title;
    textEl.textContent = text;
    actionBtn.textContent = confirmText;
    actionBtn.className = danger ? 'btn-save btn-danger' : 'btn-save';

    actionBtn.onclick = () => {
        onConfirm();
        cerrarConfirmacion();
    };

    modal.classList.add('active');
}

function cerrarConfirmacion() {
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.classList.remove('active');
}

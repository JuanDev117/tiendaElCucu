// ─────────────────────────────────────────────────────────────
// ui.js — Gestión de la interfaz y navegación
// ─────────────────────────────────────────────────────────────

function setupNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-view]');
    const viewPanels = document.querySelectorAll('.admin-view[data-view-panel]');
    const quickActions = document.querySelectorAll('[data-go-view]');

    function cambiarVista(viewName) {
        navItems.forEach(item => item.classList.toggle('active', item.dataset.view === viewName));
        viewPanels.forEach(panel => panel.classList.toggle('active', panel.dataset.viewPanel === viewName));

        if (viewName === 'pedidos') cargarPedidos();
        if (viewName === 'productos') cargarProductos();
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            cambiarVista(item.dataset.view);
            cerrarSidebarMobile();
        });
    });

    quickActions.forEach(action => {
        action.addEventListener('click', () => {
            cambiarVista(action.dataset.goView);
            cerrarSidebarMobile();
        });
    });
}

function setupMobileMenu() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }
}

function cerrarSidebarMobile() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.remove('mobile-open');
    }
}

function setupLogout() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = '/login/login.html';
        });
    }
}

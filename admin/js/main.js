// ─────────────────────────────────────────────────────────────
// main.js — Inicialización del Panel Admin
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar navegación y UI
    setupNavigation();
    setupMobileMenu();
    setupLogout();

    // Cargar datos iniciales
    cargarProductos();
    cargarPedidos();

    // Listeners de botones globales
    const btnRefreshProds = document.querySelector('.btn-icon[aria-label="Actualizar"]');
    if (btnRefreshProds) btnRefreshProds.addEventListener('click', cargarProductos);

    const btnRefreshOrders = document.getElementById('refresh-orders-btn');
    if (btnRefreshOrders) btnRefreshOrders.addEventListener('click', cargarPedidos);

    const btnExport = document.getElementById('btn-exportar-pedidos');
    if (btnExport) btnExport.addEventListener('click', exportarPedidosAExcel);

    const btnClear = document.getElementById('btn-limpiar-pedidos');
    if (btnClear) btnClear.addEventListener('click', limpiarPedidos);

    const addProdBtns = document.querySelectorAll('.add-btn');
    addProdBtns.forEach(btn => btn.addEventListener('click', abrirModalAgregar));

    // Buscador Global
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termino = e.target.value;
            const activeView = document.querySelector('.admin-view.active').dataset.viewPanel;
            
            if (activeView === 'productos') filtrarProductos(termino);
            if (activeView === 'pedidos') filtrarPedidos(termino);
        });
    }
});

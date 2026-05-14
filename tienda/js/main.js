// ─────────────────────────────────────────────────────────────
// main.js — Punto de entrada. Inicializa todos los módulos.
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Navbar
    actualizarNavbar();
    setupNavbarScroll();
    setupSmoothScrolling();
    setupMobileMenu();
    setupLogout();

    // Carrito
    setupCartEvents();

    // Productos y filtros
    cargarProductos();
    setupCategoryFilters();
});

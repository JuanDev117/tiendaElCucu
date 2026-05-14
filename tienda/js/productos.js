// ─────────────────────────────────────────────────────────────
// productos.js — Carga, renderizado y filtros de productos
// ─────────────────────────────────────────────────────────────

async function cargarProductos() {
    try {
        productos = await obtenerProductosActivos();
        renderizarDestacados();
        renderizarProductos();
        setupAddToCartButtons();
    } catch (err) {
        console.error('Error al cargar productos:', err);
    }
}

async function obtenerProductosActivos() {
    try {
        const response = await fetch(`${API_URL}/api/productos`);
        if (!response.ok) throw new Error('Backend no disponible');
        return await response.json();
    } catch (backendError) {
        if (!supabaseDb) throw backendError;

        const { data, error } = await supabaseDb
            .from('productos')
            .select('*')
            .eq('estado', 'activo')
            .gt('stock', 0)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
}

function renderizarDestacados() {
    const grid = document.getElementById('destacados-grid');
    if (!grid) return;

    const destacados = productos.slice(0, 4);
    grid.innerHTML = destacados.map(producto => crearProductoCardHTML(producto)).join('');
}

function renderizarProductos() {
    const grid = document.getElementById('category-results-grid');
    if (!grid) return;

    const filtro = categoriaSeleccionada ? categoriaSeleccionada.toLowerCase().trim() : 'todas';
    const productosAMostrar = filtro === 'todas'
        ? productos
        : productos.filter(p => p.categoria && p.categoria.toLowerCase().trim() === filtro);

    if (productosAMostrar.length === 0) {
        grid.innerHTML = `<div class="empty-products" style="grid-column: 1 / -1;">No hay productos disponibles en esta categoría.</div>`;
        return;
    }

    grid.innerHTML = productosAMostrar.map(producto => crearProductoCardHTML(producto)).join('');
    setupAddToCartButtons();
}

function crearProductoCardHTML(producto) {
    const imagenHTML = producto.imagen
        ? `<img src="${producto.imagen}" alt="${producto.nombre}">`
        : `<div style="width:100%; height:200px; background:var(--bg-secondary);"></div>`;

    return `
        <div class="product-card" data-producto-id="${producto.id}">
            <div class="product-image-placeholder">${imagenHTML}</div>
            <div class="product-info">
                <span class="product-category">${producto.categoria}</span>
                <h3 class="product-name">${producto.nombre}</h3>
                <div class="product-bottom">
                    <span class="product-price">$${parseInt(producto.precio).toLocaleString('es-CO')}</span>
                    <button class="add-to-cart" aria-label="Agregar al carrito" data-producto-id="${producto.id}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.removeEventListener('click', agregarAlCarrito);
        button.addEventListener('click', agregarAlCarrito);
    });
}

function setupCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            categoriaSeleccionada = btn.getAttribute('data-category') || 'todas';
            renderizarProductos();
        });
    });
}

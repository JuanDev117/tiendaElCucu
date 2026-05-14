// ─────────────────────────────────────────────────────────────
// inventory.js — Gestión de productos (CRUD)
// ─────────────────────────────────────────────────────────────

async function cargarProductos() {
    try {
        productos = await obtenerProductosAdmin();
        renderizarTablaProductos();
        actualizarResumenInventario();
    } catch (err) {
        console.error('Error:', err);
    }
}

async function obtenerProductosAdmin() {
    try {
        const response = await fetch(`${API_URL}/api/productos/admin/all`);
        if (!response.ok) throw new Error('Backend no disponible');
        return await response.json();
    } catch (backendError) {
        if (!supabaseDb) throw backendError;
        const { data, error } = await supabaseDb.from('productos').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }
}

function renderizarTablaProductos() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    productos.forEach(producto => {
        const stock = Number(producto.stock || 0);
        const agotado = stock <= 0;
        const bajoStock = stock > 0 && stock <= 5;
        const estado = agotado ? 'Agotado' : bajoStock ? 'Bajo' : producto.estado === 'activo' ? 'Activo' : 'Inactivo';
        const badgeClass = agotado ? 'badge-danger' : bajoStock ? 'badge-warning' : producto.estado === 'activo' ? 'badge-active' : 'badge-inactive';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><div class="td-product">
                ${producto.imagen ? `<img src="${producto.imagen}" alt="">` : '<div class="mini-placeholder"></div>'}
                <span>${producto.nombre}</span>
            </div></td>
            <td>${producto.categoria}</td>
            <td>${formatPrice(producto.precio)}</td>
            <td>${stock}</td>
            <td><span class="badge ${badgeClass}">${estado}</span></td>
            <td><div class="actions">
                <button class="action-btn edit" onclick="abrirModalEditar(${producto.id})">✎</button>
                <button class="action-btn delete" onclick="eliminarProducto(${producto.id})">🗑</button>
            </div></td>
        `;
        tbody.appendChild(row);
    });
}

function actualizarResumenInventario() {
    const totalStock = productos.reduce((t, p) => t + Number(p.stock || 0), 0);
    const bajos = productos.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length;
    
    const totalEl = document.getElementById('productos-total');
    const activosEl = document.getElementById('productos-activos');
    const bajosEl = document.getElementById('productos-bajos');
    
    if (totalEl) totalEl.textContent = productos.length;
    if (activosEl) activosEl.textContent = productos.filter(p => p.estado === 'activo').length;
    if (bajosEl) bajosEl.textContent = bajos;
}

// ─── Modales Producto ───────────────────────────────────────
function abrirModalAgregar() {
    productoEnEdicion = null;
    mostrarModalProducto('agregar');
}

function abrirModalEditar(id) {
    const p = productos.find(item => String(item.id) === String(id));
    if (!p) return;
    productoEnEdicion = p;
    mostrarModalProducto('editar', p);
}

function mostrarModalProducto(tipo, p = null) {
    const modal = document.getElementById('producto-modal');
    const form = document.getElementById('producto-form');
    if (!modal || !form) return;

    form.reset();
    if (tipo === 'editar' && p) {
        form.nombre.value = p.nombre;
        form.precio.value = p.precio;
        form.stock.value = p.stock;
        form.categoria.value = p.categoria;
        form.estado.value = p.estado;
        form.imagen.value = p.imagen || '';
    }

    form.onsubmit = (e) => guardarProducto(e, tipo);
    modal.classList.add('active');
}

async function guardarProducto(e, tipo) {
    e.preventDefault();
    const f = e.target;
    const datos = {
        nombre: f.nombre.value.trim(),
        precio: parseFloat(f.precio.value.replace(/\./g, '').replace(',', '.')),
        stock: parseInt(f.stock.value),
        categoria: f.categoria.value,
        estado: f.estado.value,
        imagen: f.imagen.value.trim()
    };

    try {
        const url = tipo === 'agregar' ? `${API_URL}/api/productos` : `${API_URL}/api/productos/${productoEnEdicion.id}`;
        const res = await fetch(url, {
            method: tipo === 'agregar' ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        if (!res.ok) throw new Error('Error al guardar');
        
        showToast('Producto guardado correctamente');
        document.getElementById('producto-modal').classList.remove('active');
        cargarProductos();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function eliminarProducto(id) {
    openConfirmModal({
        title: 'Eliminar producto',
        text: '¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        danger: true,
        onConfirm: async () => {
            try {
                await fetch(`${API_URL}/api/productos/${id}`, { method: 'DELETE' });
                showToast('Producto eliminado');
                cargarProductos();
            } catch (err) { console.error(err); }
        }
    });
}
function filtrarProductos(termino) {
    const query = termino.toLowerCase();
    const rows = document.querySelectorAll('#products-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

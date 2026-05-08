// ─── Configuración del servidor backend ───────────────────────
const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? `http://${window.location.hostname}:3001`
    : '';
const supabaseDb = window.cucuSupabaseClient;

// Variables globales
let productos = [];
let productoEnEdicion = null;

// Elementos del DOM
const addBtns = document.querySelectorAll('.add-btn');
const adminTable = document.querySelector('.admin-table tbody');
const refreshBtn = document.querySelector('.btn-icon[aria-label="Actualizar"]');
const statValues = document.querySelectorAll('.stat-value');
const statTrends = document.querySelectorAll('.stat-trend');
const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-view]');
const viewPanels = document.querySelectorAll('.admin-view[data-view-panel]');
const quickActions = document.querySelectorAll('[data-go-view]');
const productosTotal = document.getElementById('productos-total');
const productosActivos = document.getElementById('productos-activos');
const productosBajos = document.getElementById('productos-bajos');

// ─── Cargar productos al iniciar ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    setupEventListeners();
});

// ─── Event Listeners ───────────────────────────────────────
function setupEventListeners() {
    addBtns.forEach(btn => btn.addEventListener('click', abrirModalAgregar));

    if (refreshBtn) {
        refreshBtn.addEventListener('click', cargarProductos);
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            cambiarVista(item.dataset.view);
        });
    });

    quickActions.forEach(action => {
        action.addEventListener('click', () => cambiarVista(action.dataset.goView));
    });
}

function cambiarVista(viewName) {
    navItems.forEach(item => item.classList.toggle('active', item.dataset.view === viewName));
    viewPanels.forEach(panel => panel.classList.toggle('active', panel.dataset.viewPanel === viewName));
}

// ─── Cargar productos del backend ───────────────────────────
async function cargarProductos() {
    try {
        productos = await obtenerProductosAdmin();
        renderizarTabla();
        actualizarResumenInventario();
    } catch (err) {
        console.error('Error:', err);
        alert('Error al cargar productos: ' + err.message);
    }
}

async function obtenerProductosAdmin() {
    try {
        const response = await fetch(`${API_URL}/api/productos/admin/all`);
        if (!response.ok) throw new Error('Backend no disponible');
        return await response.json();
    } catch (backendError) {
        if (!supabaseDb) throw backendError;

        const { data, error } = await supabaseDb
            .from('productos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
}

function actualizarResumenInventario() {
    const totalStock = productos.reduce((total, producto) => total + Number(producto.stock || 0), 0);
    const bajosStock = productos.filter(producto => Number(producto.stock || 0) > 0 && Number(producto.stock || 0) <= 5).length;
    const activos = productos.filter(producto => producto.estado === 'activo').length;

    if (statValues[2]) {
        statValues[2].textContent = totalStock.toLocaleString('es-CO');
    }

    if (statTrends[2]) {
        statTrends[2].textContent = bajosStock === 1 ? '1 bajo de stock' : `${bajosStock} bajos de stock`;
    }

    if (productosTotal) {
        productosTotal.textContent = productos.length.toLocaleString('es-CO');
    }

    if (productosActivos) {
        productosActivos.textContent = activos.toLocaleString('es-CO');
    }

    if (productosBajos) {
        productosBajos.textContent = bajosStock.toLocaleString('es-CO');
    }
}

// ─── Renderizar tabla de productos ─────────────────────────
function renderizarTabla() {
    adminTable.innerHTML = '';

    if (productos.length === 0) {
        adminTable.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    No hay productos aún. ¡Agrega uno nuevo!
                </td>
            </tr>
        `;
        return;
    }

    productos.forEach(producto => {
        const stock = Number(producto.stock || 0);
        const agotado = stock <= 0;
        const bajoStock = stock > 0 && stock <= 5;
        const estado = agotado ? 'Agotado' : bajoStock ? 'Bajo' : producto.estado === 'activo' ? 'Activo' : 'Inactivo';
        const badgeClass = agotado ? 'badge-danger' : bajoStock ? 'badge-warning' : producto.estado === 'activo' ? 'badge-active' : 'badge-inactive';
        
        const fila = document.createElement('tr');
        fila.dataset.productoId = producto.id;
        fila.innerHTML = `
            <td>
                <div class="td-product">
                    ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}" style="width: 32px; height: 32px; border-radius: 4px;">` : '<div class="mini-placeholder"></div>'}
                    <span>${producto.nombre}</span>
                </div>
            </td>
            <td>${producto.categoria}</td>
            <td>$${parseFloat(producto.precio).toLocaleString('es-CO')}</td>
            <td>${stock}</td>
            <td><span class="badge ${badgeClass}">${estado}</span></td>
            <td>
                <div class="actions">
                    <button class="action-btn edit" title="Editar" onclick="abrirModalEditar(${producto.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="action-btn delete" title="Eliminar" onclick="eliminarProducto(${producto.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        `;
        adminTable.appendChild(fila);
    });
}

// ─── Abrir modal para agregar producto ──────────────────────
function abrirModalAgregar() {
    productoEnEdicion = null;
    mostrarModal('agregar');
}

// ─── Abrir modal para editar producto ──────────────────────
function abrirModalEditar(id) {
    const producto = productos.find(p => String(p.id) === String(id));
    if (!producto) return;

    productoEnEdicion = producto;
    mostrarModal('editar', producto);
}

// ─── Mostrar modal ────────────────────────────────────────
function mostrarModal(tipo, producto = null) {
    // Obtiene el modal existente del DOM (ahora definido en admin.html)
    const modal = document.getElementById('producto-modal');
    const form = modal.querySelector('#producto-form');
    const titulo = modal.querySelector('.modal-title');

    if (!modal || !form) {
        console.error('No se encontró el modal o el formulario en el DOM');
        return;
    }

    // Limpiar el formulario antes de usarlo
    form.reset();
    productoEnEdicion = null;

    if (tipo === 'agregar') {
        titulo.textContent = 'Agregar Nuevo Producto';
    } else {
        titulo.textContent = 'Editar Producto';
        productoEnEdicion = producto;
        form.nombre.value = producto.nombre;
        form.precio.value = producto.precio;
        form.stock.value = producto.stock;
        form.categoria.value = producto.categoria;
        form.estado.value = producto.estado;
        form.imagen.value = producto.imagen || '';
    }

    // Usamos una función anónima para evitar problemas de contexto con 'tipo'
    form.onsubmit = (e) => guardarProducto(e, tipo);

    modal.classList.add('active');
}

// Función para cerrar el modal de forma segura
function cerrarModal() {
    const modal = document.getElementById('producto-modal');
    if (modal) {
        modal.classList.remove('active');
        productoEnEdicion = null;
    }
}

// Cerrar modal al hacer click fuera del contenido
document.addEventListener('click', (e) => {
    const modal = document.getElementById('producto-modal');
    if (e.target === modal) {
        cerrarModal();
    }
});

// ─── Guardar producto ──────────────────────────────────────
async function guardarProducto(e, tipo) {
    e.preventDefault();
    const form = e.target;
    console.log(`Intentando ${tipo} producto...`);

    // Limpiamos el precio: eliminamos puntos de miles y convertimos coma decimal en punto
    const precioLimpio = form.precio.value
        .replace(/\./g, '')  // Quita los puntos de miles (12.000 -> 12000)
        .replace(',', '.');  // Cambia coma por punto decimal si el usuario la usó

    const datos = {
        nombre: form.nombre.value.trim(),
        precio: parseFloat(precioLimpio),
        stock: Number.parseInt(form.stock.value, 10),
        categoria: form.categoria.value,
        estado: form.estado.value,
        imagen: form.imagen.value.trim()
    };

    try {
        const result = await persistirProducto(datos, tipo);
        console.log('Resultado del servidor:', result);

        alert(result.message || 'Operación exitosa');
        cerrarModal();
        cargarProductos();
    } catch (err) {
        console.error('Error al guardar:', err);
        alert('Error: ' + err.message);
    }
}

async function persistirProducto(datos, tipo) {
    try {
        const url = tipo === 'agregar'
            ? `${API_URL}/api/productos`
            : `${API_URL}/api/productos/${productoEnEdicion.id}`;
        
        console.log(`Petición ${tipo === 'agregar' ? 'POST' : 'PUT'} a: ${url}`);

        const response = await fetch(url, {
            method: tipo === 'agregar' ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al guardar producto');
        }

        return result;
    } catch (backendError) {
        if (!supabaseDb) throw backendError;

        if (tipo === 'agregar') {
            const { data, error } = await supabaseDb
                .from('productos')
                .insert([{ ...datos, created_at: new Date().toISOString() }])
                .select()
                .single();

            if (error) throw error;
            return { message: 'Producto creado exitosamente', producto: data };
        }

        const { data, error } = await supabaseDb
            .from('productos')
            .update(datos)
            .eq('id', productoEnEdicion.id)
            .select()
            .single();

        if (error) throw error;
        return { message: 'Producto actualizado exitosamente', producto: data };
    }
}

// ─── Eliminar producto ────────────────────────────────────
async function eliminarProducto(id) {
    const producto = productos.find(p => String(p.id) === String(id));
    
    if (!confirm(`¿Estás seguro de que deseas eliminar "${producto.nombre}"?`)) {
        return;
    }

    try {
        await borrarProducto(id);

        alert('Producto eliminado exitosamente');
        cargarProductos();
    } catch (err) {
        console.error('Error:', err);
        alert('Error: ' + err.message);
    }
}

async function borrarProducto(id) {
    try {
        const response = await fetch(`${API_URL}/api/productos/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al eliminar producto');
        }

        return result;
    } catch (backendError) {
        if (!supabaseDb) throw backendError;

        const { error } = await supabaseDb
            .from('productos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { message: 'Producto eliminado exitosamente' };
    }
}

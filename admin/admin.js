// ─── Configuración del servidor backend ───────────────────────
const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:3001'
    : '';
const supabaseDb = window.cucuSupabaseClient;

// Variables globales
let productos = [];
let productoEnEdicion = null;

// Elementos del DOM
const addBtn = document.querySelector('.add-btn');
const adminTable = document.querySelector('.admin-table tbody');
const refreshBtn = document.querySelector('.btn-icon[aria-label="Actualizar"]');
const statValues = document.querySelectorAll('.stat-value');
const statTrends = document.querySelectorAll('.stat-trend');

// ─── Cargar productos al iniciar ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    setupEventListeners();
});

// ─── Event Listeners ───────────────────────────────────────
function setupEventListeners() {
    if (addBtn) {
        addBtn.addEventListener('click', abrirModalAgregar);
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', cargarProductos);
    }
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

    if (statValues[2]) {
        statValues[2].textContent = totalStock.toLocaleString('es-CO');
    }

    if (statTrends[2]) {
        statTrends[2].textContent = bajosStock === 1 ? '1 bajo de stock' : `${bajosStock} bajos de stock`;
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
    let modal = document.getElementById('producto-modal');
    
    if (!modal) {
        modal = crearModal();
        document.body.appendChild(modal);
    }

    const form = modal.querySelector('#producto-form');
    const titulo = modal.querySelector('.modal-title');

    if (tipo === 'agregar') {
        titulo.textContent = 'Agregar Nuevo Producto';
        form.reset();
    } else {
        titulo.textContent = 'Editar Producto';
        form.nombre.value = producto.nombre;
        form.precio.value = producto.precio;
        form.stock.value = producto.stock;
        form.categoria.value = producto.categoria;
        form.estado.value = producto.estado;
        form.imagen.value = producto.imagen || '';
    }

    form.onsubmit = (e) => guardarProducto(e, tipo);
    modal.style.display = 'flex';
    
    // Cerrar modal al hacer click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ─── Crear estructura del modal ────────────────────────────
function crearModal() {
    const modal = document.createElement('div');
    modal.id = 'producto-modal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
    `;

    modal.innerHTML = `
        <div class="modal-content" style="
            background: linear-gradient(135deg, var(--bg-primary) 0%, rgba(22, 163, 74, 0.05) 100%);
            border: 1px solid var(--border-color);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 
                        0 0 60px rgba(34, 197, 94, 0.15);
            border-radius: 16px;
            padding: 32px;
            width: 90%;
            max-width: 550px;
            max-height: 85vh;
            overflow-y: auto;
            color: var(--text-primary);
            animation: slideUp 0.3s ease-out;
        ">
            <style>
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            </style>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 class="modal-title" style="margin: 0; font-size: 1.75rem; font-weight: 700; background: linear-gradient(135deg, var(--text-primary) 0%, var(--green-primary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Agregar Producto</h2>
                <button type="button" onclick="document.getElementById('producto-modal').style.display = 'none'" style="
                    background: none;
                    border: none;
                    font-size: 28px;
                    cursor: pointer;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                    padding: 4px 8px;
                ">×</button>
            </div>
            
            <form id="producto-form" style="display: flex; flex-direction: column; gap: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 10px; font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">Nombre del Producto</label>
                    <input type="text" name="nombre" required style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        background: rgba(0, 0, 0, 0.2);
                        color: var(--text-primary);
                        font-size: 15px;
                        box-sizing: border-box;
                        transition: all 0.2s;
                    " placeholder="Ej: Bebida Energética" onmouseover="this.style.borderColor='var(--green-primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label style="display: block; margin-bottom: 10px; font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">Precio ($)</label>
                        <input type="number" name="precio" required step="0.01" style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 1px solid var(--border-color);
                            border-radius: 8px;
                            background: rgba(0, 0, 0, 0.2);
                            color: var(--text-primary);
                            font-size: 15px;
                            box-sizing: border-box;
                            transition: all 0.2s;
                        " placeholder="0.00" onmouseover="this.style.borderColor='var(--green-primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 10px; font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">Stock</label>
                        <input type="number" name="stock" required style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 1px solid var(--border-color);
                            border-radius: 8px;
                            background: rgba(0, 0, 0, 0.2);
                            color: var(--text-primary);
                            font-size: 15px;
                            box-sizing: border-box;
                            transition: all 0.2s;
                        " placeholder="0" onmouseover="this.style.borderColor='var(--green-primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label style="display: block; margin-bottom: 10px; font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">Categoría</label>
                        <select name="categoria" required style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 1px solid var(--border-color);
                            border-radius: 8px;
                            background: rgba(0, 0, 0, 0.2);
                            color: var(--text-primary);
                            font-size: 15px;
                            box-sizing: border-box;
                            transition: all 0.2s;
                            cursor: pointer;
                        " onmouseover="this.style.borderColor='var(--green-primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                            <option value="">Selecciona una categoría</option>
                            <option value="Bebidas">Bebidas</option>
                            <option value="Snacks">Snacks</option>
                            <option value="Dulces">Dulces</option>
                            <option value="Carnes">Carnes</option>
                            <option value="Lácteos">Lácteos</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 10px; font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">Estado</label>
                        <select name="estado" style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 1px solid var(--border-color);
                            border-radius: 8px;
                            background: rgba(0, 0, 0, 0.2);
                            color: var(--text-primary);
                            font-size: 15px;
                            box-sizing: border-box;
                            transition: all 0.2s;
                            cursor: pointer;
                        " onmouseover="this.style.borderColor='var(--green-primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style="display: block; margin-bottom: 10px; font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">URL de Imagen <span style="color: var(--text-secondary); font-size: 0.85rem;">(Opcional)</span></label>
                    <input type="url" name="imagen" style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        background: rgba(0, 0, 0, 0.2);
                        color: var(--text-primary);
                        font-size: 15px;
                        box-sizing: border-box;
                        transition: all 0.2s;
                    " placeholder="https://ejemplo.com/imagen.jpg (opcional)" onmouseover="this.style.borderColor='var(--green-primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                </div>

                <div style="display: flex; gap: 12px; margin-top: 28px;">
                    <button type="submit" class="btn btn-primary" style="
                        flex: 1;
                        padding: 14px 24px;
                        background: linear-gradient(135deg, var(--green-primary) 0%, var(--green-glow) 100%);
                        border: none;
                        border-radius: 8px;
                        color: #000;
                        font-weight: 700;
                        cursor: pointer;
                        transition: all 0.3s;
                        font-size: 16px;
                        box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
                    " onmouseover="this.style.boxShadow='0 15px 35px rgba(34, 197, 94, 0.5)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='0 10px 25px rgba(34, 197, 94, 0.3)'; this.style.transform='translateY(0)'">
                        ✓ Guardar Producto
                    </button>
                    <button type="button" class="btn" onclick="document.getElementById('producto-modal').style.display = 'none'" style="
                        flex: 1;
                        padding: 14px 24px;
                        background: rgba(0, 0, 0, 0.3);
                        color: var(--text-primary);
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s;
                        font-weight: 600;
                        font-size: 16px;
                    " onmouseover="this.style.borderColor='var(--green-primary)'; this.style.background='rgba(34, 197, 94, 0.1)'" onmouseout="this.style.borderColor='var(--border-color)'; this.style.background='rgba(0, 0, 0, 0.3)'">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    `;

    return modal;
}

// ─── Guardar producto ──────────────────────────────────────
async function guardarProducto(e, tipo) {
    e.preventDefault();

    const form = e.target;
    const datos = {
        nombre: form.nombre.value.trim(),
        precio: Number(form.precio.value),
        stock: Number.parseInt(form.stock.value, 10),
        categoria: form.categoria.value,
        estado: form.estado.value,
        imagen: form.imagen.value.trim()
    };

    try {
        const result = await persistirProducto(datos, tipo);

        alert(result.message);
        document.getElementById('producto-modal').style.display = 'none';
        cargarProductos();
    } catch (err) {
        console.error('Error:', err);
        alert('Error: ' + err.message);
    }
}

async function persistirProducto(datos, tipo) {
    try {
        const url = tipo === 'agregar'
            ? `${API_URL}/api/productos`
            : `${API_URL}/api/productos/${productoEnEdicion.id}`;
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

// ─────────────────────────────────────────────────────────────
// sales.js — Gestión de pedidos, estadísticas y exportación
// ─────────────────────────────────────────────────────────────

async function cargarPedidos() {
    try {
        pedidos = await obtenerPedidosAdmin();
        renderizarTablaPedidos();
        actualizarEstadisticasPedidos();
    } catch (err) {
        console.error('Error al cargar pedidos:', err);
    }
}

async function obtenerPedidosAdmin() {
    try {
        const response = await fetch(`${API_URL}/api/pedidos`);
        if (!response.ok) throw new Error('Backend no disponible');
        return await response.json();
    } catch (backendError) {
        if (!supabaseDb) throw backendError;
        const { data, error } = await supabaseDb.from('pedidos').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }
}

function renderizarTablaPedidos() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (pedidos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No hay pedidos registrados.</div></td></tr>`;
        return;
    }

    pedidos.forEach(p => {
        const status = p.status || 'pendiente';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${p.id}</strong><br><small>${new Date(p.created_at).toLocaleString()}</small></td>
            <td>${p.cliente_email}</td>
            <td><small>${p.direccion || '-'}</small></td>
            <td>${formatPrice(p.total)}</td>
            <td>${p.delivery === 'delivery' ? 'Domicilio' : 'Recoger'}</td>
            <td><span class="badge ${orderStatusClasses[status]}">${orderStatusMap[status]}</span></td>
            <td>
                <div class="actions">
                    <button class="action-btn" title="Ver detalle" onclick="verDetallePedido('${p.id}')">👁️</button>
                    <select class="status-select" onchange="cambiarEstadoPedido('${p.id}', this.value)">
                        ${Object.keys(orderStatusMap).map(k => `<option value="${k}" ${k === status ? 'selected' : ''}>${orderStatusMap[k]}</option>`).join('')}
                    </select>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function verDetallePedido(id) {
    const p = pedidos.find(item => String(item.id) === String(id));
    if (!p) return;

    const modal = document.getElementById('order-detail-modal');
    const content = document.getElementById('order-detail-content');
    
    content.innerHTML = `
        <div class="detail-section">
            <h3>Información del Cliente</h3>
            <div class="detail-info-grid">
                <div class="info-item">
                    <label>Email</label>
                    <p>${p.cliente_email}</p>
                </div>
                <div class="info-item">
                    <label>Método</label>
                    <p>${p.delivery === 'delivery' ? 'Domicilio 🚚' : 'Recoger en tienda 🏪'}</p>
                </div>
                <div class="info-item" style="grid-column: span 2">
                    <label>Dirección de entrega</label>
                    <p>${p.direccion || 'No especificada'}</p>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Productos Solicitados</h3>
            <div class="order-items-list">
                ${(p.items || []).map(item => `
                    <div class="order-item-row">
                        <div class="order-item-info">
                            <span class="order-item-qty">${item.quantity}x</span>
                            <span class="order-item-name">${item.title}</span>
                        </div>
                        <span class="order-item-price">${formatPrice(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total-summary">
                Total del Pedido: <strong>${formatPrice(p.total)}</strong>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function filtrarPedidos(termino) {
    const query = termino.toLowerCase();
    const rows = document.querySelectorAll('#orders-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

async function cambiarEstadoPedido(id, nuevoEstado) {
    try {
        await fetch(`${API_URL}/api/pedidos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nuevoEstado })
        });
        showToast('Estado actualizado');
        cargarPedidos();
    } catch (err) { console.error(err); }
}

function actualizarEstadisticasPedidos() {
    const pendientes = pedidos.filter(p => p.status === 'pendiente').length;
    const camino = pedidos.filter(p => p.status === 'en_camino').length;
    const completados = pedidos.filter(p => p.status === 'entregado').length;

    document.getElementById('pedidos-pendientes').textContent = pendientes;
    document.getElementById('pedidos-camino').textContent = camino;
    document.getElementById('pedidos-completados').textContent = completados;

    // Dashboard Stats
    const hoy = new Date().toLocaleDateString();
    const deHoy = pedidos.filter(p => new Date(p.created_at).toLocaleDateString() === hoy);
    const ingresos = deHoy.reduce((s, p) => s + (Number(p.total) || 0), 0);

    const ingresosEl = document.getElementById('ingresos-dia');
    const hoyCountEl = document.getElementById('pedidos-hoy');
    if (ingresosEl) ingresosEl.textContent = formatPrice(ingresos);
    if (hoyCountEl) hoyCountEl.textContent = deHoy.length;
}

function exportarPedidosAExcel() {
    if (pedidos.length === 0) return alert('No hay datos');
    let csv = "ID;Fecha;Cliente;Direccion;Total;Metodo;Estado;Items\n";
    pedidos.forEach(p => {
        const items = p.items ? p.items.map(i => `${i.quantity}x ${i.title}`).join(' | ') : '';
        csv += `${p.id};${new Date(p.created_at).toLocaleString()};${p.cliente_email};${p.direccion || ''};${p.total};${p.delivery};${p.status};"${items}"\n`;
    });
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_${new Date().toLocaleDateString().replace(/\//g,'-')}.csv`;
    link.click();
}

async function limpiarPedidos() {
    openConfirmModal({
        title: '⚠️ Atención',
        text: '¿Seguro que quieres limpiar todos los pedidos? Esta acción no se puede deshacer.',
        confirmText: 'Sí, continuar',
        danger: true,
        onConfirm: () => {
            setTimeout(() => {
                openConfirmModal({
                    title: '🧐 Verificación',
                    text: '¿Ya exportaste los datos? Es recomendable hacerlo antes de borrar.',
                    confirmText: 'Sí, ya exporté',
                    onConfirm: async () => {
                        await fetch(`${API_URL}/api/pedidos/all`, { method: 'DELETE' });
                        showToast('Historial limpiado');
                        cargarPedidos();
                    }
                });
            }, 300);
        }
    });
}

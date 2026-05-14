// ─────────────────────────────────────────────────────────────
// checkout.js — Proceso de pago y envío a WhatsApp
// ─────────────────────────────────────────────────────────────

async function procesarCompra() {
    const token    = sessionStorage.getItem('cucu_token');
    const userData = sessionStorage.getItem('cucu_user');

    if (!token || !userData) {
        showToast('Debes iniciar sesión para poder comprar.', 'error');
        window.location.href = '/login/login.html';
        return;
    }

    const user         = JSON.parse(userData);
    const addressInput = document.getElementById('order-address');
    const direccion    = addressInput ? addressInput.value.trim() : '';

    if (!direccion) {
        showToast('Por favor, ingresa una dirección de entrega.', 'error');
        if (addressInput) addressInput.focus();
        return;
    }

    const subtotal    = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total       = subtotal + DELIVERY_COST;

    const orderPayload = {
        cliente_id:    user.id,
        cliente_email: user.email,
        direccion,
        items: cart.map(item => ({
            id:       item.id,
            title:    item.title,
            price:    item.price,
            quantity: item.quantity,
            image:    item.image
        })),
        subtotal,
        shipping_cost: DELIVERY_COST,
        total,
        delivery: 'delivery',
        status:   'pendiente',
        created_at: new Date().toISOString()
    };

    // Intentar guardar en backend Express
    try {
        const response = await fetch(`${API_URL}/api/pedidos`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(orderPayload)
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Error al generar el pedido');

        onPedidoExitoso(orderPayload);
        return;
    } catch (backendError) {
        console.warn('Backend no disponible, usando Supabase directo:', backendError.message);
    }

    // Fallback: guardar directamente en Supabase
    if (!supabaseDb) {
        showToast('No se pudo completar la compra. Intenta de nuevo.', 'error');
        return;
    }

    const { error } = await supabaseDb
        .from('pedidos')
        .insert([orderPayload]);

    if (error) {
        console.error(error);
        showToast('No se pudo completar la compra.', 'error');
        return;
    }

    onPedidoExitoso(orderPayload);
}

function onPedidoExitoso(orderPayload) {
    showToast('¡Pedido realizado! Redirigiendo a WhatsApp...', 'success');
    enviarAWhatsApp(orderPayload);

    cart = [];
    updateCartUI();
    cerrarCarrito();
}

// ─── Construir y abrir mensaje de WhatsApp ───────────────────
function enviarAWhatsApp(order) {
    const formatCOP = (n) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

    let message = `*NUEVO PEDIDO — EL CUCU* 🛒\n\n`;
    message += `👤 *Cliente:* ${order.cliente_email}\n`;
    message += `🚚 *Entrega:* Domicilio\n`;
    message += `📍 *Dirección:* ${order.direccion}\n`;
    message += `──────────────────\n`;

    order.items.forEach(item => {
        message += `• ${item.quantity}x ${item.title} — ${formatCOP(item.price * item.quantity)}\n`;
    });

    message += `──────────────────\n`;
    message += `📦 Subtotal: ${formatCOP(order.subtotal)}\n`;
    message += `🛵 Envío:    ${formatCOP(order.shipping_cost)}\n`;
    message += `💰 *TOTAL: ${formatCOP(order.total)}*`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

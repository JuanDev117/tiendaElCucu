// ─────────────────────────────────────────────────────────────
// carrito.js — Estado del carrito, UI y eventos de apertura
// ─────────────────────────────────────────────────────────────

// ─── Elementos del DOM ───────────────────────────────────────
const cartCountElement    = document.querySelector('.cart-count');
const cartOverlay         = document.getElementById('cart-overlay');
const cartModal           = document.getElementById('cart-modal');
const cartBtn             = document.querySelector('.cart-btn');
const closeCartBtn        = document.getElementById('close-cart');
const cartItemsContainer  = document.getElementById('cart-items-container');
const cartEmptyState      = document.getElementById('cart-empty-state');
const cartOptions         = document.getElementById('cart-options');
const subtotalElement     = document.getElementById('subtotal');
const shippingCostElement = document.getElementById('shipping-cost');
const totalPriceElement   = document.getElementById('total-price');
const checkoutBtn         = document.getElementById('checkout-btn');

// ─── Utilidad ────────────────────────────────────────────────
const formatPrice = (price) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

// ─── Agregar al carrito ──────────────────────────────────────
async function agregarAlCarrito(e) {
    e.preventDefault();
    e.stopPropagation();

    const session = sessionStorage.getItem('cucu_token');
    if (!session) {
        showToast('Debes iniciar sesión para poder comprar.', 'error');
        window.location.href = '/login/login.html';
        return;
    }

    const button = e.target.closest('.add-to-cart');
    const productoId = button.dataset.productoId;
    const producto = productos.find(p => p.id == productoId);

    if (!producto) {
        showToast('Producto no encontrado', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === producto.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: producto.id,
            title: producto.nombre,
            price: parseInt(producto.precio),
            image: producto.imagen || '',
            quantity: 1
        });
    }

    updateCartUI();
    showToast(`"${producto.nombre}" agregado al carrito`);

    // Feedback visual en el botón
    const originalHTML = button.innerHTML;
    button.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    button.style.background = 'var(--green-primary)';
    button.style.color = '#000';
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.background = '';
        button.style.color = '';
    }, 1000);
}

// ─── Actualizar UI del carrito ───────────────────────────────
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    cartCountElement.style.transform = 'scale(1.5)';
    setTimeout(() => cartCountElement.style.transform = 'scale(1)', 200);

    if (cart.length === 0) {
        cartEmptyState.style.display = 'flex';
        cartOptions.style.display = 'none';
        cartItemsContainer.innerHTML = '';
    } else {
        cartEmptyState.style.display = 'none';
        cartOptions.style.display = 'block';

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.title}" class="cart-item-img" onerror="this.style.display='none'">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <span class="cart-item-price">${formatPrice(item.price)}</span>
                    <div class="cart-item-controls">
                        <button class="qty-btn minus" onclick="updateQuantity('${item.id}', -1)">−</button>
                        <span class="item-qty">${item.quantity}</span>
                        <button class="qty-btn plus" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')" aria-label="Eliminar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `).join('');
    }

    calculateTotals();
}

// ─── Cantidad y eliminar (expuestas globalmente para el HTML inline) ─────────
window.updateQuantity = (id, change) => {
    const item = cart.find(item => String(item.id) === String(id));
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) removeFromCart(id);
        else updateCartUI();
    }
};

window.removeFromCart = (id) => {
    cart = cart.filter(item => String(item.id) !== String(id));
    updateCartUI();
};

// ─── Calcular totales ────────────────────────────────────────
function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + DELIVERY_COST;

    subtotalElement.textContent = formatPrice(subtotal);
    shippingCostElement.textContent = formatPrice(DELIVERY_COST);
    totalPriceElement.textContent = formatPrice(total);
}

// ─── Eventos apertura/cierre del modal ──────────────────────
function setupCartEvents() {
    cartBtn.addEventListener('click', () => {
        cartOverlay.classList.add('active');
        cartModal.classList.add('active');
    });

    closeCartBtn.addEventListener('click', cerrarCarrito);
    cartOverlay.addEventListener('click', cerrarCarrito);

    checkoutBtn.addEventListener('click', async () => {
        if (cart.length === 0) return;
        await procesarCompra();
    });
}

function cerrarCarrito() {
    cartOverlay.classList.remove('active');
    cartModal.classList.remove('active');
}

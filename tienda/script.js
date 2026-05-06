// ─── Config backend ──────────────────────────────────────────
const API_URL = 'http://localhost:3001';

// Funcionalidad del carrito de compras
let cart = [];
const deliveryCost = 3000;

// Elementos del DOM
const cartCountElement = document.querySelector('.cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartOverlay = document.getElementById('cart-overlay');
const cartModal = document.getElementById('cart-modal');
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartEmptyState = document.getElementById('cart-empty-state');
const cartOptions = document.getElementById('cart-options');
const subtotalElement = document.getElementById('subtotal');
const shippingCostElement = document.getElementById('shipping-cost');
const totalPriceElement = document.getElementById('total-price');
const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
const checkoutBtn = document.getElementById('checkout-btn');

// Utilidad para formatear moneda
const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
};

// Agregar al carrito
addToCartButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Evita que se dispare el evento del hover en la tarjeta si lo hubiera

        // Verificar si el usuario está autenticado (sessionStorage)
        const session = sessionStorage.getItem('cucu_token');
        
        if (!session) {
            alert("Debes iniciar sesión para poder comprar.");
            window.location.href = '/login/login.html';
            return;
        }

        // Obtener detalles del producto desde la tarjeta
        const productCard = e.target.closest('.product-card');
        const title = productCard.querySelector('.product-name').textContent;
        const priceText = productCard.querySelector('.product-price').textContent;
        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
        const image = productCard.querySelector('img').src;
        const id = title.replace(/\s+/g, '-').toLowerCase();

        // Verificar si ya existe en el carrito
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, title, price, image, quantity: 1 });
        }

        updateCartUI();

        // Feedback visual en el botón
        const originalHTML = button.innerHTML;
        button.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        button.style.background = 'var(--green-primary)';
        button.style.color = '#000';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
            button.style.color = '';
        }, 1000);
    });
});

// Actualizar UI del carrito
function updateCartUI() {
    // Actualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    
    // Animación pop contador
    cartCountElement.style.transform = 'scale(1.5)';
    setTimeout(() => cartCountElement.style.transform = 'scale(1)', 200);

    // Renderizar items
    if (cart.length === 0) {
        cartEmptyState.style.display = 'flex';
        cartOptions.style.display = 'none';
        cartItemsContainer.innerHTML = '';
    } else {
        cartEmptyState.style.display = 'none';
        cartOptions.style.display = 'block';
        
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <span class="cart-item-price">${formatPrice(item.price)}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn minus" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="item-qty">${item.quantity}</span>
                    <button class="qty-btn plus" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')" aria-label="Eliminar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg>
                </button>
            </div>
        `).join('');
    }

    calculateTotals();
}

// Funciones globales para el HTML renderizado dinámicamente
window.updateQuantity = (id, change) => {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
        }
    }
};

window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
};

// Calcular totales
function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Revisar opción de envío
    const isDelivery = document.querySelector('input[name="delivery"]:checked').value === 'delivery';
    const currentShippingCost = isDelivery ? deliveryCost : 0;
    
    const total = subtotal + currentShippingCost;

    subtotalElement.textContent = formatPrice(subtotal);
    shippingCostElement.textContent = isDelivery ? formatPrice(currentShippingCost) : 'Gratis';
    totalPriceElement.textContent = formatPrice(total);
}

// Eventos de envío
deliveryRadios.forEach(radio => {
    radio.addEventListener('change', calculateTotals);
});

// Abrir / Cerrar Carrito
cartBtn.addEventListener('click', () => {
    cartOverlay.classList.add('active');
    cartModal.classList.add('active');
});

closeCartBtn.addEventListener('click', () => {
    cartOverlay.classList.remove('active');
    cartModal.classList.remove('active');
});

cartOverlay.addEventListener('click', () => {
    cartOverlay.classList.remove('active');
    cartModal.classList.remove('active');
});

checkoutBtn.addEventListener('click', () => {
    if(cart.length === 0) return;
    alert('Funcionalidad de pago pendiente de integrar.');
});

// Efecto de navbar al hacer scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(0, 0, 0, 0.8)';
        navbar.style.borderBottom = '1px solid rgba(34, 197, 94, 0.2)';
    } else {
        navbar.style.background = 'rgba(0, 0, 0, 0.6)';
        navbar.style.borderBottom = '1px solid var(--border-color)';
    }
});

// ---- Gestión de sesión en el navbar ----
const btnIngresar = document.getElementById('btn-ingresar');
const btnRegistrarse = document.getElementById('btn-registrarse');
const userMenu = document.getElementById('user-menu');
const userEmailSpan = document.getElementById('user-email');
const btnLogout = document.getElementById('btn-logout');

function actualizarNavbar() {
    const token = sessionStorage.getItem('cucu_token');
    const userData = sessionStorage.getItem('cucu_user');
    
    if (token && userData) {
        const user = JSON.parse(userData);
        // Usuario logueado: ocultar botones y mostrar email + cerrar sesión
        btnIngresar.style.display = 'none';
        btnRegistrarse.style.display = 'none';
        userMenu.style.display = 'flex';
        userEmailSpan.textContent = user.email;
    } else {
        // Sin sesión: mostrar botones normales
        btnIngresar.style.display = '';
        btnRegistrarse.style.display = '';
        userMenu.style.display = 'none';
    }
}

// Ejecutar al cargar la página
actualizarNavbar();

// Botón de cerrar sesión
btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem('cucu_token');
    sessionStorage.removeItem('cucu_user');
    sessionStorage.removeItem('cucu_is_admin');
    window.location.reload();
});

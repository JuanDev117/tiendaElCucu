// ─── Config backend ──────────────────────────────────────────
const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? `http://127.0.0.1:3001`
    : '';
const supabaseDb = window.cucuSupabaseClient;

// Funcionalidad del carrito de compras
let cart = [];
let productos = [];
let categoriaSeleccionada = 'todas';
const deliveryCost = 3000;

// Elementos del DOM
const cartCountElement = document.querySelector('.cart-count');
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
const destacadosGrid = document.getElementById('destacados-grid');
const categoryResultsGrid = document.getElementById('category-results-grid');

// ─── Cargar productos al iniciar ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    setupCategoryFilters();
    actualizarNavbar();
    setupSmoothScrolling(); // Nueva función para el scroll suave
    setupMobileMenu(); // Funcionalidad para el menú móvil
});

// ─── Cargar productos del backend ────────────────────────
async function cargarProductos() {
    try {
        productos = await obtenerProductosActivos();
        renderizarDestacados();
        renderizarProductos();
        setupAddToCartButtons();
    } catch (err) {
        console.error('Error al cargar productos:', err);
        // Si hay error, mantener los productos del HTML estático
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

// ─── Renderizar destacados (Simulando más vendidos) ────────
function renderizarDestacados() {
    if (!destacadosGrid) return;
    
    // Como aún no tenemos columna de "ventas", mostraremos los 4 primeros
    const destacados = productos.slice(0, 4);

    destacadosGrid.innerHTML = destacados.map(producto => `
        <div class="product-card">
            <div class="product-image-placeholder">
                ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}">` : '<div style="width:100%; height:200px; background:var(--bg-secondary);"></div>'}
            </div>
            <div class="product-info">
                <span class="product-category">${producto.categoria}</span>
                <h3 class="product-name">${producto.nombre}</h3>
                <div class="product-bottom">
                    <span class="product-price">$${parseInt(producto.precio).toLocaleString('es-CO')}</span>
                    <button class="add-to-cart" data-producto-id="${producto.id}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ─── Renderizar grid de productos ────────────────────────
function renderizarProductos() {
    let productosAMostrar = productos;

    // Filtrar por categoría (insensible a mayúsculas, minúsculas y espacios)
    const filtro = categoriaSeleccionada ? categoriaSeleccionada.toLowerCase().trim() : 'todas';

    if (filtro !== 'todas') {
        productosAMostrar = productos.filter(p =>
            p.categoria && p.categoria.toLowerCase().trim() === filtro
        );
    }

    if (productosAMostrar.length === 0) {
        console.warn('No hay productos en esta categoría');
        categoryResultsGrid.innerHTML = `
            <div class="empty-products" style="grid-column: 1 / -1;">
                No hay productos disponibles en esta categoría.
            </div>
        `;
        return;
    }

    categoryResultsGrid.innerHTML = productosAMostrar.map(producto => `
        <div class="product-card" data-producto-id="${producto.id}">
            <div class="product-image-placeholder">
                ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}">` : '<div style="width:100%; height:200px; background:var(--bg-secondary);"></div>'}
            </div>
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
    `).join('');
    
    setupAddToCartButtons();
}

// ─── Setup botones agregar al carrito ────────────────────
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', agregarAlCarrito);
    });
}

// ─── Setup filtros de categoría ──────────────────────────
function setupCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover clase active de todos
            categoryBtns.forEach(b => b.classList.remove('active'));
            
            // Agregar clase active al clickeado
            btn.classList.add('active');
            
            // Actualizar categoría seleccionada
            // Si el atributo data-category no existe, por defecto es 'todas'
            categoriaSeleccionada = btn.getAttribute('data-category') || 'todas';

            console.log(`Filtrando por: ${categoriaSeleccionada}`);
            
            // Renderizar productos filtrados
            renderizarProductos();
            

        });
    });
}

// ─── Configurar scroll suave para enlaces del navbar ───────
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Previene el salto instantáneo

            const targetId = this.getAttribute('href'); // Obtiene el ID del destino (ej. #productos)
            let targetElement;

            if (targetId === '#contacto') {
                targetElement = document.querySelector('footer'); // Si es contacto, ve al footer
            } else {
                targetElement = document.querySelector(targetId); // Si no, busca el ID normal
            }

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' }); // Realiza el scroll suave
            }
        });
    });
}

// ─── Configurar menú móvil ────────────────────────────────
function setupMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const navActions = document.getElementById('nav-actions');

    if (toggle) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navActions.classList.toggle('active');
            
            // Cambiar icono de hamburguesa a X (opcional si se desea mejorar el feedback)
            const isActive = navLinks.classList.contains('active');
            toggle.style.color = isActive ? 'var(--green-primary)' : 'inherit';
        });

        // Cerrar menú al hacer click en cualquier enlace (mejor UX en móvil)
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navActions.classList.remove('active');
                toggle.style.color = 'inherit';
            });
        });
    }
}

// ─── Agregar al carrito ──────────────────────────────────
async function agregarAlCarrito(e) {
    e.preventDefault();
    e.stopPropagation();

    // Verificar si el usuario está autenticado
    const session = sessionStorage.getItem('cucu_token');
    
    if (!session) {
        alert("Debes iniciar sesión para poder comprar.");
        window.location.href = '/login/login.html';
        return;
    }

    const button = e.target.closest('.add-to-cart');
    const productoId = button.dataset.productoId;
    const producto = productos.find(p => p.id == productoId);

    if (!producto) {
        alert('Producto no encontrado');
        return;
    }

    // Verificar si ya existe en el carrito
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
}

// Utilidad para formatear moneda
const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
};

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
    const item = cart.find(item => String(item.id) === String(id));
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
    cart = cart.filter(item => String(item.id) !== String(id));
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

checkoutBtn.addEventListener('click', async () => {
    if (cart.length === 0) return;
    await procesarCompra();
});

async function procesarCompra() {
    const token = sessionStorage.getItem('cucu_token');
    const userData = sessionStorage.getItem('cucu_user');

    if (!token || !userData) {
        alert('Debes iniciar sesión para poder comprar.');
        window.location.href = '/login/login.html';
        return;
    }

    const user = JSON.parse(userData);
    const isDelivery = document.querySelector('input[name="delivery"]:checked').value === 'delivery';
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = isDelivery ? deliveryCost : 0;
    const total = subtotal + shippingCost;

    const orderPayload = {
        cliente_id: user.id,
        cliente_email: user.email,
        items: cart.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        })),
        subtotal,
        shipping_cost: shippingCost,
        total,
        delivery: isDelivery ? 'delivery' : 'recoger',
        status: 'pendiente',
        created_at: new Date().toISOString()
    };

    try {
        const response = await fetch(`${API_URL}/api/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al generar el pedido');
        }

        alert('Pedido realizado con éxito.');
        cart = [];
        updateCartUI();
        cartOverlay.classList.remove('active');
        cartModal.classList.remove('active');
    } catch (backendError) {
        if (!supabaseDb) {
            console.error(backendError);
            alert('No se pudo completar la compra.');
            return;
        }

        const { data, error } = await supabaseDb
            .from('pedidos')
            .insert([orderPayload])
            .select()
            .single();

        if (error) {
            console.error(error);
            alert('No se pudo completar la compra.');
            return;
        }

        alert('Pedido realizado con éxito.');
        cart = [];
        updateCartUI();
        cartOverlay.classList.remove('active');
        cartModal.classList.remove('active');
    }
}

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

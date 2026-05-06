// Funcionalidad básica del carrito
let cartCount = 0;
const cartCountElement = document.querySelector('.cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart');

addToCartButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Evita que se dispare el evento del hover en la tarjeta si lo hubiera

        // Verificar si el usuario está autenticado en Supabase
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (!session) {
            alert("Debes iniciar sesión para poder comprar.");
            // Después
          window.location.href = '/login';
          
            return;
        }

        cartCount++;
        cartCountElement.textContent = cartCount;
        
        // Animación simple de pop para el contador
        cartCountElement.style.transform = 'scale(1.5)';
        setTimeout(() => {
            cartCountElement.style.transform = 'scale(1)';
        }, 200);

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

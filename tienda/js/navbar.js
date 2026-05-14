// ─────────────────────────────────────────────────────────────
// navbar.js — Sesión de usuario, scroll y menú móvil
// ─────────────────────────────────────────────────────────────

// ─── Efecto scroll en navbar ─────────────────────────────────
function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 0, 0, 0.85)';
            navbar.style.borderBottom = '1px solid rgba(34, 197, 94, 0.2)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.6)';
            navbar.style.borderBottom = '1px solid var(--border-color)';
        }
    });
}

// ─── Scroll suave para enlaces internos ──────────────────────
function setupSmoothScrolling() {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = targetId === '#contacto'
                ? document.querySelector('footer')
                : document.querySelector(targetId);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// ─── Menú hamburguesa en móvil ───────────────────────────────
function setupMobileMenu() {
    const toggle     = document.getElementById('mobile-menu-toggle');
    const navLinks   = document.getElementById('nav-links');
    const navActions = document.getElementById('nav-actions');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navActions.classList.toggle('active');
        toggle.style.color = navLinks.classList.contains('active')
            ? 'var(--green-primary)'
            : 'inherit';
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navActions.classList.remove('active');
            toggle.style.color = 'inherit';
        });
    });
}

// ─── Estado de sesión en navbar ──────────────────────────────
function actualizarNavbar() {
    const token      = sessionStorage.getItem('cucu_token');
    const userData   = sessionStorage.getItem('cucu_user');
    const btnIngresar    = document.getElementById('btn-ingresar');
    const btnRegistrarse = document.getElementById('btn-registrarse');
    const userMenu       = document.getElementById('user-menu');
    const userEmailSpan  = document.getElementById('user-email');

    if (token && userData) {
        const user = JSON.parse(userData);
        if (btnIngresar)    btnIngresar.style.display = 'none';
        if (btnRegistrarse) btnRegistrarse.style.display = 'none';
        if (userMenu)       userMenu.style.display = 'flex';
        if (userEmailSpan)  userEmailSpan.textContent = user.email;
    } else {
        if (btnIngresar)    btnIngresar.style.display = '';
        if (btnRegistrarse) btnRegistrarse.style.display = '';
        if (userMenu)       userMenu.style.display = 'none';
    }
}

// ─── Cerrar sesión ────────────────────────────────────────────
function setupLogout() {
    const btnLogout = document.getElementById('btn-logout');
    if (!btnLogout) return;

    btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('cucu_token');
        sessionStorage.removeItem('cucu_user');
        sessionStorage.removeItem('cucu_is_admin');
        window.location.reload();
    });
}

// ─── Configuración del servidor backend ───────────────────────
// Cuando corras localmente, apunta a localhost:3001.
// En producción cambia esta URL a la de tu servidor desplegado.
const API_URL = 'http://localhost:3001';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error');
    const btn = document.querySelector('.login-btn');
    
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Conectando...';
    btn.style.opacity = '0.8';
    btn.disabled = true;
    errorMsg.textContent = '';

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al iniciar sesión.');
        }

        // Guardar token y datos de usuario en sessionStorage
        sessionStorage.setItem('cucu_token', result.access_token);
        sessionStorage.setItem('cucu_user', JSON.stringify(result.user));
        sessionStorage.setItem('cucu_is_admin', result.isAdmin);

        // Redirigir según el rol
        if (result.isAdmin) {
            window.location.href = '../admin/admin.html';
        } else {
            window.location.href = '../tienda/index.html';
        }

    } catch (err) {
        errorMsg.textContent = err.message;
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
        btn.disabled = false;
    }
});

// Lógica para el ojito de contraseña
const togglePasswordBtn = document.querySelector('.toggle-password');
if (togglePasswordBtn) {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.eye-icon');
    const eyeOffIcon = document.querySelector('.eye-off-icon');

    togglePasswordBtn.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.style.display = 'none';
            eyeOffIcon.style.display = 'block';
        } else {
            passwordInput.type = 'password';
            eyeIcon.style.display = 'block';
            eyeOffIcon.style.display = 'none';
        }
    });
}
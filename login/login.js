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
    errorMsg.textContent = ''; // Limpiar errores anteriores

    // Usar el cliente centralizado
    const { data, error } = await supabaseClient.auth.signInWithPassword({ 
        email, 
        password 
    });

    if (error) {
        errorMsg.textContent = 'Error al entrar: ' + error.message;
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
        btn.disabled = false;
        return;
    }

    // Redirigir según el rol
    if (email === ADMIN_EMAIL) {
        window.location.href = '../admin/admin.html';
    } else {
        window.location.href = '../tienda/index.html';
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
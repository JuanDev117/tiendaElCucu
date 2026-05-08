// ─── Configuración del servidor backend ───────────────────────
const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? `http://${window.location.hostname}:3001`
    : '';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    
    const errorMsg = document.getElementById('error');
    const successMsg = document.getElementById('success');
    const btn = document.querySelector('.login-btn');
    
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Creando cuenta...';
    btn.style.opacity = '0.8';
    btn.disabled = true;
    errorMsg.textContent = ''; 
    successMsg.textContent = '';

    try {
        const response = await fetch(`${API_URL}/api/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al registrar el usuario.');
        }

        // Registro exitoso
        btn.innerHTML = '¡Cuenta Creada!';
        btn.style.background = 'var(--green-primary)';
        btn.style.color = '#000';
        successMsg.textContent = 'Registro exitoso. Redirigiendo a la tienda...';
        
        // Guardar usuario en sessionStorage
        sessionStorage.setItem('cucu_user', JSON.stringify(result.user));
        sessionStorage.setItem('cucu_token', result.access_token);

        setTimeout(() => {
            window.location.href = `http://${window.location.hostname}:3000/tienda/index.html`;
        }, 2000);

    } catch (err) {
        errorMsg.textContent = err.message;
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
        btn.disabled = false;
    }
});

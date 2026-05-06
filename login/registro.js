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

    // Llamada a Supabase para registrar usuario (signUp)
    const { data, error } = await supabaseClient.auth.signUp({ 
        email, 
        password,
        options: {
            data: {
                full_name: name
            }
        }
    });

    if (error) {
        errorMsg.textContent = 'Error al registrar: ' + error.message;
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
        btn.disabled = false;
        return;
    }

    // Registro exitoso
    btn.innerHTML = '¡Cuenta Creada!';
    btn.style.background = 'var(--green-primary)';
    btn.style.color = '#000';
    successMsg.textContent = 'Registro exitoso. Redirigiendo a la tienda...';
    
    // Al registrar, redirigimos directamente a la tienda 
    setTimeout(() => {
        window.location.href = '../tienda/index.html';
    }, 2000);
});

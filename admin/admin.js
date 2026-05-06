// admin.js - Interactividad para el panel de administración

document.addEventListener('DOMContentLoaded', () => {
    // Lógica para seleccionar elementos del menú lateral
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Simulación del botón "Añadir Producto"
    const addBtn = document.querySelector('.add-btn');
    addBtn.addEventListener('click', () => {
        const originalText = addBtn.innerHTML;
        addBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Procesando...';
        addBtn.style.background = 'var(--green-glow-strong)';
        
        setTimeout(() => {
            addBtn.innerHTML = originalText;
            addBtn.style.background = '';
            // Aquí iría la lógica para abrir un modal de creación
        }, 1000);
    });

    // Simulación de los botones Editar y Eliminar de la tabla
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tr = btn.closest('tr');
            const productName = tr.querySelector('.td-product span').textContent;

            if (btn.classList.contains('delete')) {
                const confirmed = confirm(`¿Estás seguro de que deseas eliminar el producto: ${productName}?`);
                if (confirmed) {
                    tr.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    tr.style.opacity = '0';
                    tr.style.transform = 'translateX(20px)';
                    setTimeout(() => {
                        tr.remove();
                    }, 300);
                }
            } else if (btn.classList.contains('edit')) {
                // Feedback visual de edición
                const originalColor = btn.style.color;
                btn.style.color = 'var(--green-primary)';
                setTimeout(() => {
                    btn.style.color = originalColor;
                    alert(`Abriendo panel de edición para: ${productName}`);
                }, 200);
            }
        });
    });
});

# Tienda El Cucu - E-commerce Premium

Este proyecto es una aplicación web e-commerce ("Tienda de Barrio Premium") construida con **HTML, CSS y Vanilla JS**.

## 🎨 Arquitectura y Estética

- **Diseño**: Inspirado en el estilo Vercel, muy moderno y premium.
- **Colores**: Fondo negro puro (`#000000`), acentos en tonos verde neón/esmeralda y texto de alto contraste.
- **Efectos Visuales**: 
  - Glassmorphism (desenfoques tipo cristal).
  - Resplandores (glows) detrás de contenedores.
  - Bordes sutiles y microanimaciones suaves en hover.
- **Elementos Gráficos**: Recuadros verdes interactivos para los placeholders de las fotos de los productos.

## 📂 Estructura de Archivos y Rutas

El proyecto está dividido en tres vistas principales y un archivo de configuración raíz:

### Configuración Global
- `supabase-config.js`: Archivo central donde se inicializa la conexión con Supabase. Contiene las variables para la `URL`, la `anon_key` y el `ADMIN_EMAIL`.

### Vistas
- **`/tienda/` (Pública)**
  - `index.html`: La vista pública del cliente. Contiene la sección Hero, el grid de productos y las categorías.
  - `style.css`: Archivo base de variables de color, tipografía (Inter) y estilos compartidos para toda la aplicación.
  - `script.js`: Lógica pública, incluyendo el control del botón del carrito y el efecto transparente del menú de navegación (navbar) al hacer scroll.

- **`/login/` (Autenticación)**
  - `login.html`: Vista de inicio de sesión con formulario para email y contraseña.
  - `login.css`: Estilos específicos para centrar la tarjeta de login, aplicar glassmorphism y estilizar los inputs.
  - `login.js`: Lógica que consume *Supabase Auth*. Si el login es exitoso, verifica el correo: si coincide con `ADMIN_EMAIL` redirige a `/admin/admin.html`, de lo contrario redirige a `/tienda/index.html`.

- **`/admin/` (Privada / Dashboard)**
  - `admin.html`: Panel de control exclusivo. Tiene un menú lateral (Sidebar) y una tabla de inventario.
  - `admin.css`: Estilos específicos del layout administrativo (sidebar fijo, tarjetas de métricas, tabla de datos).
  - `admin.js`: Incluye un **Guardián de Ruta (Auth Guard)**. Al cargar la página, verifica la sesión mediante `supabaseClient.auth.getSession()`. Si no hay sesión o no es el administrador, expulsa al usuario hacia la vista de login.

## 🔐 Flujo de Usuarios (Supabase Auth)

1. **Clientes Normales**: Para que un usuario pueda realizar compras en la tienda, deberá iniciar sesión (esta lógica bloquea las funciones de carrito para usuarios anónimos).
2. **Administrador**: Ingresa por la misma vista de login y es redirigido automáticamente a su panel gracias a la validación de rol basada en su email.
3. **Protección**: El panel de administrador está protegido vía Javascript para evitar el acceso directo por URL sin una sesión válida de administrador en Supabase.

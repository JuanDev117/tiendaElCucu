# Tienda El Cucu - E-commerce

Sistema e-commerce con frontend en HTML/CSS/JavaScript, backend Node.js + Express y base de datos Supabase. Incluye tienda publica, carrito, login/registro y panel administrador con vistas de dashboard, productos, pedidos y clientes.

---

## Stack

- Frontend: HTML5, CSS3 y JavaScript vanilla
- Backend: Node.js + Express
- Base de datos: Supabase PostgreSQL
- Autenticacion: Supabase Auth mediante el backend
- Hosting: Vercel para frontend, local/Railway/Render/Heroku para backend

---

## Estructura

```txt
e-comerceCucu/
|-- admin/
|   |-- admin.html
|   |-- admin.css
|   `-- admin.js
|-- login/
|   |-- login.html
|   |-- login.js
|   |-- login.css
|   |-- registro.html
|   `-- registro.js
|-- server/
|   |-- server.js
|   |-- package.json
|   `-- package-lock.json
|-- tienda/
|   |-- index.html
|   |-- script.js
|   |-- style.css
|   |-- favicon.svg
|   `-- images/
|-- .env.server
|-- supabase-config.js
|-- vercel.json
`-- README.md
```

---

## Configuracion

### 1. Instalar dependencias del backend

```bash
cd server
npm install
```

### 2. Variables de entorno

Crea `.env.server` en la raiz del proyecto:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_role_key
ADMIN_EMAIL=tu-email-admin@gmail.com
PORT=3001
```

Importante: `.env.server` contiene la service role key. No se debe subir a GitHub.

### 3. Tabla `productos` en Supabase

En Supabase SQL Editor:

```sql
CREATE TABLE productos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre TEXT NOT NULL,
  precio NUMERIC NOT NULL,
  stock INT NOT NULL,
  categoria TEXT NOT NULL,
  estado TEXT DEFAULT 'activo',
  imagen TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Columnas usadas por la app:

- `nombre`: nombre visible del producto
- `precio`: precio en COP
- `stock`: unidades disponibles
- `categoria`: categoria mostrada en tienda/admin
- `estado`: `activo` o `inactivo`
- `imagen`: URL opcional de imagen
- `created_at`: fecha usada para ordenar inventario reciente

---

## Como correr localmente

### Backend

```bash
cd server
npm start
```

El backend queda en:

```txt
http://127.0.0.1:3001
```

### Frontend

Abre el proyecto con Live Server de VS Code o sirve los archivos estaticos. Rutas principales:

- Tienda: `tienda/index.html`
- Admin: `admin/admin.html`
- Login: `login/login.html`
- Registro: `login/registro.html`

---

## Flujo de productos

El panel administrador guarda productos en Supabase y refresca la tabla de inventario reciente en la vista `Productos`.

1. Entra al admin.
2. Haz clic en `Anadir Producto`.
3. Completa nombre, precio, stock, categoria, estado e imagen opcional.
4. Al guardar, el producto se inserta en la tabla `productos`.
5. La vista `Productos` se actualiza con los datos reales.
6. La tienda `index.html` muestra productos con `estado = activo` y `stock > 0`.

Desde Inventario Reciente tambien se puede:

- Editar producto
- Cambiar precio, stock, categoria, estado o imagen
- Eliminar producto
- Refrescar la tabla

---

## Panel administrador

La vista admin vive en `admin/admin.html` y funciona como una sola pantalla con navegacion lateral.

Vistas disponibles:

- `Dashboard`: resumen del negocio, acciones rapidas y estado operativo.
- `Productos`: inventario real conectado a la tabla `productos`.
- `Pedidos`: vista preparada para gestionar pedidos cuando se agregue esa tabla/flujo.
- `Clientes`: vista preparada para listar clientes cuando se agregue esa tabla/flujo.

Desde el sidebar, el boton `Ir a la tienda` manda directamente a:

```txt
/tienda/index.html
```

---

## Conexion a la API y Supabase

Los archivos del frontend usan esta regla:

- En local (`localhost` o `127.0.0.1`) llaman al backend en `http://127.0.0.1:3001`.
- En produccion intentan usar rutas relativas `/api/...`.
- Si el backend no responde, `admin.js` y `tienda/script.js` usan `supabase-config.js` como respaldo desde el navegador.

`supabase-config.js` solo contiene la anon key publica. La service role key debe quedarse siempre en `.env.server`.

---

## Endpoints

### Publicos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/login` | Iniciar sesion |
| POST | `/api/registro` | Registrar usuario |
| POST | `/api/logout` | Cerrar sesion |
| GET | `/api/productos` | Obtener productos activos |
| GET | `/api/health` | Verificar servidor |

### Productos admin

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/productos/admin/all` | Obtener todos los productos |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/:id` | Actualizar producto |
| DELETE | `/api/productos/:id` | Eliminar producto |

---

## Ejemplos

### Crear producto

```js
const response = await fetch('http://127.0.0.1:3001/api/productos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Bebida Energetica',
    precio: 2500,
    stock: 50,
    categoria: 'Bebidas',
    estado: 'activo',
    imagen: 'https://ejemplo.com/imagen.jpg'
  })
});

const data = await response.json();
```

### Obtener productos activos

```js
const response = await fetch('http://127.0.0.1:3001/api/productos');
const productos = await response.json();
```

---

## Funcionalidades

### Tienda

- Carga productos desde Supabase/backend
- Muestra solo productos activos con stock
- Carrito de compras
- Validacion de sesion antes de comprar
- Navbar con usuario logueado

### Admin

- Dashboard con acciones rapidas
- Navegacion entre vistas sin recargar la pagina
- Vista Productos conectada a Supabase
- Vista Pedidos preparada
- Vista Clientes preparada
- Inventario reciente con datos reales de la DB
- Crear productos
- Editar productos
- Eliminar productos
- Estadistica de inventario basada en stock real
- Estados visuales: activo, inactivo, bajo stock y agotado
- Boton `Ir a la tienda` conectado a `tienda/index.html`

### Backend

- CRUD de productos
- Login y registro
- Integracion con Supabase
- CORS para desarrollo local y produccion

---

## Solucion de problemas

### No aparecen productos en la tienda

- Verifica que el producto tenga `estado = activo`.
- Verifica que `stock` sea mayor que `0`.
- Revisa que el backend este corriendo en `http://127.0.0.1:3001`.
- Revisa la consola del navegador.

### No guarda productos

- Verifica que exista la tabla `productos`.
- Revisa las variables de `.env.server`.
- Confirma que `SUPABASE_SERVICE_KEY` sea la service role key.
- Si usas Supabase directo desde navegador, revisa las politicas RLS.

### Error CORS

- Agrega el origen del frontend en la lista `origin` de `server/server.js`.
- Reinicia el backend despues de cambiar CORS.

### Produccion en Vercel

Este repositorio tiene `vercel.json` para rutas estaticas. Si el backend no esta desplegado bajo el mismo dominio, debes configurar la URL real de la API en los JS o desplegar el backend aparte.

---

## Rutas utiles

- `/` -> `tienda/index.html`
- `/tienda` -> `tienda/index.html`
- `/login` -> `login/login.html`
- `/registro` -> `login/registro.html`
- `/admin` -> `admin/admin.html`

---

## Estado actual

- Productos conectados a Supabase
- Inventario reciente editable desde admin
- Vistas admin de Dashboard, Productos, Pedidos y Clientes
- Boton admin `Ir a la tienda` apunta a `tienda/index.html`
- Productos activos visibles en tienda
- Backend local verificado en puerto `3001`

Ultima actualizacion: 6 de mayo de 2026

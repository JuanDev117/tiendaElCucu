const path = require('path');
const dotenv = require('dotenv');
const envPath = path.join(__dirname, '..', '.env.server');
const result = dotenv.config({ path: envPath });
if (result.error) console.error('CRÍTICO: No se pudo cargar .env.server en', envPath);

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CONFIGURACIÓN DE SEGURIDAD Y CONEXIONES ──────────────────────────────────

// Inicialización de Supabase con la Service Role Key (Llave Maestra).
// Se usa en el backend para tener permisos administrativos y saltarse reglas RLS.
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * Configuración de orígenes permitidos (CORS).
 * Si existe la variable ALLOWED_ORIGINS en el .env, la convierte en array.
 * De lo contrario, habilita los puertos de desarrollo local por defecto.
 * 
 * PUERTOS POR VISTA:
 * - http://localhost:3000 → Tienda pública (index.html)
 * - http://127.0.0.1:3000 → Tienda pública con IP local
 * - http://localhost:5500 → Admin (admin.html) - Live Server
 * - http://127.0.0.1:5500 → Admin (admin.html) - Live Server con IP local
 * - http://localhost:3002 → Admin (admin.html) - Live Server (puerto alternativo)
 * - http://127.0.0.1:3002 → Admin (admin.html) - Live Server con IP local
 */
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : [
        'http://localhost:3000', 
        'http://127.0.0.1:3000',
        'http://localhost:5500', 
        'http://127.0.0.1:5500',
        'http://localhost:3002',
        'http://127.0.0.1:3002'
    ];

const corsOptions = {
    origin(origin, callback) {
        // Permite peticiones sin origen (como herramientas de postman o apps móviles)
        // o cualquier petición que venga de localhost/127.0.0.1 para desarrollo.
        if (!origin || 
            allowedOrigins.includes(origin) || 
            origin.includes('localhost') || 
            origin.includes('127.0.0.1')) {
            return callback(null, true);
        }

        console.error(`Acceso denegado por política CORS desde: ${origin}`);
        return callback(null, false); // Rechaza la petición si el origen no es de confianza
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contrasena son obligatorios.' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        const isAdmin = email === process.env.ADMIN_EMAIL;

        return res.status(200).json({
            message: 'Login exitoso',
            user: {
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || ''
            },
            access_token: data.session.access_token,
            isAdmin
        });
    } catch (err) {
        console.error('Error en login:', err);
        return res.status(500).json({ error: 'Error interno del servidor al iniciar sesión' });
    }
});

app.post('/api/registro', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contrasena debe tener al menos 6 caracteres.' });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name }
            }
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (!data.user) {
            throw new Error('No se pudo crear el usuario');
        }

        return res.status(201).json({
            message: 'Registro exitoso',
            user: {
                id: data.user.id,
                email: data.user.email,
                full_name: name
            },
            access_token: data.session?.access_token
        });
    } catch (err) {
        console.error('Error en registro:', err);
        return res.status(500).json({ error: err.message || 'Error interno del servidor al registrar' });
    }
});

app.post('/api/logout', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token no proporcionado.' });
    }

    const userClient = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    const { error } = await userClient.auth.admin.signOut(authHeader.replace('Bearer ', ''));

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Sesion cerrada exitosamente.' });
});

app.get('/api/productos', async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('estado', 'activo')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data || []);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/api/productos/admin/all', async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data || []);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/productos', async (req, res) => {
    const { nombre, precio, stock, categoria, estado, imagen } = req.body;

    if (!nombre || precio === undefined || stock === undefined || !categoria) {
        return res.status(400).json({
            error: 'Los campos nombre, precio, stock y categoria son obligatorios.'
        });
    }

    try {
        const { data, error } = await supabase
            .from('productos')
            .insert([{
                nombre,
                precio: parseFloat(precio),
                stock: parseInt(stock, 10),
                categoria,
                estado: estado || 'activo',
                imagen: imagen || '',
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json({
            message: 'Producto creado exitosamente',
            producto: data[0]
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.put('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock, categoria, estado, imagen } = req.body;

    if (!nombre || precio === undefined || stock === undefined || !categoria) {
        return res.status(400).json({
            error: 'Los campos nombre, precio, stock y categoria son obligatorios.'
        });
    }

    try {
        const { data, error } = await supabase
            .from('productos')
            .update({
                nombre,
                precio: parseFloat(precio),
                stock: parseInt(stock, 10),
                categoria,
                estado: estado || 'activo',
                imagen: imagen || ''
            })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        return res.status(200).json({
            message: 'Producto actualizado exitosamente',
            producto: data[0]
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('productos')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Servidor Cucu corriendo en http://localhost:${PORT}`);
});

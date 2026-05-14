const path = require('path');
const dotenv = require('dotenv');
const envPath = path.join(__dirname, '..', '.env.server');
const result = dotenv.config({ path: envPath });
if (result.error) console.error('CRÍTICO: No se pudo cargar .env.server en', envPath);

const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');//mata el puerto antes de inciarlo 
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * Libera el puerto si está ocupado antes de iniciar.
 * En Windows usa netstat para encontrar el PID y lo mata con taskkill.
 */
function liberarPuerto(port) {
    try {
        const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
        const lines = output.trim().split('\n');
        const listenLine = lines.find(l => l.includes('LISTENING'));
        if (!listenLine) return;

        const parts = listenLine.trim().split(/\s+/);
        const pid = parts[parts.length - 1];

        if (pid && pid !== '0') {
            console.log(`⚠️  Puerto ${port} ocupado por PID ${pid}. Liberando...`);
            execSync(`taskkill /F /PID ${pid}`, { encoding: 'utf8' });
            console.log(`✅ Puerto ${port} liberado correctamente.`);
            // Pequeña pausa para que el SO libere el puerto
            const start = Date.now();
            while (Date.now() - start < 500) {}
        }
    } catch (_) {
        // Puerto libre o sin permisos — se intenta iniciar normalmente
    }
}

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
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como Postman)
        if (!origin) return callback(null, true);
        
        // Permitir cualquier variante local (localhost o 127.0.0.1 con cualquier puerto)
        const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        const isAllowed = allowedOrigins.includes(origin);

        if (isLocal || isAllowed) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Log de peticiones para depuración: Verás esto en la terminal
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    if (req.method !== 'GET') console.log('Body:', req.body);
    next();
});

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

app.get('/api/pedidos', async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from('pedidos')
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

app.post('/api/pedidos', async (req, res) => {
    try {
        const { cliente_id, cliente_email, items, subtotal, shipping_cost, total, delivery, status } = req.body;

        if (!cliente_id || !cliente_email || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Los datos del pedido son incompletos.' });
        }

        const { data, error } = await supabase
            .from('pedidos')
            .insert([{
                cliente_id,
                cliente_email,
                items,
                subtotal,
                shipping_cost,
                total,
                delivery: delivery || 'recoger',
                status: status || 'pendiente',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json({ message: 'Pedido creado exitosamente', pedido: data });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.put('/api/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'El estado del pedido es obligatorio.' });
    }

    try {
        const { data, error } = await supabase
            .from('pedidos')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ message: 'Estado actualizado correctamente', pedido: data });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Liberar puerto automáticamente antes de arrancar
liberarPuerto(PORT);

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Servidor Cucu corriendo en http://127.0.0.1:${PORT}`);
    console.log(`📅 ${new Date().toLocaleString('es-CO')}\n`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ No se pudo liberar el puerto ${PORT}. Intenta reiniciar la terminal.\n`);
        process.exit(1);
    }
});

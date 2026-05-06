require('dotenv').config({ path: '../.env.server' });
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Supabase con Service Role (nunca expuesto al cliente) ──
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ── Middlewares ──
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:3000',   // si sirves el front local
        'http://127.0.0.1:3000',   // frontend local en 127.0.0.1
        'http://127.0.0.1:5500',  // Live Server de VS Code
        'http://localhost:5500',  // Live Server de VS Code (localhost)
        'https://tiendaelcucu.vercel.app' // dominio en producción (ajusta si es diferente)
    ],
    credentials: true
}));

// ── POST /api/login ──────────────────────────────────────────
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return res.status(401).json({ error: error.message });
    }

    // Determinar rol
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
});

// ── POST /api/registro ───────────────────────────────────────
app.post('/api/registro', async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
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

    return res.status(201).json({
        message: 'Registro exitoso',
        user: {
            id: data.user.id,
            email: data.user.email,
            full_name: name
        }
    });
});

// ── POST /api/logout ─────────────────────────────────────────
app.post('/api/logout', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token no proporcionado.' });
    }

    // Usamos el token del usuario para cerrar su sesión específica en Supabase
    const userClient = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    const { error } = await userClient.auth.admin.signOut(authHeader.replace('Bearer ', ''));

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
});

// ── GET /api/health ──────────────────────────────────────────
app.get('/api/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Iniciar servidor ─────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅  Servidor Cucu corriendo en http://localhost:${PORT}`);
});

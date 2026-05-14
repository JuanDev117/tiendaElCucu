// ─────────────────────────────────────────────────────────────
// config.js — Configuración central del Admin
// ─────────────────────────────────────────────────────────────

const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? `http://127.0.0.1:3002`
    : '';

const supabaseDb = window.cucuSupabaseClient;

// Estados de Pedidos
const orderStatusMap = {
    pendiente: 'Pendiente',
    en_camino: 'En Camino',
    entregado: 'Entregado',
    anulado: 'Anulado',
    pagado: 'Pagado'
};

const orderStatusClasses = {
    pendiente: 'badge-warning',
    en_camino: 'badge-active',
    entregado: 'badge-inactive',
    anulado: 'badge-danger',
    pagado: 'badge-active'
};

// Estado Global
let productos = [];
let pedidos = [];
let productoEnEdicion = null;

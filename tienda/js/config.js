// ─────────────────────────────────────────────────────────────
// config.js — Constantes globales y estado compartido
// ─────────────────────────────────────────────────────────────

const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:3002'
    : '';

const WHATSAPP_NUMBER = "573207248739";
const DELIVERY_COST = 3000;

const supabaseDb = window.cucuSupabaseClient;

// Estado global del carrito
let cart = [];
let productos = [];
let categoriaSeleccionada = 'todas';

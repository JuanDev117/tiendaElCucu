// supabase-config.js
// IMPORTANTE: Reemplaza estos valores con tu URL y Key reales de Supabase
const SUPABASE_URL = 'https://xxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'tu_anon_key';

// Definir el correo de tu administrador
const ADMIN_EMAIL = 'admin@tutienda.com';

// Inicializar el cliente (asume que la librería de Supabase se carga antes en el HTML)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

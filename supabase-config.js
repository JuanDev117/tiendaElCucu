// supabase-config.js
// IMPORTANTE: Reemplaza estos valores con tu URL y Key reales de Supabase
const SUPABASE_URL = 'https://bjehwfsbiagojtyyzoyw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqZWh3ZnNiaWFnb2p0eXl6b3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMjkwMDIsImV4cCI6MjA5MzYwNTAwMn0.ksZWm_bL3Ucob8lDJFU5Hi69Dr7QqC_rh6yrcwdnfsQ';

// Definir el correo de tu administrador
const ADMIN_EMAIL = 'admin@tutienda.com';

// Inicializar el cliente (asume que la librería de Supabase se carga antes en el HTML)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

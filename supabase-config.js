// Config publica para el navegador. La anon key es segura de exponer si tus
// politicas RLS en Supabase estan bien configuradas.
window.CUCU_SUPABASE = {
    url: 'https://bjehwfsbiagojtyyzoyw.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqZWh3ZnNiaWFnb2p0eXl6b3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMjkwMDIsImV4cCI6MjA5MzYwNTAwMn0.ksZWm_bL3Ucob8lDJFU5Hi69Dr7QqC_rh6yrcwdnfsQ'
};

window.cucuSupabaseClient = window.supabase
    ? window.supabase.createClient(window.CUCU_SUPABASE.url, window.CUCU_SUPABASE.anonKey)
    : null;

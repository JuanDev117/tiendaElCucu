// chatbot-config.js
// AQUÍ defines todo lo que el bot sabe. Edita las respuestas a tu gusto.

const CHATBOT_CONFIG = {
    // Nombre del bot que aparece en la cabecera del chat
    botName: "CucuBot",
    // Mensaje inicial cuando el usuario abre el chat
    welcomeMessage: "¡Hola! 👋 Soy CucuBot, el asistente de Tienda el Cucu. ¿En qué te puedo ayudar hoy?",
    // Mensaje por defecto cuando no entiende la pregunta
    defaultResponse: "Hmm, no entendí bien esa pregunta. Puedes preguntarme sobre nuestros 🛒 productos, 🚚 envíos, 🕐 horarios o cómo 🔐 crear una cuenta.",

    // === LISTADO DE TEMAS Y RESPUESTAS ===
    // Cada tema tiene palabras clave (keywords) y una respuesta.
    // Si el usuario escribe algo que coincide con una keyword, el bot responde con esa respuesta.
    topics: [
        {
            keywords: ["hola", "buenas", "hey", "buen día", "buenas tardes", "buenas noches", "saludos"],
            response: "¡Hola! 😊 Bienvenido a Tienda el Cucu. ¿Cómo te puedo ayudar?"
        },
        {
            keywords: ["gracias", "muchas gracias", "gracia", "ok gracias"],
            response: "¡Con mucho gusto! 💚 Si tienes otra pregunta, aquí estoy."
        },
        {
            keywords: ["horario", "hora", "abierto", "abren", "cierran", "cierre", "atención"],
            response: "⏰ Nuestro horario de atención es:\n• Lunes a Sábado: 8:00 AM - 9:00 PM\n• Domingos y festivos: 9:00 AM - 6:00 PM"
        },
        {
            keywords: ["producto", "productos", "qué venden", "que venden", "catalogo", "catálogo", "vende", "tienen"],
            response: "🛒 En Tienda el Cucu tenemos:\n• Bebidas y refrescos\n• Snacks y pasabocas\n• Lácteos y huevos\n• Panadería fresca\n• Aseo y limpieza\n• Y mucho más del barrio!"
        },
        {
            keywords: ["precio", "precios", "cuanto cuesta", "cuánto cuesta", "cuanto vale", "cuánto vale", "costo"],
            response: "💰 Nuestros precios son muy competitivos. Puedes ver los precios de cada producto directamente en la sección de Productos. ¡También tenemos ofertas especiales frecuentes!"
        },
        {
            keywords: ["envio", "envío", "domicilio", "delivery", "entregan", "despacho", "llegar"],
            response: "🚚 ¡Sí hacemos domicilios! El envío cubre el barrio y zonas cercanas. Tiempo estimado de entrega: 20 a 40 minutos dependiendo de la distancia."
        },
        {
            keywords: ["pago", "pagar", "efectivo", "tarjeta", "transferencia", "nequi", "daviplata"],
            response: "💳 Aceptamos los siguientes métodos de pago:\n• Efectivo 💵\n• Tarjeta débito y crédito 💳\n• Nequi y Daviplata 📱\n• Transferencia bancaria"
        },
        {
            keywords: ["registrar", "registro", "cuenta", "crear cuenta", "registrarme", "unirse"],
            response: "🔐 Para crear tu cuenta haz clic en el botón **Registrarse** que está en la parte superior de la página. Solo necesitas tu correo y una contraseña. ¡Es gratis y rápido!"
        },
        {
            keywords: ["login", "iniciar sesion", "iniciar sesión", "entrar", "ingresar", "contraseña"],
            response: "🔑 Para ingresar haz clic en **Ingresar** en la barra superior. Si olvidaste tu contraseña, contacta al administrador."
        },
        {
            keywords: ["contacto", "contactar", "telefono", "teléfono", "whatsapp", "llamar", "comunicar"],
            response: "📞 Puedes contactarnos:\n• WhatsApp: +57 300 000 0000\n• Correo: tiendacucu@gmail.com\n• También puedes venir directamente a la tienda del barrio 🏪"
        },
        {
            keywords: ["ubicacion", "ubicación", "donde", "dónde", "dirección", "direccion", "barrio"],
            response: "📍 Estamos ubicados en el corazón del barrio. Para más información sobre la dirección exacta, escríbenos al WhatsApp o al correo."
        },
        {
            keywords: ["oferta", "ofertas", "descuento", "descuentos", "promocion", "promoción", "rebaja"],
            response: "🔥 ¡Sí tenemos ofertas! Las publicamos en nuestra sección de Productos. Te recomendamos revisar seguido para no perderte los mejores precios del barrio."
        },
        {
            keywords: ["adios", "adiós", "chao", "hasta luego", "bye", "ciao"],
            response: "¡Hasta luego! 👋 Fue un placer atenderte. Vuelve pronto a Tienda el Cucu. 💚"
        }
    ]
};

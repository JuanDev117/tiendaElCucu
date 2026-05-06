// chatbot.js - Lógica del chatbot con IA (Gemini API) para Tienda el Cucu

(function() {
    // ---- Crear el HTML del chat ----
    const chatHTML = `
    <div id="chatbot-widget">
        <button id="chatbot-toggle" aria-label="Abrir chat">
            <svg class="chat-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <svg class="close-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>

        <div id="chatbot-window" style="display: none;">
            <div id="chatbot-header">
                <div class="chatbot-header-info">
                    <div class="chatbot-avatar">🤖</div>
                    <div>
                        <span class="chatbot-name">CucuBot (IA)</span>
                        <span class="chatbot-status">En línea</span>
                    </div>
                </div>
                <button id="chatbot-close-btn">✕</button>
            </div>
            <div id="chatbot-messages"></div>
            <div id="chatbot-input-area">
                <input type="text" id="chatbot-input" placeholder="Escribe tu mensaje..." autocomplete="off">
                <button id="chatbot-send">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // ---- Referencias ----
    const toggleBtn = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const messagesContainer = document.getElementById('chatbot-messages');
    const inputField = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const chatIcon = toggleBtn.querySelector('.chat-icon');
    const closeIcon = toggleBtn.querySelector('.close-icon');

    // API Key de Gemini
    const GEMINI_API_KEY = "AIzaSyBh4Mlu0gzrYcJqt4fKz4c2-_ES0iRBN-o";
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Prompt del sistema para que se comporte como vendedor
    const SYSTEM_PROMPT = `
Eres CucuBot, el asistente virtual inteligente de "Tienda el Cucu". 
Tu objetivo principal es ayudar a los clientes con información sobre productos y precios.
Aquí tienes una lista de productos y precios de referencia:
- Bebida Energética: $2.50
- Papas Fritas Artesanales: $1.80
- Leche Entera 1L: $1.20
- Pan Tajado Premium: $3.00
Si te preguntan por otros productos de tienda de barrio (huevos, arroz, aceite, etc.), inventa un precio razonable y diles que lo tenemos disponible.
Sé amable, persuasivo y usa emojis. Respuestas cortas y concisas.
`;

    // Historial de la conversación para la IA
    let chatHistory = [];

    let isOpen = false;
    let welcomeShown = false;

    // ---- Funciones ----
    function toggleChat() {
        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        chatIcon.style.display = isOpen ? 'none' : 'block';
        closeIcon.style.display = isOpen ? 'block' : 'none';
        
        if (isOpen && !welcomeShown) {
            welcomeShown = true;
            addMessage("¡Hola! 👋 Soy CucuBot. Pregúntame sobre nuestros productos y precios.", 'bot');
        }
        if (isOpen) inputField.focus();
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        msgDiv.innerHTML = `<div class="chat-bubble">${text.replace(/\n/g, '<br>')}</div>`;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function getBotResponse(userText) {
        // Añadir mensaje del usuario al historial
        chatHistory.push({ role: "user", parts: [{ text: userText }] });

        // Crear la carga útil para la API de Gemini
        const payload = {
            systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }]
            },
            contents: chatHistory,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 150
            }
        };

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Error en la API");

            const data = await response.json();
            const botText = data.candidates[0].content.parts[0].text;
            
            // Añadir respuesta al historial
            chatHistory.push({ role: "model", parts: [{ text: botText }] });
            
            return botText;
        } catch (error) {
            console.error("Error al conectar con Gemini:", error);
            return "Lo siento, tuve un problema al conectarme al servidor. Intenta de nuevo. 😥";
        }
    }

    async function handleSend() {
        const text = inputField.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        inputField.value = '';

        // Añadir indicador de "escribiendo..."
        const typingId = "typing-" + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = `chat-message bot`;
        typingDiv.id = typingId;
        typingDiv.innerHTML = `<div class="chat-bubble">Escribiendo... ✍️</div>`;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Obtener respuesta de la IA
        const response = await getBotResponse(text);
        
        // Remover el indicador de escribiendo
        document.getElementById(typingId).remove();
        
        // Mostrar respuesta final
        addMessage(response, 'bot');
    }

    // ---- Eventos ----
    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    sendBtn.addEventListener('click', handleSend);
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
    });
})();

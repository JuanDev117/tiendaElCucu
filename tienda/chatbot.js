// chatbot.js - Lógica del chatbot de Tienda el Cucu

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
                        <span class="chatbot-name">${CHATBOT_CONFIG.botName}</span>
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
            setTimeout(() => addMessage(CHATBOT_CONFIG.welcomeMessage, 'bot'), 400);
        }
        if (isOpen) inputField.focus();
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        // Soporte básico para saltos de línea
        msgDiv.innerHTML = `<div class="chat-bubble">${text.replace(/\n/g, '<br>')}</div>`;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function getBotResponse(userText) {
        const lowerText = userText.toLowerCase().trim();

        for (const topic of CHATBOT_CONFIG.topics) {
            for (const keyword of topic.keywords) {
                if (lowerText.includes(keyword)) {
                    return topic.response;
                }
            }
        }
        return CHATBOT_CONFIG.defaultResponse;
    }

    function handleSend() {
        const text = inputField.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        inputField.value = '';

        // Pequeño retraso para simular que el bot "escribe"
        setTimeout(() => {
            const response = getBotResponse(text);
            addMessage(response, 'bot');
        }, 600);
    }

    // ---- Eventos ----
    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    sendBtn.addEventListener('click', handleSend);
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
    });
})();

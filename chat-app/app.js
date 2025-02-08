class AdvancedChat {
            


    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeFeatures();
        this.addWelcomeMessage();
    }
    initializeMarkdown() {
        marked.setOptions({
            breaks: true,      
            gfm: true,        
            sanitize: false,   
            mangle: false,
            headerIds: false, 
            langPrefix: 'language-',  
            highlight: function(code, lang) {
                return code;  
            }
        });
    }




    initializeElements() {
        this.elements = {
            chatContainer: document.getElementById('chat-container'),
            messageInput: document.getElementById('message-input'),
            sendButton: document.querySelector('.send-btn'),
            chatWrapper: document.querySelector('.chat-wrapper'),
            voiceRecordBtn: document.querySelector('.voice-record-btn'),
            themeSwitch: document.querySelector('.theme-switch'),
            searchToggle: document.querySelector('.search-toggle'),
            searchContainer: document.querySelector('.search-container'),
            searchInput: document.querySelector('.search-input'),
            quickReplies: document.querySelector('.quick-replies')
        };
    }




    initializeEventListeners() {
        // message sending events
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSubmit(e);
            }
        });
        this.elements.sendButton.addEventListener('click', (e) => this.handleSubmit(e));

        
        this.elements.voiceRecordBtn.addEventListener('click', () => this.toggleVoiceRecording());

        
        this.elements.themeSwitch.addEventListener('click', () => this.toggleTheme());

        
        this.elements.searchToggle.addEventListener('click', () => this.toggleSearch());
        this.elements.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        
        this.elements.quickReplies.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-reply')) {
                this.handleQuickReply(e.target.textContent);
            }
        });

        
        this.elements.messageInput.addEventListener('input', () => this.autoResizeTextarea());
    }



    // prev code
    //initializeFeatures() {
        // Initialize MediaRecorder for voice messages
        //navigator.mediaDevices?.getUserMedia({ audio: true })
            //.then(stream => {
                //this.mediaRecorder = new MediaRecorder(stream);
                //this.mediaRecorder.ondataavailable = (e) => {
                    //const audioUrl = URL.createObjectURL(e.data);
                    //this.appendAudioMessage(audioUrl);
                //};
            //})
            //.catch(err => console.error('Media device error:', err));
    //}

    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async handleSubmit(e) {
        e.preventDefault();
        const message = this.elements.messageInput.value.trim();
        if (!message) return;

        this.elements.messageInput.value = '';
        this.autoResizeTextarea();
        this.appendMessage(message, true);

        try {
            await this.streamResponse(message);
        } catch (error) {
            this.appendMessage(`Error: ${error.message}`, false);
        }
    }

    async streamResponse(message) {
        const response = await fetch('/api/stream-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                chat_id: 'default'
            }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let currentMessage = '';
        let messageElement = null;

        while (true) {
            const {value, done} = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(5);
                    if (data === '[DONE]') continue;
                    
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.token) {
                            currentMessage += parsed.token;
                            if (!messageElement) {
                                messageElement = this.createMessageElement(false);
                                this.elements.chatContainer.appendChild(messageElement);
                            }
                            // Use renderMarkdown instead of directly setting textContent
                            messageElement.querySelector('.text-sm').innerHTML = this.renderMarkdown(currentMessage);
                            this.scrollToBottom();
                        }
                    } catch (e) {
                        console.error('Error parsing SSE data:', e);
                    }
                }
            }
        }
    }

    // markdown-rendering
    renderMarkdown(markdown) {
        
        markdown = markdown.replace(/```([\s\S]*?)```/g, (match, code) => {
            return `<pre><code class="bg-gray-800 text-white p-4 rounded-lg block overflow-x-auto my-4 font-mono">${this.escapeHtml(code)}</code></pre>`;
        });

        
        markdown = markdown.replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-2 py-1 rounded text-sm font-mono">$1</code>');

        
        markdown = markdown
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-800 mt-6 mb-4">$1</h1>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-gray-700 mt-4 mb-3">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-600 mt-3 mb-2">$1</h3>');

        
        markdown = markdown
            .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc list-inside text-gray-700 mb-2">$1</li>')
            .replace(/^\d\. (.*$)/gim, '<li class="ml-4 list-decimal list-inside text-gray-700 mb-2">$1</li>');

       
        markdown = markdown
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

        
        markdown = markdown.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>');

        
        markdown = markdown.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600">$1</blockquote>');

        
        markdown = markdown
            .replace(/\n\n/g, '</p><p class="mb-4">')
            .replace(/\n/g, '<br>');








        return `<div class="markdown-content">${markdown}</div>`;
    }

    createMessageElement(isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 message-appear`;
        messageDiv.innerHTML = `
            <div class="max-w-[80%] ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-lg px-4 py-2">
                <div class="text-sm ${isUser ? 'text-white' : 'text-gray-900'}"></div>
                <div class="message-time text-xs ${isUser ? 'text-blue-100' : 'text-gray-500'}">${this.getFormattedTime()}</div>
            </div>
        `;
        return messageDiv;
    }

    appendMessage(text, isUser) {
        const messageElement = this.createMessageElement(isUser);
        messageElement.querySelector('.text-sm').textContent = text;
        this.elements.chatContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    appendAudioMessage(audioUrl) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex justify-end mb-4 message-appear';
        messageDiv.innerHTML = `
            <div class="max-w-[80%] bg-blue-500 rounded-lg px-4 py-2">
                <audio controls src="${audioUrl}" class="max-w-full"></audio>
                <div class="message-time text-xs text-blue-100">${this.getFormattedTime()}</div>
            </div>
        `;
        this.elements.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    toggleVoiceRecording() {
        if (!this.mediaRecorder) return;

        if (this.mediaRecorder.state === 'inactive') {
            this.mediaRecorder.start();
            this.elements.voiceRecordBtn.classList.add('recording');
        } else {
            this.mediaRecorder.stop();
            this.elements.voiceRecordBtn.classList.remove('recording');
        }
    }
    
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        this.elements.themeSwitch.textContent = 
            document.body.classList.contains('dark-theme') ? '🌞' : '🌓';
    }

    toggleSearch() {
        this.elements.searchContainer.classList.toggle('active');
        if (this.elements.searchContainer.classList.contains('active')) {
            this.elements.searchInput.focus();
        }
    }
    
    handleSearch(query) {
        const messages = this.elements.chatContainer.querySelectorAll('.text-sm');
        messages.forEach(message => {
            const text = message.textContent;
            if (query && text.toLowerCase().includes(query.toLowerCase())) {
                const highlighted = text.replace(new RegExp(query, 'gi'), 
                    match => `<span class="highlight">${match}</span>`);
                message.innerHTML = highlighted;
            } else {
                message.textContent = text;
            }
        });
    }

    handleQuickReply(text) {
        this.elements.messageInput.value = text;
        this.handleSubmit(new Event('submit'));
    }

    autoResizeTextarea() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    addWelcomeMessage() {
        setTimeout(() => {
            this.appendMessage("Hi! What's your budget for a laptop?", false);
        }, 500);
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    getFormattedTime() {
        return new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    }

    scrollToBottom() {
        this.elements.chatContainer.scrollTop = this.elements.chatContainer.scrollHeight;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const chat = new AdvancedChat();
});
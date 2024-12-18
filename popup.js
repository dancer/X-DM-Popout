const conversationsList = document.getElementById('conversationsList');
const chatView = document.getElementById('chatView');
const messageContainer = document.getElementById('messageContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const backButton = document.querySelector('.back-btn');
const searchInput = document.querySelector('.search-input');
const newMessageBtn = document.querySelector('.new-message-btn');

const minimizeBtn = document.getElementById('minimizeBtn');
const maximizeBtn = document.getElementById('maximizeBtn');
const closeBtn = document.getElementById('closeBtn');

let currentConversation = null;
let conversations = [];
let isMaximized = false;
let originalDimensions = null;

minimizeBtn?.addEventListener('click', () => {
    chrome.windows.getCurrent(window => {
        chrome.windows.update(window.id, { state: 'minimized' });
    });
});

maximizeBtn?.addEventListener('click', () => {
    chrome.windows.getCurrent(window => {
        if (!isMaximized) {
            originalDimensions = {
                width: window.width,
                height: window.height,
                left: window.left,
                top: window.top
            };
            chrome.windows.update(window.id, { state: 'maximized' });
        } else {
            chrome.windows.update(window.id, {
                state: 'normal',
                width: originalDimensions.width,
                height: originalDimensions.height,
                left: originalDimensions.left,
                top: originalDimensions.top
            });
        }
        isMaximized = !isMaximized;
    });
});

closeBtn?.addEventListener('click', () => {
    chrome.windows.getCurrent(window => {
        chrome.windows.remove(window.id);
    });
});

const header = document.querySelector('.dm-header');
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;

function dragStart(e) {
    if (e.target.closest('.window-control-btn')) return;
    
    isDragging = true;
    initialX = e.clientX;
    initialY = e.clientY;
    
    chrome.windows.getCurrent(window => {
        currentX = window.left;
        currentY = window.top;
    });
    
    header.style.cursor = 'grabbing';
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();

    const deltaX = e.clientX - initialX;
    const deltaY = e.clientY - initialY;

    chrome.windows.getCurrent(window => {
        chrome.windows.update(window.id, {
            left: Math.round(currentX + deltaX),
            top: Math.round(currentY + deltaY)
        });
    });
}

function dragEnd() {
    isDragging = false;
    header.style.cursor = 'grab';
}

header.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

function createConversationElement(conversation) {
    const div = document.createElement('div');
    div.className = 'conversation-item';
    div.dataset.conversationId = conversation.id;
    
    div.innerHTML = `
        <div class="conversation-content">
            <div class="conversation-header">
                <div class="conversation-name">${conversation.name}</div>
                <div class="conversation-time">${formatTime(conversation.time)}</div>
            </div>
            <div class="conversation-preview">${conversation.preview}</div>
        </div>
    `;
    
    div.addEventListener('click', () => openConversation(conversation));
    return div;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    
    if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    } 
    else if (diff < 7 * 24 * 60 * 60 * 1000) {
        return days[date.getDay()];
    } 
    else if (date.getFullYear() === now.getFullYear()) {
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
    }
    else {
        return `${date.getFullYear().toString().slice(2)}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
    }
}

function openConversation(conversation) {
    currentConversation = conversation;
    
    const chatName = chatView.querySelector('.chat-name');
    chatName.textContent = conversation.name;
    
    conversationsList.style.display = 'none';
    chatView.classList.remove('hidden');
    
    chrome.runtime.sendMessage({
        type: 'LOAD_CONVERSATION',
        conversationId: conversation.id
    });
}

function createMessageElement(message) {
    const div = document.createElement('div');
    div.className = `message ${message.isOwn ? 'own' : ''}`;
    
    div.innerHTML = `
        <div class="message-content">
            <div class="message-text">${message.text}</div>
            <time class="message-time">${formatTime(message.time)}</time>
        </div>
    `;
    
    return div;
}

backButton.addEventListener('click', () => {
    chatView.classList.add('hidden');
    conversationsList.style.display = 'block';
    currentConversation = null;
});

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const items = conversationsList.querySelectorAll('.conversation-item');
    
    items.forEach(item => {
        const name = item.querySelector('.conversation-name').textContent.toLowerCase();
        const preview = item.querySelector('.conversation-preview').textContent.toLowerCase();
        const matches = name.includes(query) || preview.includes(query);
        item.style.display = matches ? 'flex' : 'none';
    });
});

chrome.storage.local.get(['conversations'], (result) => {
    if (result.conversations) {
        conversations = result.conversations;
        conversationsList.innerHTML = '';
        conversations.forEach(conv => {
            conversationsList.appendChild(createConversationElement(conv));
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CONVERSATION_MESSAGES') {
        if (currentConversation && message.conversationId === currentConversation.id) {
            messageContainer.innerHTML = '';
            message.messages.forEach(msg => {
                messageContainer.appendChild(createMessageElement(msg));
            });
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }
});
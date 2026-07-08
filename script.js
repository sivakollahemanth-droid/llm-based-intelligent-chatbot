const messagesEl = document.getElementById('messages');
const formEl = document.getElementById('chatForm');
const inputEl = document.getElementById('userInput');
const typingEl = document.getElementById('typingIndicator');
const resetBtn = document.getElementById('resetBtn');

// A simple per-browser-tab session id so the server can track history
const sessionId = 'session-' + Math.random().toString(36).slice(2);

function addMessage(text, sender) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${sender}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setTyping(isTyping) {
  typingEl.classList.toggle('hidden', !isTyping);
}

async function sendMessage(message) {
  setTyping(true);
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId }),
    });

    const data = await res.json();

    if (!res.ok) {
      addMessage(data.error || 'Something went wrong.', 'bot');
      return;
    }

    addMessage(data.reply, 'bot');
  } catch (err) {
    addMessage('Network error: could not reach the server.', 'bot');
  } finally {
    setTyping(false);
  }
}

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  inputEl.value = '';
  sendMessage(text);
});

resetBtn.addEventListener('click', async () => {
  await fetch('/api/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  messagesEl.innerHTML = '';
  addMessage("Conversation reset. What's on your mind?", 'bot');
});

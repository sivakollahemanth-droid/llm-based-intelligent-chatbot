// server.js
// Simple Express backend that powers an LLM-based chatbot.
// It keeps conversation history per session in memory and forwards
// each request to the Anthropic Messages API.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.LLM_MODEL || 'claude-sonnet-4-6';
const API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory store of conversation history, keyed by sessionId.
// For production use, replace with a database (Redis, Postgres, etc.)
const sessions = new Map();

const SYSTEM_PROMPT =
  'You are a helpful, concise, and friendly assistant embedded in a chat widget. ' +
  'Keep answers clear and to the point unless the user asks for more detail.';

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing "message" field.' });
    }

    if (!API_KEY) {
      return res.status(500).json({
        error: 'Server is missing ANTHROPIC_API_KEY. Add it to your .env file.',
      });
    }

    // Retrieve or start conversation history for this session
    const history = sessions.get(sessionId) || [];
    history.push({ role: 'user', content: message });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: history,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('LLM API error:', errText);
      return res.status(502).json({ error: 'Upstream LLM API error.' });
    }

    const data = await response.json();
    const replyBlock = data.content?.find((block) => block.type === 'text');
    const reply = replyBlock ? replyBlock.text : '(No text response received.)';

    // Save assistant reply into history and persist session
    history.push({ role: 'assistant', content: reply });
    sessions.set(sessionId, history);

    res.json({ reply });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Reset a session's conversation history
app.post('/api/reset', (req, res) => {
  const { sessionId = 'default' } = req.body;
  sessions.delete(sessionId);
  res.json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: MODEL });
});

app.listen(PORT, () => {
  console.log(`LLM chatbot server running at http://localhost:${PORT}`);
});

# LLM-Based Intelligent Chatbot

A simple, self-contained full-stack chatbot project:
- **Backend**: Node.js + Express, forwards messages to an LLM (Anthropic Claude by default) and keeps per-session conversation history.
- **Frontend**: Plain HTML/CSS/JS chat widget (no build step required).

## Project structure
```
llm-chatbot/
├── server.js          # Express backend + LLM API integration
├── package.json
├── .env.example       # Copy to .env and add your API key
└── public/
    ├── index.html     # Chat UI markup
    ├── style.css      # Chat UI styling
    └── script.js      # Frontend chat logic (fetch calls to backend)
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and set:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   LLM_MODEL=claude-sonnet-4-6
   PORT=3000
   ```

3. Run the server:
   ```bash
   npm start
   ```
   Or, for auto-reload during development:
   ```bash
   npm run dev
   ```

4. Open your browser at [http://localhost:3000](http://localhost:3000).

## How it works

1. The frontend (`script.js`) sends the user's message plus a `sessionId` to `POST /api/chat`.
2. The backend appends the message to that session's history and calls the Anthropic Messages API.
3. The model's reply is returned to the frontend and rendered as a chat bubble.
4. Conversation history is stored in memory per session (cleared on server restart, or manually via the **Reset** button, which calls `POST /api/reset`).

## Extending this base project

- **Persistence**: Swap the in-memory `Map` in `server.js` for Redis or a database so history survives restarts and scales across multiple server instances.
- **Streaming responses**: Use the Anthropic API's streaming mode and Server-Sent Events (or WebSockets) to show the reply as it's generated, token by token.
- **Authentication**: Add user login so `sessionId` maps to real accounts instead of a random per-tab id.
- **System prompt customization**: Edit the `SYSTEM_PROMPT` constant in `server.js` to give the bot a specific persona, domain knowledge, or response format.
- **Different LLM provider**: Replace the `fetch` call in `server.js` with the API of your provider of choice (OpenAI, Gemini, etc.) — the rest of the app (frontend, session handling) does not need to change.
- **File/image uploads**: Extend `/api/chat` to accept multipart form data and pass images/documents to the model.

## Notes

- This is a minimal educational/starter template, not a production deployment. Add rate limiting, input sanitization, and proper session storage before shipping to real users.
- Never expose your API key in frontend code — it should only ever live in the backend `.env` file.

# Wellness Gym Chatbot Setup

The chatbot works in two modes: an optional Anthropic-powered mode and a built-in local fallback mode.

## Setup

```bash
cd gym-website/server
npm install
cp .env.template .env
```

Add your optional API key to `.env`:

```env
ANTHROPIC_API_KEY=your_api_key_here
PORT=5000
NODE_ENV=development
```

Start the backend:

```bash
npm start
```

Health check: `GET http://localhost:5000/api/health`
Chat endpoint: `POST http://localhost:5000/api/chat`

If no Anthropic key is configured, the server still answers common gym questions using built-in fallback responses.

Never commit the real `.env` file or API keys to GitHub.

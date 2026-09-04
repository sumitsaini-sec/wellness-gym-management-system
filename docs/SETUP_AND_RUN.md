# Setup & Run Guide

## Requirements

- A modern web browser
- Node.js 14+ and npm for the chatbot backend
- VS Code or another editor (optional)

## Run the Project

1. Clone the repository and open the project folder.
2. Install backend dependencies:

```bash
cd gym-website/server
npm install
```

3. Optional AI setup: copy `.env.template` to `.env` and add your Anthropic API key.

```env
ANTHROPIC_API_KEY=your_api_key_here
PORT=5000
NODE_ENV=development
```

4. Start the chatbot backend:

```bash
npm start
```

5. Open `gym-website/login.html` in a browser.

## Demo Admin Login

```text
Username: Admin123
Password: @Branch
```

## Live Server Note

If the frontend is served from another port such as `5500`, the chatbot backend still runs on port `5000`. Configure the chatbot endpoint accordingly or open the HTML directly for the simplest demo.

## Important

Do not commit `.env`, API keys, `node_modules`, or real credentials.

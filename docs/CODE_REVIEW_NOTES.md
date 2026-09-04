# Code Review Notes Before Public Upload

These observations are based on the current academic project and are useful for future improvement.

## Important

### 1. Demo admin credentials are visible in frontend code

`gym-website/js/auth.js` contains the demo admin username/password. This is acceptable only for a classroom prototype.

### 2. Member passwords are stored in localStorage

This is not secure for real users. A production version should use backend authentication and password hashing.

### 3. Contact recipient email is public

`gym-website/contact.html` and the contact-form logic include the configured recipient email. Anyone viewing a public repository can see it.

### 4. Live Server chatbot routing

`js/chatbot.js` prefers the current page origin when the frontend is served over HTTP(S). If the frontend runs on port 5500 and the backend on port 5000, explicitly configure `data-chatbot-api="http://localhost:5000/api/chat"` or use a proxy.

### 5. Third-party exercise/media URLs

Some workout GIFs and page images are loaded from external websites. Those resources can change, disappear, or have separate reuse/licensing requirements.

## Cleanup Opportunity

### Unused dependency

`twilio` is present in `gym-website/server/package.json`, but no Twilio use was found in the current project source. If it is not planned for future SMS features, removing it would reduce installed dependencies.

## Good Practices Already Present

- `.env.template` is used instead of committing a real API key.
- The chatbot has a local fallback mode.
- Conversation history is capped to prevent unlimited memory growth.
- HTML output for member/receipt content uses escaping helpers in important rendering paths.
- `package-lock.json` is available for reproducible Node dependency installation.

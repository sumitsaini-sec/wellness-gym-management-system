# Viva Questions & Answers

## 1. What is the purpose of this project?
It digitizes basic gym operations such as member registration, attendance, membership packages, billing, receipts, fitness guidance and chatbot assistance.

## 2. Which technologies are used?
HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, browser localStorage/sessionStorage and an optional Anthropic AI integration.

## 3. Where is member data stored?
In browser `localStorage` in the current academic version.

## 4. Where is login state stored?
In browser `sessionStorage`.

## 5. What are the two user roles?
Administrator and member.

## 6. What can the administrator do?
Register members, view members, assign packages, mark attendance, generate bills and print receipts.

## 7. What can a member do?
View activity, workouts, diet plans, supplements, general gym pages and use the chatbot.

## 8. Why is this authentication not production-ready?
Admin credentials are client-side and member passwords are stored in plain text in browser storage.

## 9. How should production passwords be handled?
Authentication should move to a backend and passwords should be stored as secure hashes such as bcrypt or Argon2 hashes.

## 10. How is attendance stored?
Each member has an attendance log containing date strings; the same day is not added twice.

## 11. How does billing work?
The selected package/fee is used to create a bill object that is stored in the member's bill history.

## 12. How is a receipt generated?
JavaScript creates receipt HTML and opens the browser print flow.

## 13. Which backend endpoints are provided?
`POST /api/chat`, `POST /api/chat/clear-session`, and `GET /api/health`.

## 14. What happens without an Anthropic API key?
The backend returns built-in gym-specific fallback responses.

## 15. How is chatbot context maintained?
Recent messages are stored in an in-memory JavaScript `Map` using the session ID.

## 16. Is chatbot history permanent?
No. It is cleared when the server restarts.

## 17. Why is Express used?
It simplifies HTTP routing, middleware, JSON handling and API creation in Node.js.

## 18. What is CORS?
Cross-Origin Resource Sharing controls whether a browser frontend is allowed to call a backend hosted on another origin.

## 19. What is dotenv used for?
It loads environment variables such as API keys and the server port from a `.env` file.

## 20. Why should `.env` not be uploaded to GitHub?
It may contain API keys and other secrets.

## 21. What is the biggest limitation of this version?
Data is browser-local rather than centrally stored in a database.

## 22. How can the project become production-ready?
Add a database, backend CRUD APIs, password hashing, server-side authorization, validation, HTTPS, rate limiting and secure sessions/JWT.

## 23. Which database could be used?
MySQL/PostgreSQL are strong choices for structured members, attendance, packages and payment data; MongoDB is another option.

## 24. What is responsive design?
The UI adapts to desktop, tablet and mobile screen sizes.

## 25. Why are `package.json` and `package-lock.json` important?
They define project dependencies and help reproduce consistent Node.js installations.

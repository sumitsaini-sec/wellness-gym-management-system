# Security Notes

## Purpose

This repository is an **academic demonstration project**, not a production-ready gym management platform.

## Known Security Limitations

1. **Client-side admin credentials**
   - Admin username/password are currently defined in `gym-website/js/auth.js`.
   - Anyone who can inspect the source can see them.

2. **Plain-text member passwords**
   - Registered member passwords are stored in browser `localStorage`.
   - They are not hashed or encrypted.

3. **Browser-only authorization**
   - Admin/member restrictions are enforced in client-side JavaScript.
   - Client-side controls can be bypassed by a knowledgeable user.

4. **No central database**
   - Member, attendance, package, and billing information is stored on one browser/device.

5. **Open CORS on chatbot server**
   - The Express server currently enables CORS broadly for development convenience.

6. **In-memory chatbot sessions**
   - Chat history resets when the backend restarts and is not suitable for durable records.

7. **Public contact recipient**
   - The contact page currently includes a recipient email in HTML/FormSubmit configuration. A public GitHub repository will expose it.

## Before Production Deployment

- Move authentication to the backend.
- Hash passwords with a password hashing library such as bcrypt/Argon2.
- Use a real database.
- Keep all secrets in environment variables.
- Restrict CORS to trusted origins.
- Add input validation and output sanitization.
- Add rate limiting to API endpoints.
- Use HTTPS.
- Add authorization middleware for admin-only APIs.
- Avoid storing sensitive information in browser storage.
- Review third-party media and contact-form dependencies.

## Secret Handling

`.env` files are intentionally ignored by Git. Commit only `.env.template`.

Never commit:

- API keys
- passwords used by real accounts
- database credentials
- access tokens
- private certificates

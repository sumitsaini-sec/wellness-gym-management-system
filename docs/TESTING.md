# Testing Guide

Use the following manual tests before submission or demo.

| # | Test | Expected Result |
|---:|---|---|
| 1 | Open protected page without login | Redirects to login |
| 2 | Admin login with valid credentials | Login succeeds |
| 3 | Invalid admin/member login | Error shown |
| 4 | Register a new member | Member is saved |
| 5 | Register duplicate username | Duplicate is blocked |
| 6 | Member login with registered credentials | Login succeeds |
| 7 | Non-admin opens admin page | Access blocked/redirected |
| 8 | Assign membership package | Package appears on member |
| 9 | Mark attendance | Today's date is recorded |
| 10 | Mark attendance twice same day | Duplicate is prevented |
| 11 | Generate bill | Bill is added to history |
| 12 | Open/print receipt | Receipt renders correctly |
| 13 | Member activity page | Personal activity loads |
| 14 | Workout builder | Selected workout content renders |
| 15 | Diet plans | Page loads and is readable |
| 16 | Supplement page | Product content loads |
| 17 | Theme toggle | Theme changes and persists |
| 18 | Mobile navigation | Menu works on small screens |
| 19 | GET `/api/health` | Backend health response returned |
| 20 | Chat without AI key | Fallback chatbot responds |

## Basic Code Checks

```bash
node --check gym-website/js/auth.js
node --check gym-website/js/script.js
node --check gym-website/js/chatbot.js
node --check gym-website/js/members-admin.js
node --check gym-website/server/server.js
```

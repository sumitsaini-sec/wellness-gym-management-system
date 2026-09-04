# Wellness Gym Management System — Project Documentation

## 1. Introduction

The Wellness Gym Management System is a web-based academic project designed to demonstrate how common gym operations can be digitized through a simple and responsive user interface. The application supports two logical roles: **administrator** and **member**. Administrators can register members, assign packages, mark attendance, create bills, and print receipts. Members can log in to access gym content, view activity-related information, explore workout routines, use diet-plan resources, browse supplements, and interact with a gym assistant.

The project combines a static frontend with a lightweight Node.js/Express backend dedicated to chatbot functionality. For academic simplicity, member records and authentication state are stored in browser storage rather than a database.

## 2. Problem Statement

Small gyms often manage memberships, attendance, billing, and fitness guidance using spreadsheets or manual records. This approach can become repetitive and makes it difficult to provide a unified experience for both staff and members. The project demonstrates a single web interface that brings together basic gym administration and member-oriented fitness features.

## 3. Objectives

- Provide a simple login system for administrator and members.
- Allow an administrator to register new gym members.
- Maintain member information in a structured format.
- Assign membership packages and fees.
- Track daily attendance.
- Generate bills and printable payment receipts.
- Give members access to activity and workout information.
- Present diet, supplement, gallery, and contact content.
- Add an interactive chatbot for common gym questions.
- Build a responsive interface suitable for desktop and mobile demonstrations.

## 4. Scope

### Included

- Client-side role-based navigation
- Member creation and storage
- Attendance records
- Package assignment
- Billing and receipt generation
- Activity dashboard
- Workout-builder interface
- Diet-plan and supplement content
- Chatbot UI and API
- Light/dark theme handling

### Outside the Current Scope

- Real payment processing
- Central database
- Production-grade user authentication
- Password recovery/email verification
- Trainer scheduling
- Multi-branch support
- Cloud-hosted file storage
- Production analytics

## 5. Technologies Used

### Frontend

- HTML5 for page structure
- CSS3 for layout, responsive design, animations, and themes
- Vanilla JavaScript for authentication, member operations, billing, activity UI, and chatbot integration

### Backend

- Node.js runtime
- Express.js web framework
- CORS middleware
- dotenv for environment variables
- Anthropic SDK for optional AI responses

### Storage

- `localStorage` for members and persistent UI preferences
- `sessionStorage` for login/chat session state

## 6. Functional Requirements

### Administrator

1. Log in as administrator.
2. Register a member with name, username, password, email, and phone.
3. View registered members.
4. Assign one of the predefined membership packages or use a fee value.
5. Mark a member present for the current date.
6. Generate a bill.
7. View and print the latest receipt.
8. See dashboard totals such as member count, attendance, and amount collected.

### Member

1. Log in with credentials created by the administrator.
2. Navigate through general gym pages.
3. View personal activity information derived from the stored member record.
4. Access the workout builder.
5. Review diet plans and supplement information.
6. Use the chatbot for common gym questions.

### Chatbot

1. Accept a message and session ID.
2. Keep a short conversation history in server memory.
3. Use Anthropic when configured.
4. Fall back to predefined gym-specific responses when AI is not configured.
5. Return JSON responses to the browser widget.

## 7. Non-Functional Requirements

- Responsive interface
- Clear navigation
- Reasonable performance for a small academic dataset
- Readable and modular frontend code
- Secret/API key separation through environment variables
- Graceful chatbot behavior without an AI key

## 8. System Architecture

The frontend executes mainly in the browser. Authentication, member data, attendance, packages, and bills are stored locally on that browser. The chatbot sends HTTP requests to an Express backend. The backend either calls the configured AI service or returns a built-in fallback response.

See `PROJECT_BLUEPRINT.md` for architecture, data-flow, and role diagrams.

## 9. Main Modules

### 9.1 Authentication Module

`js/auth.js` handles login state, role checks, member lookup, and logout. Authentication state is stored in `sessionStorage` so it is scoped to the current browser session.

### 9.2 Member Registration Module

`register.html` is restricted to the admin role. It validates the new member username and password length, then adds a structured member object to the members array in `localStorage`.

### 9.3 Member Administration Module

`js/members-admin.js` provides the primary administrative operations:

- normalize member data
- assign packages
- mark attendance
- create bills
- calculate totals
- generate receipt HTML
- print receipts

### 9.4 Activity and Workout Module

The activity page shows member-oriented summaries and includes an interactive workout builder. Workout content is grouped by fitness focus/muscle group and rendered dynamically through JavaScript.

### 9.5 Chatbot Module

The chatbot has two layers:

- `js/chatbot.js` builds the UI, sends requests, tracks the client session, and renders answers.
- `server/server.js` exposes `/api/chat`, `/api/chat/clear-session`, and `/api/health`.

### 9.6 Content Modules

The project includes separate pages for Home, About, Diet Plans, Supplement Store, Gallery, and Contact. These pages make the project suitable for both administration and a member-facing gym website demonstration.

## 10. Data Design

The member object is the core data structure. A member can contain:

```text
id
name
username
password
email
phone
registeredAt
attendanceLog[]
assignedPackage{}
bills[]
```

An assigned package can contain a key, name, fee, duration, and assignment date. A bill can contain an ID, receipt number, package name, payment amount, and creation time.

## 11. Membership Package Logic

The admin module includes predefined packages:

- Basic Monthly — Rs 1,200
- Standard Monthly — Rs 1,800
- Premium Monthly — Rs 2,600
- Quarterly Saver — Rs 4,800
- Annual Pro — Rs 16,000

The assigned package is stored inside the member record and used as the default billing amount.

## 12. Attendance Logic

Attendance is represented as an array of date strings. When an admin marks attendance, the current date is added if it has not already been recorded. The admin dashboard can calculate today's presence and the member activity page can summarize visits.

## 13. Billing and Receipt Logic

When a bill is created, the system generates a bill object and a receipt number. The bill is appended to the member's bill history. Receipt HTML is created dynamically and opened in a separate browser window, where the user can print it.

## 14. Chatbot Logic

The server stores recent messages in a `Map` keyed by session ID. If `ANTHROPIC_API_KEY` is available and the SDK initializes successfully, the server sends the recent conversation to the AI model with a gym-specific system prompt. If not, keyword-based fallback replies answer common questions such as timings, membership, trainers, diet, supplements, and visits.

## 15. Testing Strategy

The project can be tested module-by-module:

- invalid/valid login
- role-based page protection
- duplicate member prevention
- package assignment
- attendance duplicate prevention
- bill generation
- receipt rendering/printing
- member activity display
- theme persistence
- chatbot API health
- chatbot fallback mode
- responsive navigation

A full manual test table is included in `TESTING.md`.

## 16. Security Considerations

The existing authentication model is intentionally simple for an academic project. Credentials stored in JavaScript or browser storage are not secure for real users. A production version should use a backend database, hashed passwords, secure sessions/tokens, server-side authorization, HTTPS, validation, and rate limiting.

## 17. Advantages

- Simple to understand and demonstrate
- Does not require a database for the classroom demo
- Clear separation between frontend and chatbot backend
- Covers multiple realistic gym operations
- Easy to extend into a full-stack database application
- Suitable for GitHub portfolio presentation

## 18. Limitations

- Data is tied to one browser profile.
- Clearing browser storage deletes records.
- Credentials are visible to users who inspect source/storage.
- Multiple administrators cannot share data centrally.
- The chatbot's server-side conversation history is temporary.
- External media can fail if third-party sources become unavailable.

## 19. Future Scope

A stronger second version can introduce:

- Express REST API for all gym data
- MySQL/PostgreSQL/MongoDB database
- password hashing and secure authentication
- cloud deployment
- member profile editing
- trainer management
- class scheduling
- online fee payments
- downloadable invoice PDFs
- workout progress tracking
- body measurements and charts
- notifications and membership expiry reminders
- automated testing and CI/CD

## 20. Conclusion

The Wellness Gym Management System successfully demonstrates the key ideas of a small gym portal: user roles, member registration, attendance, package management, billing, fitness content, and an interactive chatbot. Its browser-storage architecture keeps the academic version easy to run, while the Node.js chatbot demonstrates backend/API integration. The project also provides a clear path for future conversion into a secure database-driven full-stack application.

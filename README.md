# 🏋️ Wellness Gym Management System

A responsive **Gym Management System** created as a college project using **HTML, CSS, JavaScript, Node.js, and Express**. It provides separate admin/member workflows, member registration, attendance, membership packages, billing/receipts, workout guidance, diet plans, a supplement section, and an optional AI-powered gym assistant.

> **Project status:** Academic / portfolio project. The current authentication and member storage are browser-based and are not intended for production use.

## ✨ Main Features

- Admin and member login flow
- Admin-only member registration
- Member list with dashboard statistics
- Membership package assignment
- Daily attendance tracking
- Billing and printable receipt generation
- Member activity and payment history
- Interactive workout builder for multiple fitness goals
- Diet plan pages for weight loss and weight gain
- Supplement store showcase
- Gallery, About, Home, and Contact pages
- Dark/light theme persistence
- Responsive UI for desktop and mobile
- Floating gym chatbot
- Optional Anthropic-powered conversational responses
- Local fallback chatbot responses when no AI key is configured

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Storage | Browser `localStorage` / `sessionStorage` |
| AI Chatbot | Anthropic SDK (optional) |
| Styling | Custom CSS, Google Fonts |
| Contact Form | FormSubmit integration |

## 📁 Repository Structure

```text
Gym-Management-System/
├── README.md
├── .gitignore
├── SECURITY.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── docs/
│   ├── PROJECT_BLUEPRINT.md
│   ├── PROJECT_REPORT.md
│   ├── SETUP_AND_RUN.md
│   ├── TESTING.md
│   ├── VIVA_QA.md
│   ├── SCREENSHOTS.md
│   └── GITHUB_UPLOAD_GUIDE.md
└── gym-website/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── members.html
    ├── activity.html
    ├── diet-plans.html
    ├── supplement-store.html
    ├── gallery.html
    ├── about.html
    ├── contact.html
    ├── css/
    ├── js/
    ├── images/
    └── server/
        ├── server.js
        ├── package.json
        ├── package-lock.json
        └── .env.template
```

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Gym-Management-System
```

### 2. Install chatbot backend dependencies

```bash
cd gym-website/server
npm install
```

### 3. Configure environment variables (optional AI chatbot)

Copy `.env.template` to `.env`:

```env
ANTHROPIC_API_KEY=your_api_key_here
PORT=5000
NODE_ENV=development
```

The project still works without an Anthropic key; the chatbot uses built-in fallback responses.

### 4. Start the backend

```bash
npm start
```

### 5. Open the website

For the simplest local demo, open:

```text
gym-website/login.html
```

in your browser. When opened via `file://`, the chatbot automatically targets `http://localhost:5000/api/chat`.

For more run options and Live Server notes, see [Setup & Run Guide](docs/SETUP_AND_RUN.md).

## 🔐 Demo Authentication

For the academic demo, the configured administrator login is:

```text
Username: Admin123
Password: @Branch
```

The current project uses client-side demo authentication and these values are stored in `gym-website/js/auth.js`. Because the repository may be public, **do not reuse these credentials or this authentication approach for a real deployed gym system**. Member passwords are also stored in browser `localStorage` in the current academic version.

See [Security Notes](SECURITY.md) for recommended production improvements.

## 🧠 System Design

The application has three major parts:

1. **Frontend UI** — pages, theme, forms, activity views, admin/member workflows.
2. **Browser storage** — member profiles, attendance, package data, bills, and login session.
3. **Express chatbot service** — chat API, session history, optional Anthropic integration, and fallback replies.

Full diagrams and flows are available in the [Project Blueprint](docs/PROJECT_BLUEPRINT.md).

## 📚 Documentation

- [Project Blueprint](docs/PROJECT_BLUEPRINT.md) — architecture, flows, data model, page map
- [Complete Project Report](docs/PROJECT_REPORT.md) — college-ready technical documentation
- [Setup & Run Guide](docs/SETUP_AND_RUN.md) — installation and local execution
- [Testing Guide](docs/TESTING.md) — functional test cases and verification checklist
- [Viva Questions & Answers](docs/VIVA_QA.md) — project viva preparation
- [Screenshots Guide](docs/SCREENSHOTS.md) — recommended screenshots for GitHub/college report
- [GitHub Upload Guide](docs/GITHUB_UPLOAD_GUIDE.md) — repository creation and push commands
- [Code Review Notes](docs/CODE_REVIEW_NOTES.md) — important public-repo/security cleanup findings
- [Chatbot Setup](gym-website/CHATBOT_SETUP.md) — AI chatbot configuration

## ✅ Verified in This Package

- JavaScript syntax check passed for the main JS files.
- `server.js` syntax check passed.
- Express backend health endpoint responded successfully.
- Package is cleaned of `.venv`, `node_modules`, local editor files, and backup images.

## ⚠️ Current Limitations

- No database; member data is saved per browser/device.
- Client-side credentials are visible in source code.
- Member passwords are not hashed.
- Attendance and billing records are not synchronized across devices.
- AI chatbot conversation history is stored only in server memory.
- Some workout/media content depends on third-party URLs.
- Contact form contains a configured recipient email that becomes public when the repo is public.

## 🔮 Future Improvements

- Replace `localStorage` with MySQL/PostgreSQL/MongoDB
- Add server-side authentication with password hashing and JWT/session cookies
- Add proper admin roles and authorization middleware
- Build CRUD REST APIs for members, payments, packages, and attendance
- Add payment gateway integration
- Add member progress charts and BMI/body measurement history
- Add automated tests and CI workflow
- Deploy frontend and backend with secure environment variables
- Add rate limiting, validation, logging, and secure CORS configuration

## 🎓 Academic Use

This repository is suitable for a college demonstration, viva, portfolio showcase, and further learning. Before using it with real users or real personal data, implement the security and persistence improvements described above.

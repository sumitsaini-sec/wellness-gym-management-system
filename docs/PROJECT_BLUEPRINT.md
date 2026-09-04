# Project Blueprint — Wellness Gym Management System

## 1. Project Goal

Build a browser-based gym management portal that allows an administrator to register and manage members while giving members access to gym information, activity history, workouts, diet guidance, and a chatbot assistant.

## 2. High-Level Architecture

```mermaid
flowchart LR
    U[User Browser] --> UI[HTML / CSS / JavaScript Frontend]
    UI --> AUTH[Client-side Authentication]
    UI --> STORE[(localStorage / sessionStorage)]
    UI --> CHAT[Chatbot Widget]
    CHAT --> API[Node.js + Express Chat API]
    API --> AI{Anthropic API Key?}
    AI -- Yes --> CLAUDE[Anthropic Model]
    AI -- No --> FALLBACK[Built-in Fallback Replies]
    CLAUDE --> API
    FALLBACK --> API
    API --> CHAT
```

## 3. Role Flow

```mermaid
flowchart TD
    A[Open Login Page] --> B{Credentials valid?}
    B -- No --> C[Show Login Error]
    B -- Yes --> D{Role}
    D -- Admin --> E[Admin Navigation]
    D -- Member --> F[Member Navigation]
    E --> G[Register Member]
    E --> H[View Members]
    H --> I[Assign Package]
    H --> J[Mark Attendance]
    H --> K[Create Bill / Print Receipt]
    F --> L[View Activity]
    F --> M[Workout Builder]
    F --> N[Diet Plans]
    F --> O[Supplements / General Pages]
```

## 4. Admin Workflow

```mermaid
flowchart LR
    LOGIN[Admin Login] --> REGISTER[Register New Member]
    REGISTER --> SAVE[Save Member in localStorage]
    SAVE --> LIST[Members Dashboard]
    LIST --> PACKAGE[Assign Membership Package]
    LIST --> ATTEND[Mark Daily Attendance]
    LIST --> BILL[Generate Bill]
    BILL --> RECEIPT[View / Print Receipt]
```

## 5. Member Workflow

```mermaid
flowchart LR
    LOGIN[Member Login] --> HOME[Home]
    HOME --> ACTIVITY[My Activity]
    ACTIVITY --> ATT[Attendance Summary]
    ACTIVITY --> PAY[Payment History]
    ACTIVITY --> WORKOUT[Interactive Workout Builder]
    HOME --> DIET[Diet Plans]
    HOME --> STORE[Supplement Store]
    HOME --> CHAT[Gym Assistant]
```

## 6. Chatbot Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as Chat Widget
    participant S as Express Server
    participant A as Anthropic API

    U->>W: Enter gym question
    W->>S: POST /api/chat
    alt API key configured
        S->>A: Send prompt + recent history
        A-->>S: AI response
    else No API key / SDK unavailable
        S->>S: Generate fallback response
    end
    S-->>W: JSON response
    W-->>U: Render assistant message
```

## 7. Logical Data Model

The academic version stores data in the browser rather than a database.

```mermaid
erDiagram
    MEMBER ||--o{ ATTENDANCE : has
    MEMBER ||--o{ BILL : receives
    MEMBER }o--o| PACKAGE : assigned

    MEMBER {
        string id
        string name
        string username
        string password
        string email
        string phone
        datetime registeredAt
    }

    ATTENDANCE {
        date attendanceDate
    }

    PACKAGE {
        string key
        string name
        number fee
        number durationMonths
        datetime assignedAt
    }

    BILL {
        string id
        string receiptNo
        string packageName
        number amount
        datetime createdAt
    }
```

## 8. Browser Storage Design

### `sessionStorage`

- `wellness_gym_auth` — current logged-in user/role
- `chatbot_session_id` — chatbot session identifier

### `localStorage`

- `wellness_gym_members` — members, attendance, packages, bills
- `wellness_gym_theme` — light/dark UI preference

## 9. Page Map

```mermaid
flowchart TD
    LOGIN[login.html] --> HOME[index.html]
    HOME --> ABOUT[about.html]
    HOME --> ACTIVITY[activity.html]
    HOME --> DIET[diet-plans.html]
    HOME --> STORE[supplement-store.html]
    HOME --> GALLERY[gallery.html]
    HOME --> CONTACT[contact.html]
    HOME --> REGISTER[register.html - Admin]
    HOME --> MEMBERS[members.html - Admin]
```

## 10. Module Breakdown

| Module | Main Files | Responsibility |
|---|---|---|
| Authentication | `js/auth.js`, `login.html` | Login, logout, role checks |
| Member Registration | `register.html` | Create member records |
| Admin Member Management | `members.html`, `js/members-admin.js` | Packages, attendance, bills, receipts |
| Activity | `activity.html`, `js/script.js` | Member summaries and workout UI |
| Chatbot Frontend | `js/chatbot.js`, `css/chatbot.css` | Chat widget and client requests |
| Chatbot Backend | `server/server.js` | Chat API, conversation history, AI/fallback replies |
| Common UI | `css/style.css`, `js/script.js` | Theme, animation, navigation, forms |

## 11. Core Membership Packages

| Package | Fee | Duration |
|---|---:|---:|
| Basic Monthly | Rs 1,200 | 1 month |
| Standard Monthly | Rs 1,800 | 1 month |
| Premium Monthly | Rs 2,600 | 1 month |
| Quarterly Saver | Rs 4,800 | 3 months |
| Annual Pro | Rs 16,000 | 12 months |

## 12. Deployment Blueprint

### Current academic deployment

```text
Browser
├── Static HTML/CSS/JS
├── localStorage/sessionStorage
└── Chat request → Node/Express server → Anthropic or fallback
```

### Recommended production architecture

```mermaid
flowchart LR
    B[Browser] --> FE[Frontend]
    FE --> BE[Secure Backend API]
    BE --> DB[(Database)]
    BE --> AUTH[Authentication + Authorization]
    BE --> CHAT[Chat Service]
    CHAT --> LLM[AI Provider]
```

This migration would replace browser-only storage and client-side credentials with secure server-side services.

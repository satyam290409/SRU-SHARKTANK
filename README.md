# SRU Mini Shark Tank

A complete, production-quality web application for the SRU Startup & Innovation Club's Mini Shark Tank event. Built with a modern tech stack and featuring a premium startup/venture-capital visual identity.

## Features

- **Role-Based Access Control**: Separate portals for Admin, Participants, and Voters.
- **Real-Time Voting**: Audience voters receive configurable virtual investment credits (e.g., 100 credits = ₹5,000,000 virtual investment).
- **Admin Dashboard**: Total control over the event state, startups, participants, and visibility.
- **Live Leaderboard**: Projector-optimized leaderboard that auto-updates via Socket.IO.
- **Dynamic Results Reveal**: Dramatic reveal sequence for final rankings.
- **Security & Validation**: Server-side validations prevent negative allocations, over-allocations, double-voting, and self-voting.
- **QR Code Integration**: Admin can generate and download login QR codes for voters and participants.

## Architecture

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand
- **Backend**: Node.js, Express, TypeScript, SQLite (better-sqlite3)
- **ORM**: Drizzle ORM
- **Authentication**: JWT via HTTP-only Cookies
- **Real-time**: Socket.IO

## Folder Structure

```
shark-tank/
├── client/          # React frontend application
│   ├── public/      # Static assets and favicon
│   ├── src/         # Frontend source code
│   │   ├── components/ # UI and role-specific components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # API client and socket configuration
│   │   ├── pages/      # Route pages (Admin, Voter, Participant)
│   │   ├── stores/     # Zustand state management
│   │   └── types/      # Shared TypeScript definitions
├── server/          # Node.js Express backend
│   ├── src/         # Backend source code
│   │   ├── db/         # Drizzle ORM schema, index, migrate, and seed
│   │   ├── middleware/ # Authentication and upload handling
│   │   ├── routes/     # Express route controllers
│   │   └── utils/      # JWT, Password, and Validation utilities
│   └── uploads/     # Stored startup images
└── shared/          # Future shared utilities
```

## Environment Variables

A `.env` file should be present in the root directory.

```env
PORT=3001
JWT_SECRET=sru-shark-tank-jwt-secret-2026-super-secure-key
ADMIN_EMAIL=admin@srushark.com
ADMIN_PASSWORD=SharkAdmin@2026
DEFAULT_PARTICIPANT_PASSWORD=shark@2026
DEFAULT_VOTER_PASSWORD=sharkvoter@2026
CREDIT_POOL=100
VIRTUAL_INVESTMENT_VALUE=50000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_PATH=./server/shark-tank.db
```

## Setup & Execution

**1. Install Dependencies**
```bash
npm run install:all
```

**2. Database Setup & Seed**
The database relies on portable SQLite and requires no external servers.
```bash
npm run seed
```
This populates the database with default settings, an active voting round, and 8 demo startups (GreenLoop, AgriNext, etc.).

**3. Run Development Server**
```bash
npm run dev
```
The frontend is available at `http://localhost:5173` and the backend at `http://localhost:3001`.

## Demo Accounts

**Admin**
- Email: `admin@srushark.com`
- Password: `SharkAdmin@2026`

**Voter**
- Name: `Demo Voter`
- Enrollment: `SRUVOTER001` (Or any unique string if not seeded)
- Password: `sharkvoter@2026`

**Participant**
- Name: `Participant for GreenLoop`
- Enrollment: `SRU2026001`
- Password: `shark@2026`

## Important Voting Logic Notes

1. **Credit Allocation**: Validated purely on the server. The frontend gracefully handles max-allocations, but all calculations persist in a strict SQL transaction.
2. **Self-Voting**: If `preventSelfVoting` is enabled, the backend ensures the enrollment number of the voter doesn't match the participant representing the startup they vote for.
3. **Event State**: Admin must transition the event state through `Open Voting -> Close Voting -> Reveal Results` for the event flow to properly trigger the projector animations.

## Security Notes

* This system relies on robust HttpOnly secure cookies for JWT authentication to prevent XSS.
* Validations are powered strictly by Zod in Express middlewares.
* Avoid exposing `shark-tank.db` inside any public directory.

# UrbanResQ — Backend Services & Database Engine

High-performance, transactional Node.js and TypeScript backend for the UrbanResQ Emergency Operations Center platform.

## Architecture

- **Runtime**: Node.js, Express, TypeScript
- **Real-Time Layer**: Socket.IO WebSocket server with heartbeat monitoring
- **Data Layer**: MySQL 8.4 connection pool with ACID transactional stored procedures
- **Validation**: Zod runtime schema validation
- **Security**: JWT authentication, 7-tier Role-Based Access Control (RBAC), Helmet HTTP headers, express rate limiting, and bcrypt hashing

## Directory Structure

```
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── socket/
│   ├── types/
│   └── index.ts
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

## Setup & Running

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Run integration and unit tests:
```bash
npm test
```

Build production bundle:
```bash
npm run build
```

# ContractCommander

ContractCommander is a contract risk analysis tool. It helps teams upload
contracts, break them into clauses, and surface potential risk findings.

This repository currently contains the project scaffolding only — no
contract-analysis logic has been implemented yet.

## Structure

```
.
├── client/   React + TypeScript frontend (Vite)
└── server/   Node.js + Express + TypeScript backend (Prisma + PostgreSQL)
```

### Client (`/client`)

- Vite + React + TypeScript
- `src/components` — reusable UI components
- `src/pages` — top-level page components
- `src/lib` — shared client-side utilities (e.g. API config)

### Server (`/server`)

- Express + TypeScript
- `GET /health` — returns `{ status: "ok" }`
- Prisma schema with placeholder models: `Contract`, `Clause`, `RiskFinding`

## Prerequisites

- Node.js 18+
- npm
- A running PostgreSQL instance

## Setup

1. Install dependencies from the repo root (this installs both workspaces):

   ```bash
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

   Edit `server/.env` and set `DATABASE_URL` to point at your PostgreSQL
   instance.

3. Generate the Prisma client (and run migrations once you have models you
   want to persist):

   ```bash
   npm run prisma:generate --workspace server
   ```

## Development

Run both the client and server together:

```bash
npm run dev
```

Or run them individually:

```bash
npm run dev:client   # Vite dev server
npm run dev:server   # Express server with hot reload
```

## Build

```bash
npm run build
```

## Type checking

```bash
npm run typecheck
```

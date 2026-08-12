# ContractCommander

ContractCommander is a contract risk analysis tool. It helps teams upload
contracts, break them into clauses, and surface potential risk findings.

Uploaded contracts are analyzed by a small pipeline of Claude-powered agents:
a **Commander** tags each clause with the risk categories it touches
(liability, IP, termination, data/privacy, dispute), five **category
sub-agents** review their tagged clauses and produce findings, a **Critic**
merges and deduplicates those findings and flags disagreements, and a plain
code **Aggregator** turns the result into an overall risk score and a
grouped report. The frontend does not yet render any of this — it's
backend/API only for now.

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

- Express + TypeScript, Prisma models `Contract`, `Clause`, `RiskFinding`
- `GET /health` — returns `{ status: "ok" }`
- `POST /api/contracts/upload` — accepts a PDF or text file (multipart field
  `file`), extracts text (`pdf-parse` for PDFs), splits it into clauses by
  heading/paragraph structure, persists `Contract` + `Clause` rows, then runs
  the analysis pipeline and persists `RiskFinding` rows.
- `GET /api/contracts/:id/report` — returns
  `{ riskScore, categoryCounts, findings }` for a previously analyzed
  contract.
- `src/agents/` — the commander, five category sub-agents, and critic:
  prompts live in `src/agents/prompts/`, structured JSON output is enforced
  via Zod schemas (`client.messages.parse` + `zodOutputFormat`) in
  `src/agents/types.ts`.
- `src/services/aggregator.ts` — plain code (no LLM call) that computes the
  risk score and buckets findings into 🔴 High Risk / 🟠 Review / 🟢 Low
  Concern groups.

## Prerequisites

- Node.js 18+
- npm
- A running PostgreSQL instance
- An Anthropic API key (for the analysis pipeline — see `server/.env.example`)

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
   instance, and `ANTHROPIC_API_KEY` to a valid Anthropic API key.

3. Generate the Prisma client and create the database tables:

   ```bash
   npm run prisma:generate --workspace server
   npx --workspace server prisma migrate dev --name init
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

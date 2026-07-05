# GymPro — Gerenciador de Academia

A full-stack gym management system with a Portuguese-language UI for managing student registrations, plan tracking, and dashboard statistics.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/gym-manager run dev` — run the frontend (port 24266)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: SQLite via `better-sqlite3` (file: `artifacts/api-server/gym.db`)
- Validation: Zod (`zod/v4`) via generated Orval schemas
- Frontend: React 19 + Vite 7 + Tailwind CSS v4
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/src/generated/` — React Query hooks (auto-generated)
- `lib/api-zod/src/generated/` — Zod schemas for server validation (auto-generated)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/db.ts` — SQLite singleton with table creation
- `artifacts/api-server/gym.db` — SQLite database file
- `artifacts/gym-manager/src/` — React frontend

## Architecture decisions

- SQLite chosen over PostgreSQL for simplicity and zero-config persistence in a single-server gym management context.
- OpenAPI-first: all endpoints defined in `openapi.yaml`, Zod schemas and React Query hooks auto-generated via Orval.
- `better-sqlite3` externalized in esbuild config (already present) and listed in `onlyBuiltDependencies` in pnpm-workspace.yaml.
- `enrollmentDate` Zod coercion: the generated Zod schema coerces `enrollmentDate` to a `Date` object; the route converts it back to a `YYYY-MM-DD` string before SQLite binding.

## Product

- **Dashboard** — stat cards for total students, active enrollments (last 30 days), and annual plans
- **Cadastrar Novo Aluno** — form to register students with name, plan (Mensal/Trimestral/Anual), and enrollment date
- **Alunos Cadastrados** — table with colored plan badges, formatted dates, and delete button per row

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any change to `lib/api-spec/openapi.yaml`, re-run codegen before touching generated types.
- `better-sqlite3` requires a native build — it's in `onlyBuiltDependencies` in `pnpm-workspace.yaml`. Run `pnpm install` after adding new native deps.
- API server must be built before starting (`pnpm --filter @workspace/api-server run build`).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

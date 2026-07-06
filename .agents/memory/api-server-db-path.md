---
name: API Server SQLite DB path resolution
description: The gym.db file resolves to artifacts/gym.db (not artifacts/api-server/gym.db) due to esbuild bundling changing __dirname to the dist/ directory.
---

The `db.ts` source uses `path.resolve(__dirname, "../../gym.db")`. In source, `__dirname` = `artifacts/api-server/src/lib/`, so `../../` goes up to `artifacts/api-server/` (correct). But after esbuild bundles everything into `dist/index.mjs`, `__dirname` becomes `artifacts/api-server/dist/`, so `../../` goes up to `artifacts/` — making the actual DB path `artifacts/gym.db`, not `artifacts/api-server/gym.db`.

**Why:** esbuild rewrites `__dirname` to the compiled bundle's directory, not the source file's directory.

**How to apply:** When deleting the DB to force schema recreation, delete `artifacts/gym.db`, not `artifacts/api-server/gym.db`. Also include a schema migration in `db.ts` using `PRAGMA table_info()` to handle existing DBs with old schema.

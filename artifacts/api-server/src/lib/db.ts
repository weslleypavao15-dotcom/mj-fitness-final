import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required but was not set.");
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  // Most hosted PostgreSQL providers (Supabase, Neon, Railway, etc.) require SSL.
  // rejectUnauthorized: false accepts self-signed certs from the provider's CA.
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// ── Schema bootstrap (idempotent) ─────────────────────────────────────────────
export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id               SERIAL PRIMARY KEY,
      name             TEXT    NOT NULL,
      cpf              TEXT,
      telefone         TEXT,
      plano            TEXT,
      forma_pagamento  TEXT,
      enrollment_date  DATE    NOT NULL,
      data_vencimento  DATE    NOT NULL,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS historico_financeiro (
      id               SERIAL PRIMARY KEY,
      student_id       INTEGER       NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      student_name     TEXT          NOT NULL,
      amount           NUMERIC(10,2) NOT NULL DEFAULT 100.00,
      payment_date     DATE          NOT NULL,
      forma_pagamento  TEXT,
      created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );
  `);
}

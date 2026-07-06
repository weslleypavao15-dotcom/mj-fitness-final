import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../../gym.db");

let _db: ReturnType<typeof Database> | null = null;

export function getDb(): ReturnType<typeof Database> {
  if (_db) return _db;

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  // Create tables (idempotent — full current schema)
  _db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cpf TEXT,
      telefone TEXT,
      plano TEXT,
      forma_pagamento TEXT,
      enrollment_date TEXT NOT NULL,
      data_vencimento TEXT NOT NULL DEFAULT (date('now', '+1 month')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS historico_financeiro (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      student_name TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 100.00,
      payment_date TEXT NOT NULL,
      forma_pagamento TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ── Column-level migrations (idempotent) ──────────────────────────────────
  const studentCols = (_db.prepare("PRAGMA table_info(students)").all() as { name: string }[]).map(
    (c) => c.name
  );
  const historicoCols = (
    _db.prepare("PRAGMA table_info(historico_financeiro)").all() as { name: string }[]
  ).map((c) => c.name);

  if (!studentCols.includes("data_vencimento")) {
    _db.exec(`
      ALTER TABLE students ADD COLUMN data_vencimento TEXT NOT NULL DEFAULT (date('now', '+1 month'));
      UPDATE students SET data_vencimento = date(enrollment_date, '+1 month')
        WHERE data_vencimento = date('now', '+1 month') OR data_vencimento IS NULL;
    `);
  }
  if (!studentCols.includes("cpf")) {
    _db.exec("ALTER TABLE students ADD COLUMN cpf TEXT;");
  }
  if (!studentCols.includes("telefone")) {
    _db.exec("ALTER TABLE students ADD COLUMN telefone TEXT;");
  }
  if (!studentCols.includes("plano")) {
    _db.exec("ALTER TABLE students ADD COLUMN plano TEXT;");
  }
  if (!studentCols.includes("forma_pagamento")) {
    _db.exec("ALTER TABLE students ADD COLUMN forma_pagamento TEXT;");
  }
  if (!historicoCols.includes("forma_pagamento")) {
    _db.exec("ALTER TABLE historico_financeiro ADD COLUMN forma_pagamento TEXT;");
  }

  // ── Legacy `plan` column → backfill `plano` before dropping ──────────────
  // (old schema used `plan TEXT`, new schema uses `plano TEXT`)
  if (studentCols.includes("plan")) {
    // Copy non-null plan values into the new plano column
    _db.exec("UPDATE students SET plano = plan WHERE plan IS NOT NULL AND plano IS NULL;");
    try {
      _db.exec("ALTER TABLE students DROP COLUMN plan;");
    } catch {
      // SQLite < 3.35 doesn't support DROP COLUMN — safe to ignore; column stays unused
    }
  }

  // ── Legacy `payments` table → migrate into historico_financeiro ───────────
  // Only runs once; inserts rows whose student_id + payment_date don't exist yet.
  const tables = (
    _db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='payments'").get()
  );
  if (tables) {
    _db.exec(`
      INSERT OR IGNORE INTO historico_financeiro (student_id, student_name, amount, payment_date, created_at)
        SELECT p.student_id,
               COALESCE(s.name, 'Desconhecido'),
               p.amount,
               p.payment_date,
               p.created_at
        FROM payments p
        LEFT JOIN students s ON s.id = p.student_id;
    `);
  }

  return _db;
}

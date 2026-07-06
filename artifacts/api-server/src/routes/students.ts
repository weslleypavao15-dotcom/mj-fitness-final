import { Router } from "express";
import { getDb } from "../lib/db";
import { CreateStudentBody, DeleteStudentParams, RenewStudentParams, RenewStudentBody } from "@workspace/api-zod";

const router = Router();

/** Plan name → monthly fee mapping. Update here for future pricing changes. */
const PLAN_FEES: Record<string, number> = {
  "Plano Mensal": 100.0,
};
const DEFAULT_FEE = 100.0;

function getPlanFee(plano: string): number {
  return PLAN_FEES[plano] ?? DEFAULT_FEE;
}

/** Add exactly one month to a YYYY-MM-DD string, handling month-end edge cases. */
function addOneMonth(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z"); // noon UTC avoids DST shifts
  const month = d.getUTCMonth();
  d.setUTCMonth(month + 1);
  if (d.getUTCMonth() !== ((month + 1) % 12)) {
    d.setUTCDate(0);
  }
  return d.toISOString().split("T")[0];
}

/** Compute "Em Dia" or "Atrasada" relative to today's date. */
function computeStatus(dataVencimento: string): "Em Dia" | "Atrasada" {
  const today = new Date().toISOString().split("T")[0];
  return dataVencimento >= today ? "Em Dia" : "Atrasada";
}

type StudentRow = {
  id: number;
  name: string;
  cpf: string | null;
  telefone: string | null;
  plano: string | null;
  formaPagamento: string | null;
  enrollmentDate: string;
  dataVencimento: string;
  createdAt: string;
};

// GET /students
router.get("/students", (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, name, cpf, telefone, plano,
              forma_pagamento AS formaPagamento,
              enrollment_date AS enrollmentDate,
              data_vencimento AS dataVencimento,
              created_at AS createdAt
       FROM students ORDER BY id DESC`
    )
    .all() as StudentRow[];

  const students = rows.map((r) => ({
    ...r,
    status: computeStatus(r.dataVencimento),
  }));

  res.json(students);
});

// POST /students
router.post("/students", (req, res) => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, cpf, telefone, plano, formaPagamento, enrollmentDate } = parsed.data;

  const enrollmentDateStr =
    enrollmentDate instanceof Date
      ? enrollmentDate.toISOString().split("T")[0]
      : String(enrollmentDate);

  const dataVencimento = addOneMonth(enrollmentDateStr);
  const fee = getPlanFee(plano);
  const db = getDb();

  const student = db
    .prepare(
      `INSERT INTO students (name, cpf, telefone, plano, forma_pagamento, enrollment_date, data_vencimento, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
       RETURNING id, name, cpf, telefone, plano,
                 forma_pagamento AS formaPagamento,
                 enrollment_date AS enrollmentDate,
                 data_vencimento AS dataVencimento,
                 created_at AS createdAt`
    )
    .get(name, cpf, telefone, plano, formaPagamento, enrollmentDateStr, dataVencimento) as StudentRow;

  // Auto-create initial payment in historico_financeiro
  db.prepare(
    `INSERT INTO historico_financeiro (student_id, student_name, amount, payment_date, forma_pagamento, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`
  ).run(student.id, name, fee, enrollmentDateStr, formaPagamento);

  res.status(201).json({ ...student, status: computeStatus(dataVencimento) });
});

// DELETE /students/:id
router.delete("/students/:id", (req, res) => {
  const parsed = DeleteStudentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const db = getDb();
  const result = db.prepare("DELETE FROM students WHERE id = ?").run(parsed.data.id);

  if (result.changes === 0) {
    res.status(404).json({ error: "Aluno não encontrado" });
    return;
  }

  res.json({ message: "Aluno removido com sucesso" });
});

// POST /students/:id/renovar
router.post("/students/:id/renovar", (req, res) => {
  const paramsParsed = RenewStudentParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const bodyParsed = RenewStudentBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Forma de pagamento obrigatória" });
    return;
  }

  const { formaPagamento } = bodyParsed.data;
  const db = getDb();

  const existing = db
    .prepare(
      `SELECT id, name, cpf, telefone, plano,
              forma_pagamento AS formaPagamento,
              enrollment_date AS enrollmentDate,
              data_vencimento AS dataVencimento,
              created_at AS createdAt
       FROM students WHERE id = ?`
    )
    .get(paramsParsed.data.id) as StudentRow | undefined;

  if (!existing) {
    res.status(404).json({ error: "Aluno não encontrado" });
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  // Extend from the current due date if not yet expired; otherwise extend from today.
  // This prevents shortening an active subscription when renewing early.
  const baseDate = existing.dataVencimento >= today ? existing.dataVencimento : today;
  const novaVencimento = addOneMonth(baseDate);
  const fee = getPlanFee(existing.plano ?? "Plano Mensal");

  db.prepare("UPDATE students SET data_vencimento = ? WHERE id = ?").run(
    novaVencimento,
    existing.id
  );

  db.prepare(
    `INSERT INTO historico_financeiro (student_id, student_name, amount, payment_date, forma_pagamento, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`
  ).run(existing.id, existing.name, fee, today, formaPagamento);

  res.json({
    ...existing,
    dataVencimento: novaVencimento,
    status: "Em Dia",
  });
});

export default router;

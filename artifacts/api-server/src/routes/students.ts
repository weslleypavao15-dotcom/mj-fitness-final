import { Router } from "express";
import { pool } from "../lib/db";
import { CreateStudentBody, DeleteStudentParams, RenewStudentParams, RenewStudentBody } from "@workspace/api-zod";

const router = Router();

/** Plan name → monthly fee mapping. */
const PLAN_FEES: Record<string, number> = {
  "Plano Mensal": 100.0,
};
const DEFAULT_FEE = 100.0;

function getPlanFee(plano: string): number {
  return PLAN_FEES[plano] ?? DEFAULT_FEE;
}

/** Add exactly one calendar month to a YYYY-MM-DD string, clamping month-end overflows. */
function addOneMonth(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  const month = d.getUTCMonth();
  d.setUTCMonth(month + 1);
  if (d.getUTCMonth() !== ((month + 1) % 12)) d.setUTCDate(0);
  return d.toISOString().split("T")[0];
}

/** Compute "Em Dia" or "Atrasada" relative to today. */
function computeStatus(dataVencimento: string): "Em Dia" | "Atrasada" {
  const today = new Date().toISOString().split("T")[0];
  return dataVencimento >= today ? "Em Dia" : "Atrasada";
}

/** Normalize a pg Date column (may come back as Date object or ISO string) to YYYY-MM-DD. */
function toDateStr(val: Date | string): string {
  if (val instanceof Date) return val.toISOString().split("T")[0];
  return String(val).split("T")[0];
}

// GET /students
router.get("/students", async (_req, res) => {
  const { rows } = await pool.query<{
    id: number; name: string; cpf: string | null; telefone: string | null;
    plano: string | null; formapagamento: string | null;
    enrollmentdate: Date | string; datavencimento: Date | string; createdat: Date | string;
  }>(
    `SELECT id, name, cpf, telefone, plano,
            forma_pagamento   AS formapagamento,
            enrollment_date   AS enrollmentdate,
            data_vencimento   AS datavencimento,
            created_at        AS createdat
     FROM students ORDER BY id DESC`
  );

  const students = rows.map((r) => {
    const dataVencimento = toDateStr(r.datavencimento);
    return {
      id: r.id,
      name: r.name,
      cpf: r.cpf,
      telefone: r.telefone,
      plano: r.plano,
      formaPagamento: r.formapagamento,
      enrollmentDate: toDateStr(r.enrollmentdate),
      dataVencimento,
      createdAt: r.createdat instanceof Date ? r.createdat.toISOString() : String(r.createdat),
      status: computeStatus(dataVencimento),
    };
  });

  res.json(students);
});

// POST /students
router.post("/students", async (req, res) => {
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

  const { rows } = await pool.query<{ id: number; createdat: Date | string }>(
    `INSERT INTO students (name, cpf, telefone, plano, forma_pagamento, enrollment_date, data_vencimento)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, created_at AS createdat`,
    [name, cpf, telefone, plano, formaPagamento, enrollmentDateStr, dataVencimento]
  );
  const student = rows[0]!;

  // Auto-create initial payment entry
  await pool.query(
    `INSERT INTO historico_financeiro (student_id, student_name, amount, payment_date, forma_pagamento)
     VALUES ($1, $2, $3, $4, $5)`,
    [student.id, name, fee, enrollmentDateStr, formaPagamento]
  );

  res.status(201).json({
    id: student.id,
    name,
    cpf,
    telefone,
    plano,
    formaPagamento,
    enrollmentDate: enrollmentDateStr,
    dataVencimento,
    createdAt: student.createdat instanceof Date ? student.createdat.toISOString() : String(student.createdat),
    status: computeStatus(dataVencimento),
  });
});

// DELETE /students/:id
router.delete("/students/:id", async (req, res) => {
  const parsed = DeleteStudentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const result = await pool.query("DELETE FROM students WHERE id = $1", [parsed.data.id]);

  if (result.rowCount === 0) {
    res.status(404).json({ error: "Aluno não encontrado" });
    return;
  }

  res.json({ message: "Aluno removido com sucesso" });
});

// POST /students/:id/renovar
router.post("/students/:id/renovar", async (req, res) => {
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

  const { rows } = await pool.query<{
    id: number; name: string; cpf: string | null; telefone: string | null;
    plano: string | null; formapagamento: string | null;
    enrollmentdate: Date | string; datavencimento: Date | string; createdat: Date | string;
  }>(
    `SELECT id, name, cpf, telefone, plano,
            forma_pagamento AS formapagamento,
            enrollment_date AS enrollmentdate,
            data_vencimento AS datavencimento,
            created_at      AS createdat
     FROM students WHERE id = $1`,
    [paramsParsed.data.id]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Aluno não encontrado" });
    return;
  }

  const existing = rows[0]!;
  const today = new Date().toISOString().split("T")[0];
  const currentDue = toDateStr(existing.datavencimento);
  const baseDate = currentDue >= today ? currentDue : today;
  const novaVencimento = addOneMonth(baseDate);
  const fee = getPlanFee(existing.plano ?? "Plano Mensal");

  await pool.query("UPDATE students SET data_vencimento = $1 WHERE id = $2", [
    novaVencimento,
    existing.id,
  ]);

  await pool.query(
    `INSERT INTO historico_financeiro (student_id, student_name, amount, payment_date, forma_pagamento)
     VALUES ($1, $2, $3, $4, $5)`,
    [existing.id, existing.name, fee, today, formaPagamento]
  );

  res.json({
    id: existing.id,
    name: existing.name,
    cpf: existing.cpf,
    telefone: existing.telefone,
    plano: existing.plano,
    formaPagamento: existing.formapagamento,
    enrollmentDate: toDateStr(existing.enrollmentdate),
    dataVencimento: novaVencimento,
    createdAt: existing.createdat instanceof Date ? existing.createdat.toISOString() : String(existing.createdat),
    status: "Em Dia" as const,
  });
});

export default router;

import { Router } from "express";
import { getDb } from "../lib/db";
import { CreatePaymentBody, DeletePaymentParams } from "@workspace/api-zod";

const router = Router();

// GET /payments — list all payments with student name
router.get("/payments", (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT p.id, p.student_id AS studentId, s.name AS studentName,
              p.amount, p.payment_date AS paymentDate, p.status, p.created_at AS createdAt
       FROM payments p
       JOIN students s ON s.id = p.student_id
       ORDER BY p.id DESC`
    )
    .all();
  res.json(rows);
});

// POST /payments — register a new payment
router.post("/payments", (req, res) => {
  const parsed = CreatePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { studentId, amount, paymentDate, status } = parsed.data;

  // paymentDate is coerced to a Date by Zod — convert back to YYYY-MM-DD string for SQLite
  const paymentDateStr =
    paymentDate instanceof Date
      ? paymentDate.toISOString().split("T")[0]
      : String(paymentDate);

  const db = getDb();

  // Verify the student exists
  const student = db.prepare("SELECT id, name FROM students WHERE id = ?").get(studentId) as
    | { id: number; name: string }
    | undefined;

  if (!student) {
    res.status(400).json({ error: "Aluno não encontrado" });
    return;
  }

  let payment: unknown;
  try {
    const stmt = db.prepare(
      `INSERT INTO payments (student_id, amount, payment_date, status, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       RETURNING id, student_id AS studentId, amount, payment_date AS paymentDate, status, created_at AS createdAt`
    );
    const row = stmt.get(studentId, amount, paymentDateStr, status) as {
      id: number;
      studentId: number;
      amount: number;
      paymentDate: string;
      status: string;
      createdAt: string;
    };
    payment = { ...row, studentName: student.name };
  } catch {
    res.status(500).json({ error: "Erro ao salvar pagamento no banco de dados" });
    return;
  }

  res.status(201).json(payment);
});

// DELETE /payments/:id — delete a payment record
router.delete("/payments/:id", (req, res) => {
  const parsed = DeletePaymentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const db = getDb();
  const result = db
    .prepare("DELETE FROM payments WHERE id = ?")
    .run(parsed.data.id);

  if (result.changes === 0) {
    res.status(404).json({ error: "Pagamento não encontrado" });
    return;
  }

  res.json({ message: "Pagamento removido com sucesso" });
});

export default router;

import { Router } from "express";
import { getDb } from "../lib/db";

const router = Router();

// GET /historico — list all financial history entries
router.get("/historico", (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, student_id AS studentId, student_name AS studentName,
              amount, payment_date AS paymentDate,
              forma_pagamento AS formaPagamento,
              created_at AS createdAt
       FROM historico_financeiro
       ORDER BY payment_date DESC, id DESC`
    )
    .all();
  res.json(rows);
});

export default router;

import { Router } from "express";
import { pool } from "../lib/db";

const router = Router();

// GET /historico — list all financial history entries
router.get("/historico", async (_req, res) => {
  const { rows } = await pool.query<{
    id: number; studentid: number; studentname: string;
    amount: string; paymentdate: Date | string;
    formapagamento: string | null; createdat: Date | string;
  }>(
    `SELECT id,
            student_id      AS studentid,
            student_name    AS studentname,
            amount,
            payment_date    AS paymentdate,
            forma_pagamento AS formapagamento,
            created_at      AS createdat
     FROM historico_financeiro
     ORDER BY payment_date DESC, id DESC`
  );

  const items = rows.map((r) => ({
    id: r.id,
    studentId: r.studentid,
    studentName: r.studentname,
    amount: Number(r.amount),
    paymentDate: r.paymentdate instanceof Date
      ? r.paymentdate.toISOString().split("T")[0]
      : String(r.paymentdate).split("T")[0],
    formaPagamento: r.formapagamento,
    createdAt: r.createdat instanceof Date ? r.createdat.toISOString() : String(r.createdat),
  }));

  res.json(items);
});

export default router;

import { Router } from "express";
import { pool } from "../lib/db";

const router = Router();

// GET /stats
router.get("/stats", async (_req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = today.slice(0, 7); // YYYY-MM

  const [total, active, overdue, revenue] = await Promise.all([
    pool.query<{ count: string }>("SELECT COUNT(*) AS count FROM students"),
    pool.query<{ count: string }>(
      "SELECT COUNT(*) AS count FROM students WHERE data_vencimento >= $1",
      [today]
    ),
    pool.query<{ count: string }>(
      "SELECT COUNT(*) AS count FROM students WHERE data_vencimento < $1",
      [today]
    ),
    pool.query<{ total: string }>(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM historico_financeiro
       WHERE TO_CHAR(payment_date, 'YYYY-MM') = $1`,
      [currentMonth]
    ),
  ]);

  res.json({
    totalStudents:   Number(total.rows[0]!.count),
    activeStudents:  Number(active.rows[0]!.count),
    overdueStudents: Number(overdue.rows[0]!.count),
    monthlyRevenue:  Number(revenue.rows[0]!.total),
  });
});

export default router;

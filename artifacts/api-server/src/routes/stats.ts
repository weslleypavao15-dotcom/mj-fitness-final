import { Router } from "express";
import { getDb } from "../lib/db";

const router = Router();

// GET /stats
router.get("/stats", (_req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split("T")[0];

  const totalStudents = (
    db.prepare("SELECT COUNT(*) AS count FROM students").get() as { count: number }
  ).count;

  const activeStudents = (
    db
      .prepare("SELECT COUNT(*) AS count FROM students WHERE data_vencimento >= ?")
      .get(today) as { count: number }
  ).count;

  const overdueStudents = (
    db
      .prepare("SELECT COUNT(*) AS count FROM students WHERE data_vencimento < ?")
      .get(today) as { count: number }
  ).count;

  // Monthly revenue = sum of historico entries for the current calendar month
  const currentMonth = today.slice(0, 7); // YYYY-MM
  const monthlyRevenue = (
    db
      .prepare(
        `SELECT COALESCE(SUM(amount), 0) AS total
         FROM historico_financeiro
         WHERE strftime('%Y-%m', payment_date) = ?`
      )
      .get(currentMonth) as { total: number }
  ).total;

  res.json({ totalStudents, activeStudents, overdueStudents, monthlyRevenue });
});

export default router;

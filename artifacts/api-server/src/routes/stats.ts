import { Router } from "express";
import { getDb } from "../lib/db";

const router = Router();

// GET /stats — dashboard statistics
router.get("/stats", (_req, res) => {
  const db = getDb();

  const totalStudents = (
    db.prepare("SELECT COUNT(*) as count FROM students").get() as { count: number }
  ).count;

  const annualPlans = (
    db
      .prepare("SELECT COUNT(*) as count FROM students WHERE plan = 'Plano Anual'")
      .get() as { count: number }
  ).count;

  // Active enrollments = students enrolled in the last 30 days
  const activeEnrollments = (
    db
      .prepare(
        `SELECT COUNT(*) as count FROM students
         WHERE enrollment_date >= date('now', '-30 days')`
      )
      .get() as { count: number }
  ).count;

  // Monthly revenue = sum of all "Pago" payments this calendar month
  const monthlyRevenue = (
    db
      .prepare(
        `SELECT COALESCE(SUM(amount), 0) as total FROM payments
         WHERE status = 'Pago'
           AND strftime('%Y-%m', payment_date) = strftime('%Y-%m', 'now')`
      )
      .get() as { total: number }
  ).total;

  // Total paid payments
  const paidCount = (
    db
      .prepare("SELECT COUNT(*) as count FROM payments WHERE status = 'Pago'")
      .get() as { count: number }
  ).count;

  // Total overdue payments
  const overdueCount = (
    db
      .prepare("SELECT COUNT(*) as count FROM payments WHERE status = 'Atrasado'")
      .get() as { count: number }
  ).count;

  res.json({
    totalStudents,
    activeEnrollments,
    annualPlans,
    monthlyRevenue,
    paidCount,
    overdueCount,
  });
});

export default router;

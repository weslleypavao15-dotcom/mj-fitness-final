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

  res.json({
    totalStudents,
    activeEnrollments,
    annualPlans,
  });
});

export default router;

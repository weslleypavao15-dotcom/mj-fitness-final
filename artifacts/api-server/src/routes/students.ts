import { Router } from "express";
import { getDb } from "../lib/db";
import { CreateStudentBody, DeleteStudentParams } from "@workspace/api-zod";

const router = Router();

// GET /students — list all students
router.get("/students", (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, name, plan, enrollment_date AS enrollmentDate, created_at AS createdAt
       FROM students ORDER BY id DESC`
    )
    .all();
  res.json(rows);
});

// POST /students — register a new student
router.post("/students", (req, res) => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, plan, enrollmentDate } = parsed.data;
  // enrollmentDate is coerced to a Date by Zod — convert back to YYYY-MM-DD string for SQLite
  const enrollmentDateStr =
    enrollmentDate instanceof Date
      ? enrollmentDate.toISOString().split("T")[0]
      : String(enrollmentDate);

  const db = getDb();

  const stmt = db.prepare(
    `INSERT INTO students (name, plan, enrollment_date, created_at)
     VALUES (?, ?, ?, datetime('now'))
     RETURNING id, name, plan, enrollment_date AS enrollmentDate, created_at AS createdAt`
  );

  let student: unknown;
  try {
    student = stmt.get(name, plan, enrollmentDateStr);
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar aluno no banco de dados" });
    return;
  }
  res.status(201).json(student);
});

// DELETE /students/:id — delete a student
router.delete("/students/:id", (req, res) => {
  const parsed = DeleteStudentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const db = getDb();
  const result = db
    .prepare("DELETE FROM students WHERE id = ?")
    .run(parsed.data.id);

  if (result.changes === 0) {
    res.status(404).json({ error: "Aluno não encontrado" });
    return;
  }

  res.json({ message: "Aluno removido com sucesso" });
});

export default router;

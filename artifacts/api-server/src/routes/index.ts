import { Router } from "express";
import historicoRouter from "./historico";
import statsRouter from "./stats";
import studentsRouter from "./students";

const router = Router();

// Conectando os módulos às rotas
router.use("/historico", historicoRouter);
router.use("/stats", statsRouter);
router.use("/students", studentsRouter);

export default router;
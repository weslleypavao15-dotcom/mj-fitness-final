import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studentsRouter from "./students";
import statsRouter from "./stats";
import historicoRouter from "./historico";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studentsRouter);
router.use(statsRouter);
router.use(historicoRouter);

export default router;

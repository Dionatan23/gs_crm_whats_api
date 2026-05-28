import { Router } from "express";
import { MetricsController } from "../controllers/metrics.controllers.js";

const router = Router();

router.get("/dashboard", MetricsController.dashboard);
router.get("/campaigns", MetricsController.campaigns);

export default router;

import { Router } from "express";
import automationController from "../controllers/automation.controller.js";

const router = Router();

router.post("/campaigns/create", automationController.create);

router.get("/campaigns/list", automationController.list);

router.get("/campaigns/:id", automationController.getById);

router.put("/campaigns/update/:id", automationController.update);

router.patch("/campaigns/:id/toggle", automationController.toggle);

router.delete("/campaigns/:id", automationController.delete);

router.get("/campaigns/:id/logs", automationController.logs);

router.get("/campaigns/:id/status", automationController.status);

router.get("/automations/:id/leads", automationController.leads);

export default router;

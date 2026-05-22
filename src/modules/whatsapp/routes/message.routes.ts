import { Router } from "express";

import messageController from "../controllers/message.controller.js";

const router = Router();

router.post("/send", messageController.send);

export default router;

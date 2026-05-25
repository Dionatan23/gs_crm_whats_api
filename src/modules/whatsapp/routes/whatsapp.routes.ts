import { Router } from "express";

import whatsappController from "../controllers/whatsapp.controller.js";

const router = Router();

router.get("/connect", whatsappController.connect);

router.get("/status", whatsappController.status);

router.get("/qr", whatsappController.qr);

router.get("/messages", whatsappController.messages);

export default router;

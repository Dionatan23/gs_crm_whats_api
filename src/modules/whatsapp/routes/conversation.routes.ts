import { Router } from "express";
import ConversationService from "../services/conversation.service.js";

const router = Router();

router.get("/conversations", async (_req, res) => {
  const conversations = await ConversationService.getAll();

  res.json(conversations);
});

export default router;

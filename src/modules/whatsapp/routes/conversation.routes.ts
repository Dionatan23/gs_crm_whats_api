import { Router } from "express";
import ConversationService from "../services/conversation.service.js";

const router = Router();

router.get("/conversations", async (_req, res) => {
  const conversations = await ConversationService.getAll();

  res.json(conversations);
});

router.get("/conversations/:phone", async (req, res) => {
  const messages = await ConversationService.getByPhone(
    req.params.phone
  );

  res.json(messages);
});

export default router;

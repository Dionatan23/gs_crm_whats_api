import { Router } from "express";
import ConversationService from "../services/conversation.service.js";

const router = Router();

router.get("/chats/list", async (_req, res) => {
  const conversations = await ConversationService.getAll();

  res.json(conversations);
});

router.get("/chats/:phone", async (req, res) => {
  const messages = await ConversationService.getByPhone(req.params.phone);

  res.json(messages);
});

export default router;

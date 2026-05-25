import express from "express";
import cors from "cors";

import whatsappRoutes from "./modules/whatsapp/routes/whatsapp.routes.js";
import messageRoutes from "./modules/whatsapp/routes/message.routes.js";
import conversationRoutes from "./modules/whatsapp/routes/conversation.routes.js";

import healthRoutes from "./shared/routes/health.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/health", healthRoutes);

app.use("/whatsapp", whatsappRoutes);

app.use("/messages", messageRoutes);
app.use("/api", conversationRoutes);

app.get("/", (req, res) => {
  return res.json({
    status: "ok",
    message: "GS CRM WhatsApp API",
  });
});

export default app;

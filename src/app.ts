import express from "express";
import cors from "cors";

import whatsappRoutes from "./modules/whatsapp/routes/whatsapp.routes.js";
import messageRoutes from "./modules/whatsapp/routes/message.routes.js";
import conversationRoutes from "./modules/whatsapp/routes/conversation.routes.js";

import healthRoutes from "./shared/routes/health.routes.js";
import { schedulerService } from "./modules/whatsapp/automation/service/scheduler.service.js";
import automationRoutes from "./modules/whatsapp/automation/routes/automation.routes.js";

const app = express();

app.use(cors());
schedulerService.start();

app.use(express.json());

app.use("/health", healthRoutes);

app.use("/whatsapp", whatsappRoutes);

app.use("/messages", messageRoutes);
app.use("/api", conversationRoutes);

app.use("/automations", automationRoutes);

app.get("/", (req, res) => {
  return res.json({
    status: "ok",
    message: "GS CRM WhatsApp API",
  });
});

export default app;

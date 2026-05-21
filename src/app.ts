import express from "express";
import cors from "cors";
import whatsappRoutes from "./modules/whatsapp/routes/whatsapp.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/whatsapp", whatsappRoutes);

app.get("/", (req, res) => {
  return res.json({
    status: "ok",
    message: "GS CRM WhatsApp API",
  });
});

export default app;

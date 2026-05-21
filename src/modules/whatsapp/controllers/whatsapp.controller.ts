import { Request, Response } from "express";

import whatsappService from "../services/whatsapp.service.js";

class WhatsAppController {
  async connect(req: Request, res: Response) {
    const sessionId = "default";

    const session = await whatsappService.connect(sessionId);

    return res.json({
      sessionId: session?.sessionId,
      status: session?.status,
    });
  }

  async status(req: Request, res: Response) {
    const sessionId = "default";

    const session = whatsappService.getStatus(sessionId);

    return res.json({
      sessionId: session?.sessionId,
      status: session?.status,
    });
  }

  async qr(req: Request, res: Response) {
    const sessionId = "default";

    const qr = whatsappService.getQrCode(sessionId);

    return res.json({
      qr,
    });
  }
}

export default new WhatsAppController();

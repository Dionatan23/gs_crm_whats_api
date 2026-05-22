import { Request, Response } from "express";
import QRCode from "qrcode";

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
    try {
      const sessionId = "default";

      const session = whatsappService.getStatus(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: "Session not found",
        });
      }

      return res.json({
        success: true,
        data: {
          sessionId: session.sessionId,
          status: session.status,
          qr: !!session.qr,
          reconnectAttempts: session.reconnectAttempts,
          lastConnectedAt: session.lastConnectedAt,
          phone: session.socket?.user?.id || null,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async qr(req: Request, res: Response) {
    try {
      const sessionId = "default";

      const qr = whatsappService.getQrCode(sessionId);

      if (!qr) {
        return res.status(404).json({
          success: false,
          error: "QR Code not available",
        });
      }

      const qrBase64 = await QRCode.toDataURL(qr);

      return res.json({
        success: true,
        qr: qrBase64,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
}

export default new WhatsAppController();

import { createWhatsAppConnection } from "../clients/baileys.client.js";

import sessionManager from "../managers/session.manager.js";

class WhatsAppService {
  async connect(sessionId: string) {
    const existingSession = sessionManager.getSession(sessionId);

    if (existingSession && existingSession.status === "connected") {
      return existingSession;
    }

    await createWhatsAppConnection(sessionId);

    return sessionManager.getSession(sessionId);
  }

  getStatus(sessionId: string) {
    return sessionManager.getSession(sessionId);
  }

  getQrCode(sessionId: string) {
    return sessionManager.getSession(sessionId)?.qr;
  }
}

export default new WhatsAppService();

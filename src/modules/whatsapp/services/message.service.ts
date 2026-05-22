import sessionManager from "../managers/session.manager.js";

class MessageService {
  async sendTextMessage(sessionId: string, phone: string, message: string) {
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status !== "connected") {
      throw new Error("Session is not connected");
    }

    if (!session.socket) {
      throw new Error("Socket unavailable");
    }

    const jid = `${phone}@s.whatsapp.net`;

    const exists = await session.socket.onWhatsApp(jid);
    console.log(exists);
    
    if (!exists || exists.length === 0) {
      throw new Error("Phone number is not on WhatsApp");
    }
    const formattedPhone = jid;

    try {
      const response = await session.socket.sendMessage(formattedPhone, {
        text: message,
      });

      console.log({
        type: "MESSAGE_SENT",
        phone,
        timestamp: new Date(),
      });

      return response;
    } catch (error) {
      console.error({
        type: "MESSAGE_ERROR",
        phone,
        error,
        timestamp: new Date(),
      });

      throw error;
    }
  }
}

export default new MessageService();

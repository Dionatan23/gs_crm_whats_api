import sessionManager from "../managers/session.manager.js";
import conversationService from "./conversation.service.js";

class MessageService {
  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, "");
  }

  private removeNinthDigit(phone: string): string {
    const cleaned = this.normalizePhone(phone);

    if (cleaned.length === 13) {
      return cleaned.slice(0, 4) + cleaned.slice(5);
    }

    return cleaned;
  }

  private addNinthDigit(phone: string): string {
    const cleaned = this.normalizePhone(phone);

    if (cleaned.length === 12) {
      return cleaned.slice(0, 4) + "9" + cleaned.slice(4);
    }

    return cleaned;
  }

  private async resolveWhatsAppJid(
    socket: any,
    phone: string,
  ): Promise<string | null> {
    const cleaned = this.normalizePhone(phone);

    const candidates = [
      cleaned,
      this.removeNinthDigit(cleaned),
      this.addNinthDigit(cleaned),
    ];

    const uniqueCandidates = [...new Set(candidates)];

    console.log("=================================");
    console.log("VALIDANDO TELEFONE");
    console.log("Original:", phone);
    console.log("Candidatos:", uniqueCandidates);
    console.log("=================================");

    for (const candidate of uniqueCandidates) {
      try {
        const jid = `${candidate}@s.whatsapp.net`;

        console.log("Testando:", jid);

        const exists = await socket.onWhatsApp(jid);

        console.log("Resultado:", exists);

        if (exists && exists.length > 0 && exists[0]?.exists === true) {
          console.log("✅ Número válido encontrado:", exists[0].jid);

          return exists[0].jid;
        }
      } catch (error) {
        console.error("Erro ao validar número:", candidate, error);
      }
    }

    console.log("❌ Nenhum formato válido encontrado");

    return null;
  }

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

    console.log("=================================");
    console.log("INICIANDO ENVIO");
    console.log("Session:", sessionId);
    console.log("Phone:", phone);
    console.log("Message:", message);
    console.log("=================================");

    const formattedPhone = await this.resolveWhatsAppJid(session.socket, phone);

    if (!formattedPhone) {
      throw new Error(`Número não encontrado no WhatsApp: ${phone}`);
    }

    console.log("=================================");
    console.log("ENVIANDO MENSAGEM");
    console.log("JID:", formattedPhone);
    console.log("=================================");

    try {
      const response = await session.socket.sendMessage(formattedPhone, {
        text: message,
      });

      await conversationService.saveMessage({
        phone,
        message,
        direction: "outbound",
        status: "sent",
      });

      console.log({
        type: "MESSAGE_SENT",
        original_phone: phone,
        whatsapp_jid: formattedPhone,
        timestamp: new Date(),
      });

      return response;
    } catch (error) {
      console.error({
        type: "MESSAGE_ERROR",
        original_phone: phone,
        whatsapp_jid: formattedPhone,
        error,
        timestamp: new Date(),
      });

      throw error;
    }
  }
}

export default new MessageService();

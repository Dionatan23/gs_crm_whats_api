import { WAMessage } from "@whiskeysockets/baileys";

import conversationService from "../services/conversation.service.js";

export async function handleMessagesUpsert(messages: WAMessage[]) {
  for (const message of messages) {
    if (!message.message) {
      continue;
    }

    const extractPhone = (message: WAMessage) => {
      const jid =
        message.key.remoteJidAlt ||
        message.key.participant ||
        message.key.remoteJid;

      if (!jid) return null;

      return jid.replace("@s.whatsapp.net", "").replace("@lid", "");
    };

    const phone = extractPhone(message);

    const text =
      message.message.conversation || message.message.extendedTextMessage?.text;

    if (!phone || !text) {
      continue;
    }

    conversationService.saveMessage({
      phone,
      message: text,
      timestamp: new Date(),
      type: "incoming",
    });
  }
}

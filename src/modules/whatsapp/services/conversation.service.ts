type MessageDirection = "incoming" | "outgoing";

interface ConversationMessage {
  phone: string;
  message: string;
  timestamp: Date;
  type: MessageDirection;
}

class ConversationService {
  private messages: ConversationMessage[] = [];

  saveMessage(data: ConversationMessage) {
    this.messages.push(data);

    console.log({
      type: "MESSAGE_RECEIVED",
      phone: data.phone,
      message: data.message,
      timestamp: data.timestamp,
    });
  }

  getMessages() {
    return this.messages;
  }
}

export default new ConversationService();

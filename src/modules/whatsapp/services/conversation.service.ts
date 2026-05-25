import db from "../../../database/db.js";

type MessageDirection = "inbound" | "outbound";

interface ConversationMessage {
  phone: string;
  message: string;
  direction: MessageDirection;
  status?: string;
  created_at?: string;
}

class ConversationService {
  saveMessage(data: ConversationMessage): void {
    db.run(
      `
      INSERT INTO messages (phone, message, direction, status)
      VALUES (?, ?, ?, ?)
      `,
      [
        data.phone,
        data.message,
        data.direction,
        data.status || "received"
      ],
      (err) => {
        if (err) {
          console.error("Erro ao salvar mensagem:", err.message);
        }
      }
    );

    console.log({
      type: "MESSAGE_RECEIVED",
      phone: data.phone,
      message: data.message
    });
  }

  getAll(): Promise<ConversationMessage[]> {
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT phone, message, direction, status, created_at
        FROM messages
        ORDER BY created_at ASC
        `,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows as ConversationMessage[]);
        }
      );
    });
  }
}

export default new ConversationService();
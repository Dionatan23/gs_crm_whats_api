import db from "../../../database/db.js";

interface MessageData {
  phone: string;
  message: string;
  direction: "inbound" | "outbound";
  status: string;
}

export function saveMessage(data: MessageData): void {
  db.run(
    `
    INSERT INTO messages
    (phone, message, direction, status)
    VALUES (?, ?, ?, ?)
    `,
    [data.phone, data.message, data.direction, data.status],
  );

  db.run(
    `
    INSERT OR REPLACE INTO conversations
    (phone, last_message, last_message_at)
    VALUES (?, ?, ?)
    `,
    [data.phone, data.message, new Date().toISOString()],
  );
}

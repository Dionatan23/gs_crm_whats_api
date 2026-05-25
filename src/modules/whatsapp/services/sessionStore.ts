import db from "../../../database/db.js";

interface SessionData {
  session_name: string;
  status: string;
  phone: string;
}

export function saveSession(session: SessionData): void {
  db.run(
    `
    INSERT OR REPLACE INTO whatsapp_sessions
    (session_name, status, phone, last_connected_at)
    VALUES (?, ?, ?, ?)
    `,
    [
      session.session_name,
      session.status,
      session.phone,
      new Date().toISOString(),
    ],
  );
}

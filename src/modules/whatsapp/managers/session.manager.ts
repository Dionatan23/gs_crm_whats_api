import { WhatsAppSession } from "../types/session.types.js";

class SessionManager {
  private sessions = new Map<string, WhatsAppSession>();

  createSession(session: WhatsAppSession) {
    this.sessions.set(session.sessionId, session);
  }

  getSession(sessionId: string) {
    return this.sessions.get(sessionId);
  }

  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  updateSession(sessionId: string, data: Partial<WhatsAppSession>) {
    const session = this.sessions.get(sessionId);

    if (!session) return;

    const updatedSession = {
      ...session,
      ...data,
    };

    this.sessions.set(sessionId, updatedSession);
  }

  removeSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  setStatus(sessionId: string, status: WhatsAppSession["status"]) {
    const session = this.sessions.get(sessionId);

    if (!session) return;

    session.status = status;

    this.sessions.set(sessionId, session);
  }
}

export default new SessionManager();

import { WhatsAppSession } from "../types/session.types.js";

class SessionManager {
  private sessions = new Map<string, WhatsAppSession>();

  createSession(session: WhatsAppSession) {
    this.sessions.set(session.sessionId, session);
  }

  getSession(sessionId: string) {
    return this.sessions.get(sessionId);
  }

  updateSession(sessionId: string, data: Partial<WhatsAppSession>) {
    const session = this.sessions.get(sessionId);

    if (!session) return;

    this.sessions.set(sessionId, {
      ...session,
      ...data,
    });
  }

  removeSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }
}

export default new SessionManager();

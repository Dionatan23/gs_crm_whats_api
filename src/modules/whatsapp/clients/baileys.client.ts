import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";

import path from "path";

import { Boom } from "@hapi/boom";

import sessionManager from "../managers/session.manager.js";

export async function createWhatsAppConnection(sessionId: string) {
  const existingSession = sessionManager.getSession(sessionId);

  if (existingSession?.status === "connected") {
    return existingSession.socket;
  }

  const sessionPath = path.resolve("sessions", sessionId);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    auth: state,
  });

  sessionManager.createSession({
    sessionId,
    socket,
    qr: null,
    status: "connecting",
    reconnectAttempts: 0,
  });

  socket.ev.on("creds.update", saveCreds);

  socket.ev.on("connection.update", async (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      sessionManager.updateSession(sessionId, {
        qr,
        status: "qr_pending",
      });
    }

    if (connection === "connecting") {
      console.log("🟡 Connecting...");

      sessionManager.setStatus(sessionId, "connecting");
    }

    if (connection === "open") {
      console.log("✅ WhatsApp connected");

      sessionManager.updateSession(sessionId, {
        status: "connected",
        qr: null,
        reconnectAttempts: 0,
        lastConnectedAt: new Date(),
      });
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log("❌ Connection closed:", statusCode);

      if (shouldReconnect) {
        console.log("🟠 Reconnecting...");

        sessionManager.updateSession(sessionId, {
          status: "reconnecting",
        });

        setTimeout(() => {
          createWhatsAppConnection(sessionId);
        }, 5000);
      } else {
        console.log("🔴 Session logged out");

        sessionManager.updateSession(sessionId, {
          status: "disconnected",
        });
      }
    }
  });

  return socket;
}

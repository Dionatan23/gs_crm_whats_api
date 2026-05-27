import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";

import { handleMessagesUpsert } from "../events/messages.event.js";
import path from "path";
import fs from "fs/promises";
import { Boom } from "@hapi/boom";
import sessionManager from "../managers/session.manager.js";

export async function createWhatsAppConnection(sessionId: string) {
  const existingSession = sessionManager.getSession(sessionId);

  // Evita múltiplas conexões simultâneas
  if (
    existingSession &&
    ["connected", "connecting", "qr_pending"].includes(existingSession.status)
  ) {
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

  // Salva credenciais
  socket.ev.on("creds.update", saveCreds);

  // Escuta mensagens
  socket.ev.on("messages.upsert", async ({ messages }) => {
    await handleMessagesUpsert(messages);
  });

  // Atualizações da conexão
  socket.ev.on("connection.update", async (update) => {
    const { connection, qr, lastDisconnect } = update;

    // Novo QR gerado
    if (qr) {
      console.log("📲 QR Code gerado");

      sessionManager.updateSession(sessionId, {
        qr,
        status: "qr_pending",
      });
    }

    // Conectando
    if (connection === "connecting") {
      console.log("🟡 Connecting...");

      sessionManager.setStatus(sessionId, "connecting");
    }

    // Conectado
    if (connection === "open") {
      console.log("✅ WhatsApp connected");

      sessionManager.updateSession(sessionId, {
        status: "connected",
        qr: null,
        reconnectAttempts: 0,
        lastConnectedAt: new Date(),
      });
    }

    // Conexão encerrada
    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

      const isLoggedOut =
        statusCode === DisconnectReason.loggedOut || statusCode === 401;

      console.log("❌ Connection closed:", statusCode);

      // Sessão inválida / expirada
      if (isLoggedOut) {
        console.log("🔴 Session logged out - limpando sessão");

        try {
          // Remove sessão do manager
          if (sessionManager.removeSession) {
            sessionManager.removeSession(sessionId);
          }

          // Remove credenciais antigas
          await fs.rm(sessionPath, {
            recursive: true,
            force: true,
          });

          sessionManager.updateSession(sessionId, {
            status: "disconnected",
            qr: null,
            reconnectAttempts: 0,
          });

          console.log("🧹 Sessão limpa com sucesso");

          // recria conexão limpa
          setTimeout(() => {
            createWhatsAppConnection(sessionId);
          }, 2000);
        } catch (error) {
          console.error("Erro ao limpar sessão:", error);
        }

        return;
      }

      // Reconexão normal
      console.log("🟠 Reconnecting...");

      sessionManager.updateSession(sessionId, {
        status: "reconnecting",
      });

      setTimeout(() => {
        createWhatsAppConnection(sessionId);
      }, 5000);
    }
  });

  return socket;
}

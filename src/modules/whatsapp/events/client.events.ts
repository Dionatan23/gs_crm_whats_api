import { Client, Message } from "whatsapp-web.js";
import { saveSession } from "../services/sessionStore.js";
import { saveMessage } from "../services/messageStore.js";
import MessageController from "../controllers/message.controller.js";

export function registerClientEvents(client: Client): void {
  client.on("authenticated", async () => {
    await saveSession({
      session_name: "default",
      status: "authenticated",
      phone: "",
    });

    console.log("Sessão salva");
  });

  client.on("message", async (message: Message) => {
    await saveMessage({
      phone: message.from,
      message: message.body,
      direction: "inbound",
      status: "received",
    });

    await MessageController.handle(message);
  });

  client.on("disconnected", async () => {
    await saveSession({
      session_name: "default",
      status: "disconnected",
      phone: "",
    });

    console.log("Cliente desconectado");
  });

  client.on("ready", async () => {
    const info = client.info;

    await saveSession({
      session_name: "default",
      status: "ready",
      phone: info?.wid?.user || "",
    });

    console.log("WhatsApp pronto");
  });
}

import { Client, LocalAuth } from "whatsapp-web.js";
import { registerClientEvents } from "../events/client.events.js";

export const whatsappClient = new Client({
  authStrategy: new LocalAuth({
    clientId: "production",
  }),
  puppeteer: {
    headless: true,
  },
});

registerClientEvents(whatsappClient);

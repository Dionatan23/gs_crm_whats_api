import { Request, Response } from "express";

import messageService from "../services/message.service.js";
import { Message } from "whatsapp-web.js";

import { validateSendMessage } from "../../../shared/validators/message.validator.js";

class MessageController {
  async send(req: Request, res: Response) {
    try {
      const { phone, message } = req.body;

      const validatedData = validateSendMessage(phone, message);

      const response = await messageService.sendTextMessage(
        "default",
        validatedData.phone,
        validatedData.message,
      );

      return res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async handle(message: Message): Promise<void> {
    console.log("Mensagem recebida:", message.body);

    // aqui vai a lógica de processamento
  }
}

export default new MessageController();

import { Request, Response } from "express";
import { automationService } from "../service/automation.service.js";

class AutomationController {
  // =========================
  // Criar automação
  // =========================
  async create(req: Request, res: Response) {
    try {
      const automation = await automationService.create(req.body);

      return res.status(201).json({
        success: true,
        data: automation,
        message: "Automação criada com sucesso",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // =========================
  // Listar automações
  // =========================
  async list(req: Request, res: Response) {
    try {
      const automations = await automationService.listAll();

      return res.status(200).json({
        success: true,
        data: automations,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // =========================
  // Buscar automação por ID
  // =========================
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      const automation = await automationService.getById(id);

      if (!automation) {
        return res.status(404).json({
          success: false,
          message: "Automação não encontrada",
        });
      }

      return res.status(200).json({
        success: true,
        data: automation,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // =========================
  // Atualizar automação
  // =========================
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      await automationService.update(id, req.body);

      return res.status(200).json({
        success: true,
        message: "Automação atualizada com sucesso",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // =========================
  // Ativar / Desativar
  // =========================
  async toggle(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      await automationService.toggle(id);

      return res.status(200).json({
        success: true,
        message: "Status da automação alterado",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // =========================
  // Excluir automação
  // =========================
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      await automationService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Automação removida com sucesso",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // =========================
  // Logs da automação
  // =========================
  async logs(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      const logs = await automationService.getLogs(id);

      return res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new AutomationController();

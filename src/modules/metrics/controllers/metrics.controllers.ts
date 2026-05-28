import { Request, Response } from "express";
import { MetricsService } from "../services/metrics.service.js";

export class MetricsController {
  static async dashboard(req: Request, res: Response) {
    const data = await MetricsService.getDashboardMetrics();
    res.json(data);
  }

  static async campaigns(req: Request, res: Response) {
    const data = await MetricsService.getCampaignStatus();
    res.json(data);
  }
}

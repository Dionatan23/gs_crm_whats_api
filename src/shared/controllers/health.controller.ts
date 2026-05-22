import { Request, Response } from "express";

class HealthController {
  health(req: Request, res: Response) {
    return res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date(),
    });
  }
}

export default new HealthController();

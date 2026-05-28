import db from "../../../database/db.js";

export class MetricsService {
  static getDashboardMetrics(): Promise<any> {
    return new Promise((resolve, reject) => {
      const queries = {
        active: `
          SELECT COUNT(*) as total
          FROM automations
          WHERE active = 1
        `,
        paused: `
          SELECT COUNT(*) as total
          FROM automations
          WHERE active = 0
        `,
        completed: `
          SELECT COUNT(*) as total
          FROM automations
          WHERE status = 'concluida'
        `,
        impactedToday: `
          SELECT COUNT(*) as total
          FROM automation_logs
          WHERE DATE(sent_at) = DATE('now', 'localtime')
          AND status = 'sent'
        `,
      };

      const result: any = {};

      db.get(queries.active, [], (err, row: any) => {
        if (err) return reject(err);
        result.activeAutomations = row.total;

        db.get(queries.paused, [], (err, row: any) => {
          if (err) return reject(err);
          result.pausedAutomations = row.total;

          db.get(queries.completed, [], (err, row: any) => {
            if (err) return reject(err);
            result.completedCampaigns = row.total;

            db.get(queries.impactedToday, [], (err, row: any) => {
              if (err) return reject(err);

              result.leadsImpactedToday = row.total;
              resolve(result);
            });
          });
        });
      });
    });
  }

  static getCampaignStatus(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT
          a.id,
          a.name,
          a.status,
          a.active,
          COUNT(al.id) as total_leads,
          SUM(
            CASE
              WHEN al.execution_status = 'sent' THEN 1
              ELSE 0
            END
          ) as sent_leads
        FROM automations a
        LEFT JOIN automation_leads al
          ON a.id = al.automation_id
        GROUP BY a.id
      `,
        [],
        (err, rows: any[]) => {
          if (err) return reject(err);

          const campaigns = rows.map((row) => {
            let phase = "agendada";

            if (row.active === 0) phase = "pausada";
            else if (row.sent_leads === row.total_leads) phase = "concluida";
            else if (row.sent_leads > 0) phase = "executando";

            return {
              id: row.id,
              name: row.name,
              phase,
              progress:
                row.total_leads > 0
                  ? Math.round((row.sent_leads / row.total_leads) * 100)
                  : 0,
            };
          });

          resolve(campaigns);
        },
      );
    });
  }
}

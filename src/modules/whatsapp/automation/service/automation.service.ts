import db from "../../../../database/db.js";
import messageService from "../../services/message.service.js";

class AutomationService {
  // =========================
  // CRUD
  // =========================

  async create(data: any) {
    return new Promise((resolve, reject) => {
      db.run(
        `
        INSERT INTO automations (
          name,
          session_id,
          lead_type,
          message_template,
          start_time,
          end_time,
          min_delay,
          max_delay,
          active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.name,
          data.session_id,
          data.lead_type,
          data.message_template,
          data.start_time,
          data.end_time,
          data.min_delay,
          data.max_delay,
          data.active ?? 1,
        ],
        function (err) {
          if (err) return reject(err);

          const automationId = this.lastID;

          if (!data.leads?.length) {
            return resolve({ id: automationId });
          }

          const stmt = db.prepare(`
            INSERT INTO automation_leads (
              automation_id,
              lead_name,
              company,
              lead_type,
              city,
              phone,
              source_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);

          for (const lead of data.leads) {
            stmt.run([
              automationId,
              lead.name,
              lead.company || null,
              lead.type || data.lead_type,
              lead.city || null,
              lead.phone,
              lead.status || "novo",
            ]);
          }

          stmt.finalize();

          resolve({ id: automationId });
        },
      );
    });
  }

  async listAll() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM automations`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getById(id: number) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM automations WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async update(id: number, data: any) {
    return new Promise((resolve, reject) => {
      db.run(
        `
        UPDATE automations
        SET
          name = ?,
          session_id = ?,
          lead_type = ?,
          message_template = ?,
          start_time = ?,
          end_time = ?,
          min_delay = ?,
          max_delay = ?
        WHERE id = ?
        `,
        [
          data.name,
          data.session_id,
          data.lead_type,
          data.message_template,
          data.start_time,
          data.end_time,
          data.min_delay,
          data.max_delay,
          id,
        ],
        (err) => {
          if (err) reject(err);
          else resolve(true);
        },
      );
    });
  }

  async toggle(id: number) {
    return new Promise((resolve, reject) => {
      db.run(
        `
        UPDATE automations
        SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END
        WHERE id = ?
        `,
        [id],
        (err) => {
          if (err) reject(err);
          else resolve(true);
        },
      );
    });
  }

  async delete(id: number) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM automation_leads WHERE automation_id = ?`, [id]);

      db.run(`DELETE FROM automations WHERE id = ?`, [id], (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  async getLogs(id: number) {
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT * FROM automation_logs
        WHERE automation_id = ?
        ORDER BY sent_at DESC
        `,
        [id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        },
      );
    });
  }

  // =========================
  // Scheduler Engine
  // =========================

  async listActiveAutomations() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM automations WHERE active = 1`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  isWithinExecutionWindow(automation: any) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMinute] = automation.start_time
      .split(":")
      .map(Number);

    const [endHour, endMinute] = automation.end_time.split(":").map(Number);

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    return currentMinutes >= start && currentMinutes <= end;
  }

  async executeAutomation(automation: any) {
    try {
      console.log(`Executando automação ${automation.name}`);

      const leads = await this.getPendingAutomationLeads(automation.id);

      for (const lead of leads as any[]) {
        const delay = this.randomDelay(
          automation.min_delay,
          automation.max_delay,
        );

        await this.sleep(delay * 1000);

        try {
          await messageService.sendTextMessage(
            automation.session_id,
            lead.phone,
            automation.message_template,
          );

          await this.markLeadAsSent(lead.id);

          await this.logExecution(automation.id, lead.phone, "SUCCESS");
        } catch (error: any) {
          await this.markLeadAsFailed(lead.id, error.message);

          await this.logExecution(
            automation.id,
            lead.phone,
            "FAILED",
            error.message,
          );
        }
      }
    } catch (error) {
      console.error("Erro ao executar automação:", error);
    }
  }

  async getPendingAutomationLeads(automationId: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT * FROM automation_leads
        WHERE automation_id = ?
        AND execution_status = 'pending'
        `,
        [automationId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        },
      );
    });
  }

  async markLeadAsSent(leadId: number) {
    return new Promise((resolve, reject) => {
      db.run(
        `
        UPDATE automation_leads
        SET
          execution_status = 'sent',
          sent_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [leadId],
        (err) => {
          if (err) reject(err);
          else resolve(true);
        },
      );
    });
  }

  async markLeadAsFailed(leadId: number, errorMessage: string) {
    return new Promise((resolve, reject) => {
      db.run(
        `
        UPDATE automation_leads
        SET
          execution_status = 'failed',
          error_message = ?
        WHERE id = ?
        `,
        [errorMessage, leadId],
        (err) => {
          if (err) reject(err);
          else resolve(true);
        },
      );
    });
  }

  async logExecution(
    automationId: number,
    phone: string,
    status: string,
    errorMessage: string | null = null,
  ) {
    db.run(
      `
      INSERT INTO automation_logs
      (automation_id, phone, status, error_message)
      VALUES (?, ?, ?, ?)
      `,
      [automationId, phone, status, errorMessage],
    );
  }

  randomDelay(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const automationService = new AutomationService();

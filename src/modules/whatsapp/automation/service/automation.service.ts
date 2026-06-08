import db from "../../../../database/db.js";
import messageService from "../../services/message.service.js";

class AutomationService {
  // =========================
  // CRUD
  // =========================

  private readonly runningAutomations = new Set<number>();

  async create(data: any) {
    console.log("=== PAYLOAD RECEBIDO ===");
    console.log(JSON.stringify(data, null, 2));

    console.log("=== TEMPLATES ===");
    console.log(JSON.stringify(data.templates, null, 2));
    return new Promise((resolve, reject) => {
      db.run(
        `
      INSERT INTO automations (
        name,
        session_id,
        lead_type,
        status,
        active,
        categoria,
        start_time,
        end_time,
        daily_limit,
        min_delay,
        max_delay
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          data.name,
          data.session_id,
          data.lead_type,
          data.status || "ativa",
          data.active ? 1 : 0,
          data.categoria,
          data.start_time,
          data.end_time,
          data.daily_limit || 50,
          data.min_delay,
          data.max_delay,
        ],
        function (err) {
          if (err) return reject(err);

          const automationId = this.lastID;

          // salvar templates
          if (data.templates?.length) {
            const templateStmt = db.prepare(`
            INSERT INTO automation_messages (
              automation_id,
              template_id,
              content
            )
            VALUES (?, ?, ?)
          `);

            for (const template of data.templates) {
              console.log("SALVANDO TEMPLATE:", template);
              const content =
                template.mensagem || template.content || template.message;

              if (!content) {
                console.warn(
                  "Template ignorado por não possuir conteúdo:",
                  template,
                );
                continue;
              }
              console.log("CONTENT:", content);
              templateStmt.run(
                [automationId, template.id || null, content],
                (err) => {
                  if (err) {
                    console.error("ERRO TEMPLATE:", err);
                  } else {
                    console.log("TEMPLATE SALVO");
                  }
                },
              );
            }

            templateStmt.finalize();
          }

          // salvar leads
          if (data.leads?.length) {
            const leadStmt = db.prepare(`
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
              leadStmt.run([
                automationId,
                lead.name,
                lead.company || null,
                data.lead_type,
                lead.city || null,
                lead.phone,
                lead.status || "novo",
              ]);
            }

            leadStmt.finalize();
          }

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
          SET 
            active = CASE WHEN active = 1 THEN 0 ELSE 1 END,
            status = CASE WHEN active = 1 THEN 'pausada' ELSE 'ativa' END
          WHERE id = ?
          `,
        [id],
        function (err) {
          if (err) return reject(err);

          if (this.changes === 0) {
            return reject(new Error("Nenhuma automação foi atualizada"));
          }

          resolve(true);
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
      db.run(`DELETE FROM automation_messages WHERE automation_id = ?`, [id]);
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

  isWindowExpired(automation: any): boolean {
    const now = new Date();

    const [endHour, endMinute] = automation.end_time.split(":").map(Number);

    const end = new Date();

    end.setHours(endHour, endMinute, 0, 0);

    return now > end;
  }

  async getRandomTemplate(automationId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      db.get(
        `
      SELECT content
      FROM automation_messages
      WHERE automation_id = ?
      ORDER BY RANDOM()
      LIMIT 1
      `,
        [automationId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        },
      );
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
    if (this.runningAutomations.has(automation.id)) {
      console.log(`⏭️ Automação ${automation.id} já está rodando`);
      return;
    }

    this.runningAutomations.add(automation.id);

    try {
      console.log(`🚀 Executando automação ${automation.id}`);

      const leads = await this.getPendingAutomationLeads(automation.id);

      if (!leads || !(leads as any[]).length) {
        console.log(
          `🏁 Automação ${automation.id} finalizada: sem leads pendentes`,
        );

        await this.finishAutomation(automation.id);

        return true;
      }

      for (const lead of leads as any[]) {
        try {
          console.log(`➡️ Reservando lead ${lead.phone}`);

          // trava imediatamente
          await this.markLeadAsProcessing(lead.id);

          const delay = this.randomDelay(
            automation.min_delay,
            automation.max_delay,
          );

          console.log(`⏳ Aguardando ${delay}s para ${lead.phone}`);

          await this.sleep(delay * 1000);

          const template: any = await this.getRandomTemplate(automation.id);

          if (!template) {
            throw new Error(
              `Nenhum template encontrado para automação ${automation.id}`,
            );
          }

          await messageService.sendTextMessage(
            automation.session_id,
            lead.phone,
            template.content,
          );

          await this.markLeadAsSent(lead.id);

          await this.logExecution(automation.id, lead.phone, "SUCCESS");

          console.log(`✅ Lead enviado: ${lead.phone}`);
        } catch (error: any) {
          await this.markLeadAsFailed(lead.id, error.message);

          await this.logExecution(
            automation.id,
            lead.phone,
            "FAILED",
            error.message,
          );

          console.error(
            `❌ Falha ao enviar para ${lead.phone}:`,
            error.message,
          );
        }
      }
      return true;
    } finally {
      this.runningAutomations.delete(automation.id);
    }
  }

  async finishAutomation(automationId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        `
      UPDATE automations
      SET active = 0,
          status = 'concluida'
      WHERE id = ?
      `,
        [automationId],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        },
      );
    });
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

  async markLeadAsProcessing(leadId: number) {
    return new Promise((resolve, reject) => {
      db.run(
        `
      UPDATE automation_leads
      SET execution_status = 'processing'
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

  async markLeadAsSent(leadId: number) {
    return new Promise((resolve, reject) => {
      db.run(
        `
      UPDATE automation_leads
      SET execution_status = 'sent'
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

  async markLeadAsFailed(leadId: number, error: string) {
    return new Promise((resolve, reject) => {
      db.run(
        `
      UPDATE automation_leads
      SET execution_status = 'failed',
          error_message = ?
      WHERE id = ?
      `,
        [error, leadId],
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

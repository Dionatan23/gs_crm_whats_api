import { automationService } from "./automation.service.js";

class SchedulerService {
  start() {
    console.log("🚀 Scheduler iniciado");

    setInterval(async () => {
      console.log("🔍 Verificando automações...");

      try {
        const automations =
          (await automationService.listActiveAutomations()) as any[];

        console.log(`📌 ${automations.length} automações ativas encontradas`);

        for (const automation of automations as any[]) {
          console.log(
            `➡️ Verificando automação: ${automation.name} (ID: ${automation.id})`,
          );

          const canExecute =
            automationService.isWithinExecutionWindow(automation);

          if (canExecute) {
            console.log(`✅ Executando automação: ${automation.name}`);

            const executed =
              await automationService.executeAutomation(automation);

            if (executed) {
              console.log(`🎯 Automação concluída: ${automation.name}`);
            }
          } else {
            if (automationService.isWindowExpired(automation)) {
              console.log(`⏰ Automação expirada: ${automation.name}`);

              await automationService.finishAutomation(automation.id);
            } else {
              console.log(
                `⏳ Aguardando janela de execução: ${automation.name}`,
              );
            }
          }
        }
      } catch (error: any) {
        console.error("❌ Erro no scheduler:", error.message);
      }
    }, 60000);
  }
}

export const schedulerService = new SchedulerService();

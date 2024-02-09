import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIKILLAURA } from "../../../modules/uiAntiKillaura";
import ConfigInterface from "../../../../interfaces/Config";

export function antiKillAuraHandler(player: Player) {
    const modulesantikillaura = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const antiKillAuraBoolean = configuration.modules.antiKillAura.enabled;
    modulesantikillaura.title("§4Paradox Modules - Anti KillAura§4");
    modulesantikillaura.toggle("Anti KillAura - Toggles checks for attacks outside a 90 degree angle:", antiKillAuraBoolean);
    modulesantikillaura
        .show(player)
        .then((antikillauraResult) => {
            uiANTIKILLAURA(antikillauraResult, player);
        })
        .catch((error) => {
            console.error("Paradox Unhandled Rejection: ", error);
            // Extract stack trace information
            if (error instanceof Error) {
                const stackLines = error.stack.split("\n");
                if (stackLines.length > 1) {
                    const sourceInfo = stackLines;
                    console.error("Error originated from:", sourceInfo[0]);
                }
            }
        });
}

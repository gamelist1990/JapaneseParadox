import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIPHASE } from "../../../modules/uiAntiPhase";
import ConfigInterface from "../../../../interfaces/Config";

export function antiPhaseAHandler(player: Player) {
    const modulesantiphaseui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const antiPhaseBoolean = configuration.modules.antiphaseA.enabled;
    modulesantiphaseui.title("§4Paradox Modules - Anti Phase§4");
    modulesantiphaseui.toggle("Anti Phase - Checks player's for phasing blocks:", antiPhaseBoolean);
    modulesantiphaseui
        .show(player)
        .then((antiphaseResult) => {
            uiANTIPHASE(antiphaseResult, player);
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

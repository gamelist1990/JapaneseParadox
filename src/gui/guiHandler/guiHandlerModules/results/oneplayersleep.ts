import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiOPS } from "../../../modules/uiOnePlayerSleep";
import ConfigInterface from "../../../../interfaces/Config";

export function opsHandler(player: Player) {
    const modulesopsui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const opsBoolean = configuration.modules.ops.enabled;
    modulesopsui.title("§4Paradox Modules - OPS§4");
    modulesopsui.toggle("One Player Sleep - Allows 1 player to sleep through the night:", opsBoolean);
    modulesopsui
        .show(player)
        .then((opsResult) => {
            uiOPS(opsResult, player);
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

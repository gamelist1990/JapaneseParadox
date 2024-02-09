import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIKNOCKBACK } from "../../../../modules/uiAntiKnockback";
import ConfigInterface from "../../../../../interfaces/Config";

export function antiKnockBackHandler(player: Player) {
    //Anti Knockback UI
    const modulesantiknockbackui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const antikbBoolean = configuration.modules.antikbA.enabled;
    modulesantiknockbackui.title("§4Paradox Modules - Anti KnockBack§4");
    modulesantiknockbackui.toggle("Anti Knockback - Anti Knockback for all players:", antikbBoolean);
    modulesantiknockbackui
        .show(player)
        .then((antikbResult) => {
            uiANTIKNOCKBACK(antikbResult, player);
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

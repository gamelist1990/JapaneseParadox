import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTISHULKER } from "../../../modules/uiAntiShulker";
import ConfigInterface from "../../../../interfaces/Config";

export function antiShulkerHandler(player: Player) {
    const modulesantishulkerui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const antiShulkerBoolean = configuration.modules.antishulker.enabled;
    modulesantishulkerui.title("§4Paradox Modules - Anti Shulker§4");
    modulesantishulkerui.toggle("Anti Shulker - Allows or denies shulker boxes in the world:", antiShulkerBoolean);
    modulesantishulkerui
        .show(player)
        .then((antishulkerResult) => {
            uiANTISHULKER(antishulkerResult, player);
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

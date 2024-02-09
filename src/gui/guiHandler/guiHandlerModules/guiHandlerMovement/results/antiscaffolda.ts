import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTISCAFFOLD } from "../../../../modules/uiAntiScaffold";
import ConfigInterface from "../../../../../interfaces/Config";

export function antiScaffoldAHandler(player: Player) {
    //AntiScaffold
    const modulesantiscaffoldui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const antiScaffoldABoolean = configuration.modules.antiscaffoldA.enabled;
    modulesantiscaffoldui.title("§4Paradox Modules - Anti Scaffold§4");
    modulesantiscaffoldui.toggle("Anti Scaffold - Checks player's for illegal scaffolding:", antiScaffoldABoolean);
    modulesantiscaffoldui
        .show(player)
        .then((antiscaffoldResult) => {
            uiANTISCAFFOLD(antiscaffoldResult, player);
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

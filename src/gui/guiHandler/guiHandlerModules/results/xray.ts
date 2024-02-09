import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiXRAY } from "../../../modules/uiXray";
import ConfigInterface from "../../../../interfaces/Config";

export function xrayHandler(player: Player) {
    const modulesxtrayui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    modulesxtrayui.title("§4Paradox Modules - Xray§4");
    const xrayBoolean = configuration.modules.xrayA.enabled;
    modulesxtrayui.toggle("Xray - Notify's staff when and where player's mine specific ores:", xrayBoolean);
    modulesxtrayui
        .show(player)
        .then((xrayResult) => {
            uiXRAY(xrayResult, player);
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

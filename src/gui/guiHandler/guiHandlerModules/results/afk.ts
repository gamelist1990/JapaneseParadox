import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiAFK } from "../../../modules/uiAFK";
import ConfigInterface from "../../../../interfaces/Config";

export function afkHandler(player: Player) {
    const modulesafkui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const currentAFKConifg = configuration.modules.afk.minutes;
    const afkBoolean = configuration.modules.afk.enabled;
    modulesafkui.title("§4Paradox Modules - AFK§4");
    modulesafkui.toggle("Enable AFK - Kicks players that are AFK for " + currentAFKConifg + " minutes:", afkBoolean);
    modulesafkui
        .show(player)
        .then((afkResult) => {
            uiAFK(afkResult, player);
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

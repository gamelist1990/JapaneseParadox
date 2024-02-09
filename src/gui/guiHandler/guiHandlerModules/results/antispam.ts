import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTISPAM } from "../../../modules/uiAntiSpam";
import ConfigInterface from "../../../../interfaces/Config";

export function antiSpamHandler(player: Player) {
    const modulesantispamui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const antiSpamBoolean = configuration.modules.antispam.enabled;
    modulesantispamui.title("§4Paradox Modules - Anti Spam§4");
    modulesantispamui.toggle("Anti Spam - Checks for spamming in chat with 2 second cooldown:", antiSpamBoolean);
    modulesantispamui
        .show(player)
        .then((antispamResult) => {
            uiANTISPAM(antispamResult, player);
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

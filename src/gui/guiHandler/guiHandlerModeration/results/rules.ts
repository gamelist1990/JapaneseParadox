import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiRULES } from "../../../moderation/uiRules";
import { Player } from "@minecraft/server";
import ConfigInterface from "../../../../interfaces/Config";

export function rulesHandler(player: Player) {
    //show rules ui
    const rulesui = new ModalFormData();
    rulesui.title("§4Paradox - Configure Rules§4");
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const showrulesBoolean = configuration.modules.showrules.enabled;
    const KickOnDeclineBoolean = configuration.modules.showrules.kick;
    rulesui.toggle("Enable Rules:", showrulesBoolean);
    rulesui.toggle("Kick On Decline:", KickOnDeclineBoolean);
    rulesui
        .show(player)
        .then((rulesResult) => {
            // due to limitations we can't edit the rules in game.
            uiRULES(rulesResult, player);
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

import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiHOTBAR } from "../../../modules/uiHotbar";
import ConfigInterface from "../../../../interfaces/Config";

export function hotbarHandler(player: Player) {
    const moduleshotbarui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const hotbarBoolean = configuration.modules.hotbar.enabled;
    const CurrentHotbarConfig = configuration.modules.hotbar.message;
    moduleshotbarui.title("§4Paradox Modules - Hotbar§4");
    moduleshotbarui.textField("Hotbar Message: ", "", CurrentHotbarConfig);
    moduleshotbarui.toggle("Enable Hotbar - Displays a hotbar message for all player's currently online:", hotbarBoolean);
    moduleshotbarui.toggle("Restore to message stored in config.js:", false);
    moduleshotbarui
        .show(player)
        .then((hotbarResult) => {
            uiHOTBAR(hotbarResult, player);
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

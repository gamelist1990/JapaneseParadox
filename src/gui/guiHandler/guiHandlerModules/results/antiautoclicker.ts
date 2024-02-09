import { Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIAUTOCLICKER } from "../../../modules/uiAntiAutoClicker";
import { ModalFormData } from "@minecraft/server-ui";
import ConfigInterface from "../../../../interfaces/Config";

export function antiAutoClickerHandler(player: Player) {
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const autoClickerBoolean = configuration.modules.autoclicker.enabled;
    const modulesantiautoclickerui = new ModalFormData();
    modulesantiautoclickerui.title("§4Paradox Modules - Anti AutoClicker§4");
    modulesantiautoclickerui.toggle("Anti AutoClicker - Checks for players using autoclickers while attacking:", autoClickerBoolean);
    modulesantiautoclickerui
        .show(player)
        .then((antiautoclickerResult) => {
            uiANTIAUTOCLICKER(antiautoclickerResult, player);
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

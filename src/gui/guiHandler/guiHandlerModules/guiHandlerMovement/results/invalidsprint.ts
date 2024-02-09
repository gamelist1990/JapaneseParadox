import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiINVALIDSPRINT } from "../../../../modules/uiInvalidSprint";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import ConfigInterface from "../../../../../interfaces/Config";

export function invalidSprintHandler(player: Player) {
    //Invalid Sprint
    const modulesinvalidsprintui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const invalidSprintABoolean = configuration.modules.invalidsprintA.enabled;
    modulesinvalidsprintui.title("§4Paradox Modules - Invalid Sprint§4");
    modulesinvalidsprintui.toggle("Invalid Sprint - Checks for illegal sprinting with blindness effect:", invalidSprintABoolean);
    modulesinvalidsprintui
        .show(player)
        .then((invalidsprintResult) => {
            uiINVALIDSPRINT(invalidsprintResult, player);
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

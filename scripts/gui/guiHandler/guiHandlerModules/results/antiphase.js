import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIPHASE } from "../../../modules/uiAntiPhase";
export function antiPhaseAHandler(player) {
    const modulesantiphaseui = new ModalFormData();
    const antiPhaseBoolean = dynamicPropertyRegistry.get("antiphasea_b");
    modulesantiphaseui.title("§4ブロックの中に入るやつ検知§4");
    modulesantiphaseui.toggle("Anti Phase ブロックすり抜けを検知します", antiPhaseBoolean);
    modulesantiphaseui
        .show(player)
        .then((antiphaseResult) => {
        uiANTIPHASE(antiphaseResult, player);
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

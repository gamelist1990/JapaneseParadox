import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIPHASE } from "../../../modules/uiAntiPhase";

export function antiPhaseAHandler(player) {
    const modulesantiphaseui = new ModalFormData();
    const antiPhaseBoolean = dynamicPropertyRegistry.get("antiphasea_b");
    modulesantiphaseui.title("§4壁抜けしてるプレイヤーを検知§4");
    modulesantiphaseui.toggle("壁抜けしているプレイヤーを検知します", antiPhaseBoolean);
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
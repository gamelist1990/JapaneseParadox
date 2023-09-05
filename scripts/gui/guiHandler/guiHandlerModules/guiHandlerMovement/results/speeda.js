import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiSPEED } from "../../../../modules/uiSpeed";

export function speedAHandler(player) {
    //SpeedA
    const modulesspeedui = new ModalFormData();
    const speedABoolean = dynamicPropertyRegistry.get("speeda_b");
    modulesspeedui.title("§4早すぎるスピードを検知§4");
    modulesspeedui.toggle("SpeedHACKを使ってるプレイヤーを検知します！！", speedABoolean);
    modulesspeedui
        .show(player)
        .then((invalidsprintResult) => {
            uiSPEED(invalidsprintResult, player);
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
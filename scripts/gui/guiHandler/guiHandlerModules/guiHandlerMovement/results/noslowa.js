import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiNOWSLOW } from "../../../../modules/uiNowslow";
export function noSlowAHandler(player) {
    //NoSlowA
    const modulesnoslowui = new ModalFormData();
    const noSlowBoolean = dynamicPropertyRegistry.get("noslowa_b");
    modulesnoslowui.title("§4早すぎるスピード検知§4");
    modulesnoslowui.toggle("早すぎる動きを検知します", noSlowBoolean);
    modulesnoslowui
        .show(player)
        .then((invalidsprintResult) => {
        uiNOWSLOW(invalidsprintResult, player);
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

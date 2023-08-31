import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIFALL } from "../../../../modules/uiAntiFall";
export function antiFallHandler(player) {
    //Anti Fall
    const modulesantifallui = new ModalFormData();
    const antifallABoolean = dynamicPropertyRegistry.get("antifalla_b");
    modulesantifallui.title("§4落下ダメ無効§4");
    modulesantifallui.toggle("有効か無効選んでください", antifallABoolean);
    modulesantifallui
        .show(player)
        .then((antifallResult) => {
        uiANTIFALL(antifallResult, player);
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

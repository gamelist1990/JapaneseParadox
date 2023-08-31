import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiOPS } from "../../../modules/uiOnePlayerSleep";
export function opsHandler(player) {
    const modulesopsui = new ModalFormData();
    const opsBoolean = dynamicPropertyRegistry.get("ops_b");
    modulesopsui.title("§4めっちゃ便利マルチだと特に§4");
                        modulesopsui.toggle("夜になったとき一人でも寝たら朝になります！！", opsBoolean);
    modulesopsui
        .show(player)
        .then((opsResult) => {
        uiOPS(opsResult, player);
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

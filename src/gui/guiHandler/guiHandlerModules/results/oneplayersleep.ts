import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiOPS } from "../../../modules/uiOnePlayerSleep";

export function opsHandler(player: Player) {
    const modulesopsui = new ModalFormData();
    const opsBoolean = dynamicPropertyRegistry.get("ops_b") as boolean;
    modulesopsui.title("§4メニュー：OPS§4");
    modulesopsui.toggle("レルムズ用複数人で寝なくても一人寝れば朝になります:", opsBoolean);
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

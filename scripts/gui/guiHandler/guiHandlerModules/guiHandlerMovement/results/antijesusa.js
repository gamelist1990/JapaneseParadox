import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIJESUS } from "../../../../modules/uiAntiJesus";
export function antiJesusAHandler(player) {
    //Jesus UI
    const modulesantijesusui = new ModalFormData();
    const jesusaBoolean = dynamicPropertyRegistry.get("jesusa_b");
    modulesantijesusui.title("§4水の上歩いてるやつ検知　（機能するけどHorionはもう無理）§4");
    modulesantijesusui.toggle("Horion以外なら検知可能", jesusaBoolean);
    modulesantijesusui
        .show(player)
        .then((antijesusResult) => {
        uiANTIJESUS(antijesusResult, player);
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

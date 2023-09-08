import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIKNOCKBACK } from "../../../../modules/uiAntiKnockback";
export function antiKnockBackHandler(player) {
    //Anti Knockback UI
    const modulesantiknockbackui = new ModalFormData();
    const antikbBoolean = dynamicPropertyRegistry.get("antikb_b");
    modulesantiknockbackui.title("§4メニュー：Anti KnockBack§4");
    modulesantiknockbackui.toggle("プレイヤーがノックバックしなかったら検知します:", antikbBoolean);
    modulesantiknockbackui
        .show(player)
        .then((antikbResult) => {
        uiANTIKNOCKBACK(antikbResult, player);
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

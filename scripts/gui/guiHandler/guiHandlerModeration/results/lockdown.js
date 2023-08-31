import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiLOCKDOWN } from "../../../moderation/uiLockdown";
export function lockdownHandler(player) {
    //Lockdown ui
    const lockdownui = new ModalFormData();
    // Get Dynamic Property Boolean
    const lockdownBoolean = dynamicPropertyRegistry.get("lockdown_b");
    lockdownui.title("§4メンテナンス！§4");
    lockdownui.textField("メンテナンス理由:", "例:ただいまメンテナンス中です！！");
    lockdownui.toggle("メンテナンスを有効又は無効にする", lockdownBoolean);
    lockdownui
        .show(player)
        .then((lockdownResult) => {
        uiLOCKDOWN(lockdownResult, player);
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

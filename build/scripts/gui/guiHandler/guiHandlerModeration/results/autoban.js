import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { ModalFormData } from "@minecraft/server-ui";
import { uiAUTOBAN } from "../../../moderation/uiAutoBan";
export function autobanHandler(player) {
    const autoBanBoolean = dynamicPropertyRegistry.get("autoban_b");
    const autobanui = new ModalFormData();
    autobanui.title("§4メニュー：自動BAN§4");
    autobanui.toggle("機能を有効又は無効にします", autoBanBoolean);
    autobanui
        .show(player)
        .then((autobanResult) => {
        uiAUTOBAN(autobanResult, player);
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

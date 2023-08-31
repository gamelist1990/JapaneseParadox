import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { ModalFormData } from "@minecraft/server-ui";
import { uiAUTOBAN } from "../../../moderation/uiAutoBan";
export function autobanHandler(player) {
    const autoBanBoolean = dynamicPropertyRegistry.get("autoban_b");
    const autobanui = new ModalFormData();
    autobanui.title("§4自動Ban§4");
    autobanui.toggle("自動banを有効化又は無効化する", autoBanBoolean);
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

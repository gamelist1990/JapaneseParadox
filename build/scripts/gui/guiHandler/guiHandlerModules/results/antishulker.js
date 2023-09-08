import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTISHULKER } from "../../../modules/uiAntiShulker";
export function antiShulkerHandler(player) {
    const modulesantishulkerui = new ModalFormData();
    const antiShulkerBoolean = dynamicPropertyRegistry.get("antishulker_b");
    modulesantishulkerui.title("§4メニュー：Anti Shulker§4");
    modulesantishulkerui.toggle("シュルカーの使用を禁止します", antiShulkerBoolean);
    modulesantishulkerui
        .show(player)
        .then((antishulkerResult) => {
        uiANTISHULKER(antishulkerResult, player);
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

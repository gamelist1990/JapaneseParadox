import { ModalFormData } from "@minecraft/server-ui";
import { uiItemEditorRepair } from "./uiItemEditor";
export function uiItemEditorRepairMenu(player, targetPlayer, itemSlot) {
    handleUIitemEditorRepairMenu(player, targetPlayer, itemSlot).catch((error) => {
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
    async function handleUIitemEditorRepairMenu(player, targetPlayer, itemSlot) {
        const repairMenu = new ModalFormData();
        //Show the stats for the item.
        repairMenu.title("§4アイテムの修理§4");
        repairMenu.toggle("修理する", false);
        repairMenu.show(player).then((InvEditorMenuUIResult) => {
            uiItemEditorRepair(InvEditorMenuUIResult, player, targetPlayer, itemSlot);
        });
    }
}

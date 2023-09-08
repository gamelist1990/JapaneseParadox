import { ModalFormData } from "@minecraft/server-ui";
import { uiItemEditorName } from "./uiItemEditor";
export function uiItemEditorNameMenu(player, targetPlayer, itemSlot) {
    const itemEditor = new ModalFormData();
    itemEditor.title("§4インベントリ：名前の変更をアイテム置き換え§4");
    itemEditor.toggle("名前を変える", false);
    itemEditor.textField("名前", "最強の剣");
    itemEditor.toggle("アイテムの説明", false);
    itemEditor.textField("説明内容", "例：攻撃力1,防御力0");
    itemEditor
        .show(player)
        .then((InvEditorUIResult) => {
        uiItemEditorName(InvEditorUIResult, player, targetPlayer, itemSlot);
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

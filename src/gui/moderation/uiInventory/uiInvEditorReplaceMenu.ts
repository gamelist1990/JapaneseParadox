import { Player, Vector3 } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiItemEditorReplace } from "./uiItemEditor";
export function uiItemEditorReplaceMenu(player: Player, targetPlayer: Player, itemSlot: number) {
    const itemEditor = new ModalFormData();
    itemEditor.title("§4インベントリ：アイテム置き換えと消去§4");
    itemEditor.toggle("アイテムを置き換え", false);
    itemEditor.textField("置き換えるアイテムの名前", "例：wooden_sword");
    itemEditor.toggle("アイテムを消す", false);
    itemEditor
        .show(player)
        .then((InvEditorUIResult) => {
            uiItemEditorReplace(InvEditorUIResult, player, targetPlayer, itemSlot);
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

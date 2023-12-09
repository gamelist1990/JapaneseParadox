import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiItemEditorReplace } from "./uiItemEditor";

export function uiItemEditorReplaceMenu(player: Player, targetPlayer: Player, itemSlot: number) {
    const itemEditor = new ModalFormData();
    itemEditor.title("§4アイテムエディター アイテムの置換§4");
    itemEditor.toggle("アイテムの置換", false);
    itemEditor.textField("アイテム名", "wooden_sword");
    itemEditor.toggle("アイテムの削除", false);
    itemEditor
        .show(player)
        .then((InvEditorUIResult) => {
            uiItemEditorReplace(InvEditorUIResult, player, targetPlayer, itemSlot);
        })
        .catch((error) => {
            console.error("Paradox 未処理の拒否: ", error);
            // スタックトレース情報の抽出
            if (error instanceof Error) {
                const stackLines = error.stack.split("\n");
                if (stackLines.length > 1) {
                    const sourceInfo = stackLines;
                    console.error("エラーの発生源：", sourceInfo[0]);
                }
            }
        });
}

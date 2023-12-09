import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiItemEditorName } from "./uiItemEditor";

export function uiItemEditorNameMenu(player: Player, targetPlayer: Player, itemSlot: number) {
    const itemEditor = new ModalFormData();
    itemEditor.title("§4アイテムエディター名前＆伝説§4");
    itemEditor.toggle("アイテムの名前を変更", false);
    itemEditor.textField("名前", "MyCoolItem");
    itemEditor.toggle("伝説を編集", false);
    itemEditor.textField("伝説", "Lore1,Lore2,Lore3");
    itemEditor
        .show(player)
        .then((InvEditorUIResult) => {
            uiItemEditorName(InvEditorUIResult, player, targetPlayer, itemSlot);
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

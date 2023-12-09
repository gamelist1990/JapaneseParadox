import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiItemEditorEnchantments } from "./uiItemEditor";
export function uiItemEditorEnchantmentsMenu(player: Player, targetPlayer: Player, itemSlot: number) {
    const itemEditor = new ModalFormData();
    itemEditor.title("§4Paradox - アイテムエディター・エンチャント§4");
    itemEditor.toggle("エンチャントを追加", false);
    itemEditor.textField("魅惑", "ノックバック");
    itemEditor.textField("エンチャント値", "3");
    itemEditor.toggle("エンチャントを取り除く", false);
    itemEditor.textField("魅惑", "ノックバック");
    itemEditor
        .show(player)
        .then((InvEditorUIResult) => {
            uiItemEditorEnchantments(InvEditorUIResult, player, targetPlayer, itemSlot);
        })
        .catch((error) => {
            console.error("Paradoxの未処理拒否：", error);
            // スタックトレース情報の抽出
            if (error instanceof Error) {
                const stackLines = error.stack.split("\n");
                if (stackLines.length > 1) {
                    const sourceInfo = stackLines;
                    console.error("エラーの原因", sourceInfo[0]);
                }
            }
        });
}

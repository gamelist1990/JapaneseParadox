import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiItemEditorRepair } from "./uiItemEditor";

export function uiItemEditorRepairMenu(player: Player, targetPlayer: Player, itemSlot: number) {
    handleUIitemEditorRepairMenu(player, targetPlayer, itemSlot).catch((error) => {
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

    async function handleUIitemEditorRepairMenu(player: Player, targetPlayer: Player, itemSlot: number) {
        const repairMenu = new ModalFormData();
        //アイテムのステータスを表示します。
        repairMenu.title("§4アイテムエディター修復§4");
        repairMenu.toggle("アイテムを修復", false);
        repairMenu.show(player).then((InvEditorMenuUIResult) => {
            uiItemEditorRepair(InvEditorMenuUIResult, player, targetPlayer, itemSlot);
        });
    }
}

import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiINVENTORY } from "../../../moderation/uiInventory";
export function inventoryHandler(player: Player) {
    const inventoryUI = new ModalFormData();
    inventoryUI.title("§4Inventory Managementメニュー§4");
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    inventoryUI.dropdown(`\n§f指定した ユーザーを見る:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    inventoryUI
        .show(player)
        .then((inventoryUIResult) => {
            uiINVENTORY(inventoryUIResult, onlineList, player);
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

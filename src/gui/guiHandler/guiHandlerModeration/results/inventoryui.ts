import { Player, world } from "@minecraft/server";
import config from "../../../../data/config";
import { ModalFormData } from "@minecraft/server-ui";
import { uiINVENTORY } from "../../../moderation/uiInventory";

export function inventoryHandler(player: Player) {
    if (config.debug === true) {
        const inventoryUI = new ModalFormData();
        inventoryUI.title("§4メニュー：アイテム欄を確認§4");
        let onlineList: string[] = [];
        onlineList = Array.from(world.getPlayers(), (player) => player.name);
        inventoryUI.dropdown(`\n§fアイテム欄を見たいプレイヤーを選択:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
        inventoryUI
            .show(player)
            .then((inventoryUIResult) => {
                uiINVENTORY(inventoryUIResult, onlineList, player);
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
}

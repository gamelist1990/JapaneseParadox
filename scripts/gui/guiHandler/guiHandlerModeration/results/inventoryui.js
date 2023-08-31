import { world } from "@minecraft/server";
import config from "../../../../data/config";
import { ModalFormData } from "@minecraft/server-ui";
import { uiINVENTORY } from "../../../moderation/uiInventory";
export function inventoryHandler(player) {
    if (config.debug === true) {
        const inventoryUI = new ModalFormData();
        inventoryUI.title("§4インベントリ【Beta】§4");
        let onlineList = [];
        onlineList = Array.from(world.getPlayers(), (player) => player.name);
        inventoryUI.dropdown(`\n§f指定したプレイヤーのインベントリを見れるよ！§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
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

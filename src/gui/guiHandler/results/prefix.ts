import { Player, world, Vector3 } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiPREFIX } from "../../moderation/uiPrefix";

export function prefixHandler(player: Player) {
    //Prefix ui
    const prefixui = new ModalFormData();
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    prefixui.title("§4起動文字変更§4");
    prefixui.dropdown(`\n変えたい文字指定:\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    prefixui.textField(`\n文字:\n`, `新しい起動文字`, null);
    prefixui.toggle(`\nリセット:`, false);
    prefixui
        .show(player)
        .then((prefixResult) => {
            //Prefix logic
            uiPREFIX(prefixResult, onlineList, player);
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

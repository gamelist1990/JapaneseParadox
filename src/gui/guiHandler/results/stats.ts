import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiSTATS } from "../../moderation/uiStats";

export function statsHandler(player: Player) {
    //UI Stats
    const statsui = new ModalFormData();
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    statsui.title("§4ユーザーログ§4");
    statsui.dropdown(`\n§fユーザーを指定§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    statsui
        .show(player)
        .then((statsResult) => {
            uiSTATS(statsResult, onlineList, player);
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

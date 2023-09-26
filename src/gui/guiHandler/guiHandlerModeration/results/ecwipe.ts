import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiEWIPE } from "../../../moderation/uiEwipe";

export function ecwipeHandler(player: Player) {
    const ewipeui = new ModalFormData();
    ewipeui.title("§4エンダーチェストの中身を消す§4");
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    ewipeui.dropdown(`\n§f消したいプレイヤーを指定:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    ewipeui
        .show(player)
        .then((ewipeResult) => {
            uiEWIPE(ewipeResult, onlineList, player);
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

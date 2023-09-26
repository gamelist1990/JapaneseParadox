import { Player, world, Vector3 } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiKICK } from "../../../moderation/uiKick";

export function kickHandler(player: Player) {
    const kickui = new ModalFormData();
    kickui.title("§4キックメニュー§4");
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    kickui.dropdown(`\n§fキックしたいユーザーを指定§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    kickui.textField("理由:", "荒らし!");

    kickui
        .show(player)
        .then((kickResult) => {
            uiKICK(kickResult, onlineList, player);
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

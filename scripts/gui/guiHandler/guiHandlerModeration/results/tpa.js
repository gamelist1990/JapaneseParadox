import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiTPA } from "../../../moderation/uiTpa";
export function tpaHandler(player) {
    const tpaui = new ModalFormData();
    tpaui.title("§4テレポート§4");
    let onlineList = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    tpaui.dropdown(`\n§fTPしたいプレイヤーを選択§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    tpaui.toggle("相手のところにTP:", true);
    tpaui.toggle("自分のところにTP:", false);
    tpaui
        .show(player)
        .then((tpaResult) => {
        uiTPA(tpaResult, onlineList, player);
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

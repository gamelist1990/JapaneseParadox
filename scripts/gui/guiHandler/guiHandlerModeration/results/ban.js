import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiBAN } from "../../../moderation/uiBan";
export function banHandler(player) {
    //show ban ui here
    const banui = new ModalFormData();
    let onlineList = [];
    banui.title("§4BAN§4");
                        onlineList = Array.from(world.getPlayers(), (player) => player.name);
                        banui.dropdown(`\n§fプレイヤーを指定してください§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
                        banui.textField(`Ban理由`, `Banする理由を書いてください`);
    banui
        .show(player)
        .then((banResult) => {
        //ban function goes here
        uiBAN(banResult, onlineList, player);
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

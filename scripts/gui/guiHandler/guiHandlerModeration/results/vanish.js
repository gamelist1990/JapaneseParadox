import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiVANISH } from "../../../moderation/uiVanish";
export function vanishHandler(player) {
    const vanishui = new ModalFormData();
    vanishui.title("§4透明化できるよ§4");
    let onlineList = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    vanishui.dropdown(`\n§f指定したプレイヤーを透明化できます【ドッキリにいいかも】§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    vanishui
        .show(player)
        .then((vanishResult) => {
        uiVANISH(vanishResult, onlineList, player);
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
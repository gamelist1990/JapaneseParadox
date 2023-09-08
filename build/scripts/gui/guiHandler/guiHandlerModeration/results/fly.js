import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiFLY } from "../../../moderation/uiFly";
export function flyHandler(player) {
    const flyui = new ModalFormData();
    flyui.title("§4飛行モード§4");
    let onlineList = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    flyui.dropdown(`\n§f飛行させたいプレイヤーを指定無効する場合も同様に:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    flyui
        .show(player)
        .then((flyResult) => {
        uiFLY(flyResult, onlineList, player);
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

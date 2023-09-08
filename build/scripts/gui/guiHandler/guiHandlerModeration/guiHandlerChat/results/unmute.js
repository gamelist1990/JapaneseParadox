import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiUNMUTE } from "../../../../moderation/uiUnmute";
export function unmuteHandler(player) {
    //UnMute ui
    const unmuteui = new ModalFormData();
    let onlineList = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    unmuteui.title("§4Mute A Player In Chat§4");
    unmuteui.dropdown(`\n§fSelect a player to unmute:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    unmuteui.textField("Reason:", "Permissions to talk in chat.");
    unmuteui
        .show(player)
        .then((muteResult) => {
        uiUNMUTE(muteResult, onlineList, player);
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

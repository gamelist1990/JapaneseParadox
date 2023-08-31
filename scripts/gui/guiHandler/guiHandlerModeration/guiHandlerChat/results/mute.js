import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiMUTE } from "../../../../moderation/uiMute";
export function muteHandler(player) {
    //Mute ui
    const muteui = new ModalFormData();
    let onlineList = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    muteui.title("§4ミュート§4");
    muteui.dropdown(`\n§f指定したプレイヤーをミュートにします§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    muteui.textField("理由:", "");
    muteui
        .show(player)
        .then((muteResult) => {
        uiMUTE(muteResult, onlineList, player);
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

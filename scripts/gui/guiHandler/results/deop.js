import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiDEOP } from "../../moderation/uiDeop";
export function deopHandler(player) {
    // New window for deop
    const deopgui = new ModalFormData();
    let onlineList = [];
    deopgui.title("§4管理者権限剝奪§4");
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    deopgui.dropdown(`\n§r権限を剝奪したいプレイヤーを選択§r\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    deopgui
        .show(player)
        .then((opResult) => {
        uiDEOP(opResult, onlineList, player);
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

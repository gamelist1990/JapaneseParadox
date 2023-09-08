import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiFREEZE } from "../../../moderation/uiFreeze";
export function freezeHandler(player) {
    const freezeui = new ModalFormData();
    freezeui.title("§4プレイヤーをフリーズさせます.§4");
    let onlineList = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    freezeui.dropdown(`\n§f行動を制限したいユーザーを選択§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    freezeui
        .show(player)
        .then((freezeResult) => {
        uiFREEZE(freezeResult, onlineList, player);
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

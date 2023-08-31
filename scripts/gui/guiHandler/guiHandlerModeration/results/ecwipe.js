import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiEWIPE } from "../../../moderation/uiEwipe";
export function ecwipeHandler(player) {
    const ewipeui = new ModalFormData();
    ewipeui.title("§4エンダーチェストの中身削除§4");
                        let onlineList = [];
                        onlineList = Array.from(world.getPlayers(), (player) => player.name);
                        ewipeui.dropdown(`\n§f指定したプレイヤーのエンダーチェストを消します§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
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

import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiPREFIX } from "../../moderation/uiPrefix";
export function prefixHandler(player) {
    //Prefix ui
    const prefixui = new ModalFormData();
    let onlineList = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    prefixui.title("§4!を変える§4");
    prefixui.dropdown(`\n</>以外になら変えれます\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    prefixui.textField(`\nデフォルト<!>:\n`, `新しい文字を入れてね例:　- とか`, null);
    prefixui.toggle(`\nデフォルトに戻る（バグった時用）:`, false);
    prefixui
        .show(player)
        .then((prefixResult) => {
        //Prefix logic
        uiPREFIX(prefixResult, onlineList, player);
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

import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiNOTIFY } from "../../../../moderation/uiNotify";

export function notifyHandler(player: Player) {
    //notify ui
    const notifyui = new ModalFormData();
    let onlineList: string[] = [];
    notifyui.title("§4Enable or Disable Notifications§4");
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    notifyui.dropdown(`\n§fSelect a player to Enable or Disable Notifications:§f\n\nPlayer's Online\n`, onlineList);
    //by default set the current value to disabled.
    notifyui.toggle("Notifications:", false);
    notifyui
        .show(player)
        .then((notifyResult) => {
            uiNOTIFY(notifyResult, onlineList, player);
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

import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiManagePlayerSavedLocations } from "../../../moderation/uiManagePlayerSavedLocations";
export function managePlayerSavedLocationsHandler(player) {
    const managePlayerSavedLocationsUI = new ModalFormData();
    managePlayerSavedLocationsUI.title("§4座標管理§4");
    let onlineList = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    managePlayerSavedLocationsUI.dropdown(`\n§f指定したプレイヤーの座標を削除できます【追加できません】§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    managePlayerSavedLocationsUI
        .show(player)
        .then((managePlayerSavedLocationsUIResult) => {
        uiManagePlayerSavedLocations(managePlayerSavedLocationsUIResult, onlineList, player);
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

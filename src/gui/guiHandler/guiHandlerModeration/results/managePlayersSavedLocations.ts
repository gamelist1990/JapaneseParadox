import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiManagePlayerSavedLocations } from "../../../moderation/uiManagePlayerSavedLocations";

export function managePlayerSavedLocationsHandler(player: Player) {
    const managePlayerSavedLocationsUI = new ModalFormData();
    managePlayerSavedLocationsUI.title("§4座標を管理§4");
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    managePlayerSavedLocationsUI.dropdown(`\n§fユーザーを選択管理：§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    managePlayerSavedLocationsUI
        .show(player)
        .then((managePlayerSavedLocationsUIResult) => {
            uiManagePlayerSavedLocations(managePlayerSavedLocationsUIResult, onlineList, player);
        })
        .catch((error) => {
            console.error("Paradoxの未処理拒否：", error);
            // スタックトレース情報の抽出
            if (error instanceof Error) {
                const stackLines = error.stack.split("\n");
                if (stackLines.length > 1) {
                    const sourceInfo = stackLines;
                    console.error("エラーの原因", sourceInfo[0]);
                }
            }
        });
}

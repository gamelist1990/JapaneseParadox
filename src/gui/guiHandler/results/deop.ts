import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiDEOP } from "../../moderation/uiDeop";

export function deopHandler(player: Player) {
    // New window for deop
    const deopgui = new ModalFormData();
    let onlineList: string[] = [];
    deopgui.title("§4管理者権限剝奪§4");
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    deopgui.dropdown(`\n§fユーザーを選択:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
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

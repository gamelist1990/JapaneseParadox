import { Player, world, Vector3 } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiTPA } from "../../../moderation/uiTpa";

export function tpaHandler(player: Player) {
    const tpaui = new ModalFormData();
    tpaui.title("§4TPメニュー§4");
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    tpaui.dropdown(`\n§fTPしたいプレイヤー選択:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    tpaui.toggle("指定したプレイヤーにTP:", true);
    tpaui.toggle("指定プレイヤーを自分にTP", false);
    tpaui
        .show(player)
        .then((tpaResult) => {
            uiTPA(tpaResult, onlineList, player);
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

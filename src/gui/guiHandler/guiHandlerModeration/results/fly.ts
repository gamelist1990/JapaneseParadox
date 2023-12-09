import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiFLY } from "../../../moderation/uiFly";

export function flyHandler(player: Player) {
    const flyui = new ModalFormData();
    flyui.title("§4Grant A Player Fly Abilitiesメニュー§4");
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    flyui.dropdown(`\n§f指定したユーザーを飛ばせる:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    flyui
        .show(player)
        .then((flyResult) => {
            uiFLY(flyResult, onlineList, player);
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

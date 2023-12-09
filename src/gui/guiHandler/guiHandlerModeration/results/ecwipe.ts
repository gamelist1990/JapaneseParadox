import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiEWIPE } from "../../../moderation/uiEwipe";

export function ecwipeHandler(player: Player) {
    const ewipeui = new ModalFormData();
    ewipeui.title("§4Wipe A Player's Enderchestメニュー§4");
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    ewipeui.dropdown(`\n§f指定したユーザーをエンダーチェストを消す:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    ewipeui
        .show(player)
        .then((ewipeResult) => {
            uiEWIPE(ewipeResult, onlineList, player);
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

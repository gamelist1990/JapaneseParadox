import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiFREEZE } from "../../../moderation/uiFreeze";

export function freezeHandler(player: Player) {
    const freezeui = new ModalFormData();
    freezeui.title("§4Freeze A Playerメニュー.§4");
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    freezeui.dropdown(`\n§f指定したユーザーをフリーズさせる:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    freezeui
        .show(player)
        .then((freezeResult) => {
            uiFREEZE(freezeResult, onlineList, player);
        })
        .catch((error) => {
            console.error("パラドックスの未処理拒否：", error);
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

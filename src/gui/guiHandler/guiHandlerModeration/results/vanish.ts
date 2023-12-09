import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiVANISH } from "../../../moderation/uiVanish";

export function vanishHandler(player: Player) {
    const vanishui = new ModalFormData();
    vanishui.title("§4Vanish From The Serverメニュー§4");
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    vanishui.dropdown(`\n§f指定したユーザーをvanish:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    vanishui
        .show(player)
        .then((vanishResult) => {
            uiVANISH(vanishResult, onlineList, player);
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

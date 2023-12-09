import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiKICK } from "../../../moderation/uiKick";

export function kickHandler(player: Player) {
    const kickui = new ModalFormData();
    kickui.title("§4Kick A Playerメニュー§4");
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    kickui.dropdown(`\n§f指定したユーザーをキック:§f\n\n以下のユーザーがオンラインです！\n`, onlineList);
    kickui.textField("理由", "ハッキングだ！");

    kickui
        .show(player)
        .then((kickResult) => {
            uiKICK(kickResult, onlineList, player);
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

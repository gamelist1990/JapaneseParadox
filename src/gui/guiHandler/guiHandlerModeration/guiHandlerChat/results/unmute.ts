import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiUNMUTE } from "../../../../moderation/uiUnmute";

export function unmuteHandler(player: Player) {
    //オニオンのミュート解除
    const unmuteui = new ModalFormData();
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    unmuteui.title("§4Mute A Player In Chatメニュー§4");
    unmuteui.dropdown(`\n§f指定したユーザーをミュート解除する:§f\n\n以下のユーザーがオンラインです！\n`, onlineList);
    unmuteui.textField("理由", "チャットでの会話を許可する。");
    unmuteui
        .show(player)
        .then((muteResult) => {
            uiUNMUTE(muteResult, onlineList, player);
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

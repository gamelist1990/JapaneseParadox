import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiMUTE } from "../../../../moderation/uiMute";

export function muteHandler(player: Player) {
    //ミュート・オニオン
    const muteui = new ModalFormData();
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    muteui.title("§4Mute A Player In Chatメニュー§4");
    muteui.dropdown(`\n§f指定したユーザーをmute:§f\n\n以下のユーザーがオンラインです！\n`, onlineList);
    muteui.textField("理由", "ディスコードのリンクを貼っている。");
    muteui
        .show(player)
        .then((muteResult) => {
            uiMUTE(muteResult, onlineList, player);
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

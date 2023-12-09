import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiBAN } from "../../../moderation/uiBan";

export function banHandler(player: Player) {
    //ここにバンを表示する
    const banui = new ModalFormData();
    let onlineList: string[] = [];

    banui.title("§4Ban A Playerメニュー§4");
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    banui.dropdown(`\n§f指定したユーザーをBan:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    banui.textField(`理由`, `理由を入力してください。`);
    banui
        .show(player)
        .then((banResult) => {
            //禁止機能はここにある
            uiBAN(banResult, onlineList, player);
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

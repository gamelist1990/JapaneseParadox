import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiUNBAN } from "../../../moderation/uiUnban";

export function unbanHandler(player: Player) {
    //ここに禁止解除のUIを表示する
    const unbanui = new ModalFormData();
    unbanui.title("§4Unban A Playerメニュー§4");
    unbanui.textField(`選手`, `ユーザー名を入力してください。`);
    unbanui.toggle("禁止解除キューからプレーヤーを削除する：", false);
    unbanui
        .show(player)
        .then((unbanResult) => {
            uiUNBAN(unbanResult, player);
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

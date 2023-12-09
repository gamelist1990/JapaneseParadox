import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiNOTIFY } from "../../../../moderation/uiNotify";

export function notifyHandler(player: Player) {
    //ui を通知する
    const notifyui = new ModalFormData();
    let onlineList: string[] = [];
    notifyui.title("§4Enable or Disable Notificationsメニュー§4");
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    notifyui.dropdown(`\n§f通知を許可する§f\n\n以下のユーザーがオンラインです！\n`, onlineList);
    //デフォルトでは、現在の値をdisabledに設定する。
    notifyui.toggle("通知", false);
    notifyui
        .show(player)
        .then((notifyResult) => {
            uiNOTIFY(notifyResult, onlineList, player);
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

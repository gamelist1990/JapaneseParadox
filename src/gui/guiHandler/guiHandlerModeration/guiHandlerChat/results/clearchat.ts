import { Player } from "@minecraft/server";
import { MessageFormData } from "@minecraft/server-ui";
import { uiCLEARCHAT } from "../../../../moderation/uiClearchat";
import { paradoxui } from "../../../../paradoxui";

export function clearChatHandler(player: Player) {
    //クリアチャットui
    const clearchatui = new MessageFormData();
    clearchatui.title("§4Clear Chatメニュー§4");
    clearchatui.body("本当にチャットをクリアにしますか？");
    clearchatui.button1("はい");
    clearchatui.button2("いいえ");
    clearchatui
        .show(player)
        .then((clearchatResult) => {
            if (clearchatResult.selection === 0) {
                uiCLEARCHAT(player);
            }
            if (clearchatResult.selection === 1) {
                paradoxui(player);
            }
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

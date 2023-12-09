import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { notifyHandler } from "./results/notify";
import { chatRanksHandler } from "./results/chatranks";
import { muteHandler } from "./results/mute";
import { unmuteHandler } from "./results/unmute";
import { clearChatHandler } from "./results/clearchat";

export function chatui(player: Player) {
    //ショーチャットUI
    const chatui = new ActionFormData();
    chatui.title("§4Configure Chatメニュー§4");
    chatui.body("§eチャットに関する設定.§e");
    chatui.button("通知", "textures/ui/chat_send");
    chatui.button("階級", "textures/ui/saleribbon");
    chatui.button("ミュート", "textures/ui/mute_on");
    chatui.button("ミュート解除", "textures/ui/mute_off");
    chatui.button("クリア・チャット", "textures/ui/cancel");
    chatui
        .show(player)
        .then((chatResult) => {
            // switch文を使用して、異なる選択を処理する
            switch (chatResult.selection) {
                case 0:
                    notifyHandler(player);
                    break;
                case 1:
                    chatRanksHandler(player);
                    break;
                case 2:
                    muteHandler(player);
                    break;
                case 3:
                    unmuteHandler(player);
                    break;
                case 4:
                    clearChatHandler(player);
                    break;
                default:
                    break;
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

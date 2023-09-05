import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiChatChannelCreate } from "./uiChatChannels";
export function chatChannelsCreateMenuUI(player) {
    const menu = new ModalFormData();
    menu.title("§4チャンネルを作成§4");
    menu.textField("チャンネルの名前: ", "ワイワイクラブ！【日本語が使用できるかは不明】");
    menu.textField("パスワード:", "例：pass123");
    menu.show(player)
        .then((chatChannelsCreateResult) => {
            uiChatChannelCreate(chatChannelsCreateResult, player);
        })
        .catch((error) => {
            console.error("Paradox Unhandled Rejection: ", error);
            // Extract stack trace information
            if (error instanceof Error) {
                const stackLines = error.stack.split("\n");
                if (stackLines.length > 1) {
                    const sourceInfo = stackLines;
                    console.error("Error originated from:", sourceInfo[0]);
                }
            }
        });
}
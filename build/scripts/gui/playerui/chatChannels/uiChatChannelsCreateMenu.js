import { ModalFormData } from "@minecraft/server-ui";
import { uiChatChannelCreate } from "./uiChatChannels";
export function chatChannelsCreateMenuUI(player) {
    const menu = new ModalFormData();
    menu.title("§4メニュー：チャンネル作成§4");
    menu.textField("チャンネル名前: ", "Test");
    menu.textField("パスワード:", "Password123");
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

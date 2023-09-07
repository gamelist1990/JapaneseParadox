import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { listChatChannels } from "../../../util";
import { uiChatChannelLeave } from "./uiChatChannels";
export function chatChannelsLeaveMenuUI(player) {
    const menu = new ModalFormData();
    const channelsList = listChatChannels();
    const channelDropdownData = channelsList.map((channel) => ({
        text: `${channel.channelName}, §fパスワード: ${channel.hasPassword === "Yes" ? "§aYes" : "§cNo"}`,
        value: channel.channelName,
    }));
    if (channelDropdownData.length === 0) {
        channelDropdownData.push({ text: "§6チャンネルが見つかりません！", value: "" });
    }
    menu.title("§4今いるチャンネルから抜ける§4");
    menu.dropdown(`\n§fチャンネルを選択:\n\n`, channelDropdownData);
    menu.show(player)
        .then((chatChannelsLeaveResult) => {
            uiChatChannelLeave(chatChannelsLeaveResult, player, channelDropdownData);
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
import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { listChatChannels } from "../../../util";
import { uiChatChannelInvite } from "./uiChatChannels";

export function ChatChannelsInviteMenuUI(player) {
    const menu = new ModalFormData();
    menu.title("§4プレイヤーを招待§4");
    const channelsList = listChatChannels();
    //Get the current channels
    const channelDropdownData = channelsList.map((channel) => ({
        text: `${channel.channelName}, §fパスワード: ${channel.hasPassword === "Yes" ? "§aYes" : "§cNo"}`,
        value: channel.channelName,
    }));
    if (channelDropdownData.length === 0) {
        channelDropdownData.push({ text: "§6チャンネルが見つかりません", value: "" });
    }
    //Get the current players online
    let onlineList = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    menu.dropdown(`\n§f招待するプレイヤーを選択§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    menu.dropdown(`\n§f招待するチャンネルを選択:\n\n`, channelDropdownData);
    //menu.textField("Channel Password: ", "");
    menu.show(player)
        .then((chatChannelsInviteResult) => {
            uiChatChannelInvite(chatChannelsInviteResult, player, channelDropdownData, onlineList);
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
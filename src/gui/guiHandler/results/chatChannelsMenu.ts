import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { chatChannelsCreateMenuUI } from "../../playerui/chatChannels/uiChatChannelsCreateMenu";
import { ChatChannelsJoinMenuUI } from "../../playerui/chatChannels/uiChatChannelsJoinMenu";
import { ChatChannelsInviteMenuUI } from "../../playerui/chatChannels/uiChatChannelsInviteMenu";
export function chatChannelMainMenu(player: Player) {
    const menu = new ActionFormData();
    menu.title("§4チャンネルメニュー！§4");
    menu.button("チャンネルを作る");
    menu.button("チャンネルに参加！");
    menu.button("プレイヤーを招待");
    menu.button("チャンネルから抜ける");
    menu.button("チャンネルを削除");
    menu.show(player).then((chatChannelsMenuUIResult) => {
        switch (chatChannelsMenuUIResult.selection) {
            case 0:
                chatChannelsCreateMenuUI(player);
                break;
            case 1:
                ChatChannelsJoinMenuUI(player);
                break;
            case 2:
                ChatChannelsInviteMenuUI(player);
            default:
                break;
        }
    });
}

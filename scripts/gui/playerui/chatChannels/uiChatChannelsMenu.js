import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { chatChannelsCreateMenuUI } from "./uiChatChannelsCreateMenu";
import { ChatChannelsJoinMenuUI } from "./uiChatChannelsJoinMenu";
export function uiChatChannelMainMenu(player) {
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
            default:
                break;
        }
    });
}
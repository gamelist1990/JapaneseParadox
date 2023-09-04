import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { chatChannelsCreateMenuUI } from "./uiChatChannelsCreateMenu";
import { ChatChannelsJoinMenuUI } from "./uiChatChannelsJoinMenu";
export function uiChatChannelMainMenu(player) {
    const menu = new ActionFormData();
    menu.title("§4Paradox - Chat Channels Menu§4");
    menu.button("Create A Channel");
    menu.button("Join A Channel");
    menu.button("Invite A Player");
    menu.button("Leave A Channel");
    menu.button("Delete A Channel");
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
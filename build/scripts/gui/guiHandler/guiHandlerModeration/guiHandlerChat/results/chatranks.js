import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiCHATRANKS } from "../../../../moderation/uiChatranks";
export function chatRanksHandler(player) {
    //Chat Ranks ui
    const chatranksui = new ModalFormData();
    let onlineList = [];
    const chatRanksBoolean = dynamicPropertyRegistry.get("chatranks_b");
    chatranksui.title("§4Change A Player's Chat Rank§4");
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    const predefinedrank = ["Owner", "Admin", "Mod", "Member"];
    chatranksui.dropdown(`\n§fSelect a player to change their rank:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    chatranksui.dropdown(`\n§fSelect a pre defined rank or you can set a custom on below:§f`, predefinedrank);
    chatranksui.textField("Enter a custom Rank:", "VIP");
    chatranksui.toggle("Chat Ranks - Enables or Disables chat ranks:", chatRanksBoolean);
    chatranksui
        .show(player)
        .then((chatranksResult) => {
        uiCHATRANKS(chatranksResult, onlineList, predefinedrank, player);
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

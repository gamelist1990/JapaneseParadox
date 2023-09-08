import { world } from "@minecraft/server";
import { getPrefix, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { TeleportRequestHandler } from "../../commands/utility/tpr.js";
export function uiTPRSEND(tprSendRequestResult, onlineList, player) {
    if (!tprSendRequestResult || tprSendRequestResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [value] = tprSendRequestResult.formValues;
    let member = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    // Are they online?
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f プレイヤーが存在しない又はオフラインです`);
    }
    //send the request to be teleported based off the player and the member requested.
    const prefix = getPrefix(player);
    const event = {
        sender: player,
        message: prefix + "tpr " + member.name,
    };
    TeleportRequestHandler(event, [member.name]);
    return paradoxui(player);
}

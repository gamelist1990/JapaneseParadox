import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { TeleportRequestHandler } from "../../commands/utility/tpr";
import { sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui";
export function uiTPR(requester: string, player: Player, respons: string) {
    let member = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(requester.toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    // オンラインですか？
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f その選手は見つからなかった！`);
    }

    // このTPRリクエストを完成させよう
    if (respons === "yes") {
        const event = {
            sender: player,
            message: "approve",
        } as ChatSendAfterEvent;
        TeleportRequestHandler(event, ["approve"]);
    }
    if (respons === "no") {
        const event = {
            sender: player,
            message: "denied",
        } as ChatSendAfterEvent;
        TeleportRequestHandler(event, ["denied"]);
    }
    return paradoxui(player);
}

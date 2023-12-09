import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { getPrefix, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { TeleportRequestHandler } from "../../commands/utility/tpr.js";

export function uiTPRSEND(tprSendRequestResult: ModalFormResponse, onlineList: string[], player: Player) {
    if (!tprSendRequestResult || tprSendRequestResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [value] = tprSendRequestResult.formValues;
    let member: Player = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value as number].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    // オンラインですか？
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f その選手は見つからなかった！`);
    }
    //プレーヤーとリクエストされたメンバーに基づいて、テレポートのリクエストを送信します。
    const prefix = getPrefix(player);
    const event = {
        sender: player,
        message: prefix + "tpr " + member.name,
    } as ChatSendAfterEvent;
    TeleportRequestHandler(event, [member.name]);

    return paradoxui(player);
}

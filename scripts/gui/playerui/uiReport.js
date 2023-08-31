import { world } from "@minecraft/server";
import { sendMsg, sendMsgToPlayer } from "../../util";
export function UIREPORTPLAYER(reportplayerResult, onlineList, player) {
    if (!reportplayerResult || reportplayerResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [value, reason] = reportplayerResult.formValues;
    let member = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    if (!member) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f !report <player> <reason>§f`);
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f プレイヤーが存在しない又はオフラインです`);
        return;
    }
    // Make sure they dont report themselves
    if (member === player) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 自分自身には報告できません`);
        return;
    }
    sendMsgToPlayer(player, `§r§4[§6Paradox§4]§r  ${member.name}§rが報告されました報告内容＝＞ ${reason}`);
    sendMsg("@a[tag=notify]", `§r§4[§6Paradox§4]§r ${player.name}§r が ${member.name}§r宛てに報告しました！報告内容＝＞ ${reason}`);
    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 報告内容を相手に送信できました`);
    return;
}

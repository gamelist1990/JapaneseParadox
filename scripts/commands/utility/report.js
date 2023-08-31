import { world } from "@minecraft/server";
import config from "../../data/config.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
function reportHelp(player, prefix) {
    let commandStatus;
    if (!config.customcommands.report) {
        commandStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: report`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: report [optional]`,
        `§4[§6Optional§4]§f: username, reason, help`,
        `§4[§6Description§4]§f: Reports player's to online Staff for malicious activities.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}report ${player.name}`,
        `        §4- §6Report ${player.name} to online Staff§f`,
        `    ${prefix}report ${player.name} Caught hacking!`,
        `        §4- §6Report ${player.name} for hacking with a reason§f`,
        `    ${prefix}report help`,
        `        §4- §6Show command help§f`,
    ]);
}
/**
 * @name report
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function report(message, args) {
    // Validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/moderation/ban.js:29)");
    }
    const player = message.sender;
    const reason = args.slice(1).join(" ") || "間に空白を入れないでね！！";
    // Check for custom prefix
    const prefix = getPrefix(player);
    // Are there arguements
    if (!args.length) {
        return reportHelp(player, prefix);
    }
    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.report) {
        return reportHelp(player, prefix);
    }
    // Try to find the player requested
    let member;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    if (!member) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f !report <player> <reason>§f`);
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f プレイヤーが存在しない又はオフラインです`);
    }
    // Make sure they dont report themselves
    if (member === player) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 自分自身には報告できません`);
    }
    sendMsgToPlayer(player, `§r§4[§6Paradox§4]§r ${member.name}§r が報告を受けましたしました＝＞内容： ${reason}`);
    sendMsg("@a[tag=notify]", `§r§4[§6Paradox§4]§r ${player.name}§rが ${member.name}§rに報告を送信しました内＝＞内容: ${reason}`);
}

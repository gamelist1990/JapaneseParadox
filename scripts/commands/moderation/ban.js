import { world } from "@minecraft/server";
import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
function banHelp(player, prefix) {
    let commandStatus;
    if (!config.customcommands.ban) {
        commandStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: ban`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: ban [optional]`,
        `§4[§6Optional§4]§f: username, reason, help`,
        `§4[§6Description§4]§f: Bans the specified user and optionally gives a reason.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}ban ${player.name}`,
        `        §4- §6Ban ${player.name} without specifying a reason§f`,
        `    ${prefix}ban ${player.name} Hacker!`,
        `        §4- §6Ban ${player.name} with the reason "Hacker!"§f`,
        `    ${prefix}ban ${player.name} Caught exploiting!`,
        `        §4- §6Ban ${player.name} with the reason "Caught exploiting!"§f`,
        `    ${prefix}ban help`,
        `        §4- §6Show command help§f`,
    ]);
}
/**
 * @name ban
 * @param {ChatSendAfterEvent} message - Message object
 * @param {array} args - Additional arguments provided (optional).
 */
export function ban(message, args) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/moderation/ban.js:31)");
    }
    const player = message.sender;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限がないと実行できません！！`);
    }
    // Check for custom prefix
    const prefix = getPrefix(player);
    // Are there arguements
    if (!args.length) {
        return banHelp(player, prefix);
    }
    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.ban) {
        return banHelp(player, prefix);
    }
    // Modify the argument handling
    let playerName = args.shift();
    let reason = "間に空白を入れないでね！！";
    // Check if the command has a reason provided
    if (args.length > 1) {
        // Remove double quotes from the reason if present
        reason = args
            .slice(1)
            .join(" ")
            .replace(/(^"|"$)/g, "");
    }
    // Remove double quotes from the player name if present
    playerName = playerName.replace(/(^"|"$)/g, "");
    // try to find the player requested
    let member;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(playerName.toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    // Check if player exists
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f プレイヤーが存在しない又はオフラインです`);
    }
    // make sure they dont ban themselves
    if (member === player) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 自分自身には実行できません`);
    }
    try {
        member.addTag("Reason:" + reason);
        member.addTag("By:" + player.name);
        member.addTag("isBanned");
    }
    catch (error) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ユーザーをBANできませんでした! エラー内容: ${error}`);
    }
    return sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§fが ${member.name}をBANしました§f. BAN理由: ${reason}`);
}
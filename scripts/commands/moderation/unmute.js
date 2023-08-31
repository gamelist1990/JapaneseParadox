import { world } from "@minecraft/server";
import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
function unmuteHelp(player, prefix) {
    let commandStatus;
    if (!config.customcommands.unmute) {
        commandStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: unmute`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: unmute [optional]`,
        `§4[§6Optional§4]§f: username, reason, help`,
        `§4[§6Description§4]§f: Unmutes the specified user and optionally gives a reason.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}unmute ${player.name}`,
        `        §4- §6Unmute ${player.name} without specifying a reason§f`,
        `    ${prefix}unmute ${player.name} You may chat`,
        `        §4- §6Unmute ${player.name} with the reason "You may chat"§f`,
        `    ${prefix}unmute help`,
        `        §4- §6Show command help§f`,
    ]);
}
/**
 * @name unmute
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function unmute(message, args) {
    handleUnmute(message, args).catch((error) => {
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
async function handleUnmute(message, args) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/moderation/unmute.js:30)");
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
    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.unmute) {
        return unmuteHelp(player, prefix);
    }
    // Are there arguements
    if (!args.length) {
        return unmuteHelp(player, prefix);
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
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f プレイヤーが存在しない又はオフラインです`);
    }
    // If not already muted then tag
    if (member.hasTag("isMuted")) {
        member.removeTag("isMuted");
    }
    else {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f このプレーヤーはミュートされていない。`);
    }
    // If Education Edition is enabled then legitimately unmute
    member.runCommandAsync(`ability @s mute false`);
    sendMsgToPlayer(member, `§f§4[§6Paradox§4]§f あなたはミュートが解除された。`);
    return sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§fが${member.name}のミュートを解除しました§f. 理由: ${reason}`);
}
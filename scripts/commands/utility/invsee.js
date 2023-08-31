import { world } from "@minecraft/server";
import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
function invseeHelp(player, prefix) {
    let commandStatus;
    if (!config.customcommands.invsee) {
        commandStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: invsee`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: invsee [optional]`,
        `§4[§6Optional§4]§f: username, help`,
        `§4[§6Description§4]§f: Shows the entire inventory of the specified player.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}invsee ${player.name}`,
        `        §4- §6Show the inventory of ${player.name}§f`,
        `    ${prefix}invsee help`,
        `        §4- §6Show command help§f`,
    ]);
}
// found the inventory viewing scipt in the bedrock addons discord, unsure of the original owner (not my code)
/**
 * @name invsee
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function invsee(message, args) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/utility/invsee.js:30)");
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
        return invseeHelp(player, prefix);
    }
    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.invsee) {
        return invseeHelp(player, prefix);
    }
    // try to find the player requested
    let member;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f プレイヤーが存在しない又はオフラインです`);
    }
    const inv = member.getComponent("inventory");
    const container = inv.container;
    sendMsgToPlayer(player, [
        ` `,
        `§r§4[§6Paradox§4]§r ${member.name}'s inventory:`,
        ...Array.from(Array(container.size), (_a, i) => {
            const item = container.getItem(i);
            return ` §6|§r §fアイテム欄 ${i}§r §6=>§r ${item ? `§4[§f${item.typeId.replace("minecraft:", "")}§4]§r §4x${item.amount}§6個持ってます！§r` : "§7(無し)"}`;
        }),
        ` `,
    ]);
}

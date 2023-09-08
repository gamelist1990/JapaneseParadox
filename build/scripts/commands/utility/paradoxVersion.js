import versionFile from "../../version.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
function versionHelp(player, prefix) {
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: version`,
        `§4[§6Usage§4]§f: version [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Will print out the installed version of paradox`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}version`,
        `        §4- §6Print out the installed version of paradox§f`,
        `    ${prefix}version help`,
        `        §4- §6Show command help§f`,
    ]);
}
/**
 * @name paradoxVersion
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function paradoxVersion(message, args) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./utility/paradoxVersion.js:26)");
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
    if (argCheck && args[0].toLowerCase() === "help") {
        return versionHelp(player, prefix);
    }
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f Version §2${versionFile.version}`);
}

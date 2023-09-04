import { world } from "@minecraft/server";
import config from "../../data/config.js";
import { decryptString, encryptString, getPrefix, sendMsgToPlayer } from "../../util.js";
function delhomeHelp(player, prefix) {
    let commandStatus;
    if (!config.customcommands.delhome) {
        commandStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: delhome`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: delhome [optional]`,
        `§4[§6Optional§4]§f: name, help`,
        `§4[§6Description§4]§f: Will delete specified saved home location.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}delhome cave`,
        `        §4- §6Delete the saved home location named "cave"§f`,
        `    ${prefix}delhome help`,
        `        §4- §6Show command help§f`,
    ]);
}
/**
 * @name delhome
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function delhome(message, args) {
    // Validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/utility/delhome.js:26)");
    }
    const player = message.sender;
    // Check for custom prefix
    const prefix = getPrefix(player);
    // Cache
    const length = args.length;
    // Are there arguements
    if (!length) {
        return delhomeHelp(player, prefix);
    }
    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.delhome) {
        return delhomeHelp(player, prefix);
    }
    // Don't allow spaces
    if (length > 1) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 名前の間に空白を入れないで下さい`);
    }
    // Hash the coordinates for security
    const salt = world.getDynamicProperty("crypt");
    // Find and delete this saved home location
    let verify = false;
    let encryptedString = "";
    const tags = player.getTags();
    const tagsLength = tags.length;
    for (let i = 0; i < tagsLength; i++) {
        if (tags[i].startsWith("1337")) {
            encryptedString = tags[i];
            // Decode it so we can verify it
            tags[i] = decryptString(tags[i], salt);
        }
        if (tags[i].startsWith(args[0].toString() + " X", 13)) {
            verify = true;
            player.removeTag(encryptedString);
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f  '${args[0]}'を消去しました！`);
            break;
        }
    }
    if (verify === true) {
        return;
    }
    else {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f'${args[0]}'は存在しません！！`);
    }
}

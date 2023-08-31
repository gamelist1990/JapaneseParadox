import { world } from "@minecraft/server";
import config from "../../data/config.js";
import { decryptString, getPrefix, encryptString, sendMsgToPlayer } from "../../util.js";
function setHomeHelp(player, prefix) {
    let commandStatus;
    if (!config.customcommands.sethome) {
        commandStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: sethome`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: sethome [optional]`,
        `§4[§6Optional§4]§f: name, help`,
        `§4[§6Description§4]§f: Saves home location based on current coordinates. Up to ${config.modules.setHome.max} total.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}sethome barn`,
        `        §4- §6Save a home location with the name "barn"§f`,
        `    ${prefix}sethome help`,
        `        §4- §6Show command help§f`,
    ]);
}
/**
 * @name sethome
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function sethome(message, args) {
    // Validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/utility/sethome.js:26)");
    }
    const player = message.sender;
    // Check for custom prefix
    const prefix = getPrefix(player);
    // Are there arguements
    if (!args.length) {
        return setHomeHelp(player, prefix);
    }
    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.sethome) {
        return setHomeHelp(player, prefix);
    }
    // Get current location
    const { x, y, z } = player.location;
    const homex = x.toFixed(0);
    const homey = y.toFixed(0);
    const homez = z.toFixed(0);
    let currentDimension;
    // Don't allow spaces
    if (args.length > 1 || args[0].trim().length === 0) {
        setHomeHelp(player, prefix);
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 名前の間に空白を入れないで下さい`);
    }
    // Hash the coordinates for security
    const salt = world.getDynamicProperty("crypt");
    // Make sure this name doesn't exist already and it doesn't exceed limitations
    let verify = false;
    let counter = 0;
    const tags = player.getTags();
    const tagsLength = tags.length;
    for (let i = 0; i < tagsLength; i++) {
        // 6f78 is temporary and will be removed
        if (tags[i].startsWith("6f78")) {
            // Remove old encryption
            player.removeTag(tags[i]);
            // Change to AES Encryption so we can abandon the old method
            tags[i] = decryptString(tags[i], salt);
            tags[i] = encryptString(tags[i], salt);
            player.addTag(tags[i]);
        }
        if (tags[i].startsWith("1337")) {
            // Decode it so we can verify if it already exists
            tags[i] = decryptString(tags[i], String(salt));
        }
        if (tags[i].startsWith(args[0].toString() + " X", 13)) {
            verify = true;
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f  '${args[0]}' 同じ名前が既に存在します`);
            break;
        }
        if (tags[i].startsWith("LocationHome:")) {
            counter = ++counter;
        }
        if (counter >= config.modules.setHome.max && config.modules.setHome.enabled) {
            verify = true;
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f  ${config.modules.setHome.max} 保存数が上限に達しました`);
            break;
        }
    }
    if (verify === true) {
        return;
    }
    // Save which dimension they were in
    if (player.dimension.id === "minecraft:overworld") {
        currentDimension = "overworld";
    }
    if (player.dimension.id === "minecraft:nether") {
        currentDimension = "nether";
    }
    if (player.dimension.id === "minecraft:the_end") {
        currentDimension - "the_end";
    }
    const decryptedLocationString = `座標:${args[0]} X:${homex} Y:${homey} Z:${homez} ディメンション:${currentDimension}`;
    const security = encryptString(decryptedLocationString, String(salt));
    // Store their new home coordinates
    player.addTag(security);
    sendMsgToPlayer(player, `§r§4[§6Paradox§4]§r'${args[0]}'を座標§2X=${homex} §4Y=${homey} §eZ=${homez}§rに設定しました`);
}
import { world } from "@minecraft/server";
import config from "../../data/config.js";
import { decryptString, getPrefix, encryptString, sendMsgToPlayer } from "../../util.js";
function listHomeHelp(player, prefix) {
    let commandStatus;
    if (!config.customcommands.listhome) {
        commandStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: listhome`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: listhome [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Shows a list of saved home locations.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}listhome`,
        `        §4- §6Show a list of saved home locations§f`,
        `    ${prefix}listhome help`,
        `        §4- §6Show command help§f`,
    ]);
}
/**
 * @name listhome
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function listhome(message, args) {
    // Validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/utility/listhome.js:26)");
    }
    const player = message.sender;
    // Check for custom prefix
    const prefix = getPrefix(player);
    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.listhome) {
        return listHomeHelp(player, prefix);
    }
    // Hash the coordinates for security
    const salt = world.getDynamicProperty("crypt");
    // Create an array to store the home location messages
    const homeMessages = [];
    const tags = player.getTags();
    const tagsLength = tags.length;
    let counter = 0;
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
            // Decode it so we can verify it
            tags[i] = decryptString(tags[i], salt);
            // If invalid then skip it
            if (tags[i].startsWith("LocationHome:") === false) {
                continue;
            }
            // Split string into array
            const coordinatesArray = tags[i].split(" ");
            const coordArrayLength = coordinatesArray.length;
            let home;
            let homex;
            let homey;
            let homez;
            let dimension;
            counter = ++counter;
            for (let j = 0; j < coordArrayLength; j++) {
                // Get their location from the array
                if (coordinatesArray[j].includes("LocationHome:")) {
                    home = coordinatesArray[j].replace("LocationHome:", "");
                }
                if (coordinatesArray[j].includes("X:")) {
                    homex = parseInt(coordinatesArray[j].replace("X:", ""));
                }
                if (coordinatesArray[j].includes("Y:")) {
                    homey = parseInt(coordinatesArray[j].replace("Y:", ""));
                }
                if (coordinatesArray[j].includes("Z:")) {
                    homez = parseInt(coordinatesArray[j].replace("Z:", ""));
                }
                if (coordinatesArray[j].includes("Dimension:")) {
                    dimension = coordinatesArray[j].replace("Dimension:", "");
                }
                // Inside the loop where you are processing each home location
                if (!homex || !homey || !homez || !dimension) {
                    continue;
                }
                else {
                    if (counter === 1) {
                        homeMessages.push(`§f§4[§6Paradox§4]§f現在保存されている座標`);
                    }
                    homeMessages.push(` §o§6|§f §4[§f${home}§4]§f §6=>§f ${homex} ${homey} ${homez} §6<=§f §4[§f${dimension}§4]§f`);
                }
            }
        }
        continue;
    }
    if (homeMessages.length > 0) {
        // Send all the home location messages at once using sendMsgToPlayer
        sendMsgToPlayer(player, homeMessages);
    }
    else {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 座標が保存されていません`);
    }
    return;
}

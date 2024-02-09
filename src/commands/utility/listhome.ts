import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import ConfigInterface from "../../interfaces/Config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";

function listHomeHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: listhome`,
        `§4[§6ステータス§4]§f: ${commandStatus}`,
        `§4[§6使用法§4]§f: listhome [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6説明§4]§f: Shows a list of saved home locations.`,
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
export function listhome(message: ChatSendAfterEvent, args: string[]) {
    // Validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "エラー: ${message} が定義されていません。渡すのを忘れましたか? ./commands/utility/listhome.js:26)");
    }

    const player = message.sender;

    // Check for custom prefix
    const prefix = getPrefix(player);

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.listhome) {
        return listHomeHelp(player, prefix, configuration.customcommands.listhome);
    }

    // Hash the coordinates for security
    const salt = world.getDynamicProperty("crypt");

    // Create an array to store the home location messages
    const homeMessages: string[] = [];

    const tags = player.getTags();
    const tagsLength = tags.length;
    let counter = 0;
    for (let i = 0; i < tagsLength; i++) {
        if (tags[i].startsWith("1337")) {
            // Decode it so we can verify it
            tags[i] = (world as WorldExtended).decryptString(tags[i], salt as string);
            // If invalid then skip it
            if (tags[i].startsWith("LocationHome:") === false) {
                continue;
            }
            // Split string into array
            const coordinatesArray = tags[i].split(" ");
            const coordArrayLength = coordinatesArray.length;
            let home: string;
            let homex: number;
            let homey: number;
            let homez: number;
            let dimension: string;
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
                } else {
                    if (counter === 1) {
                        homeMessages.push(`§f§4[§6Paradox§4]§f List Of Homes:`);
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
    } else {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You have none saved locations.`);
    }
    return;
}

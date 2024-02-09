import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ScoreManager } from "../../classes/ScoreManager.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the EnchantedArmor command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {number} encharmorscore - The Enchanted Armor score for the player.
 * @param {boolean} setting - The status of the Enchanted Armor custom command setting.
 */
function enchantedArmorHelp(player: Player, prefix: string, encharmorscore: number, setting: boolean): void {
    // Determine the status of the command and module
    const commandStatus: string = setting ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";
    const moduleStatus: string = encharmorscore > 0 ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";

    // Display help information to the player
    sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: enchantedarmor`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}enchantedarmor [options]`,
        `§4[§6Description§4]§f: Toggles Anti Enchanted Armor for all players.`,
        `§4[§6Options§4]§f:`,
        `    -h, --help`,
        `       §4[§7Display this help message§4]§f`,
        `    -s, --status`,
        `       §4[§7Display the current status of Enchanted Armor module§4]§f`,
        `    -e, --enable`,
        `       §4[§7Enable Enchanted Armor module§4]§f`,
        `    -d, --disable`,
        `       §4[§7Disable Enchanted Armor module§4]§f`,
    ]);
}

/**
 * Handles the EnchantedArmor command.
 * @name enchantedarmor
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function enchantedarmor(message: ChatSendAfterEvent, args: string[]) {
    handleEnchantedArmor(message, args).catch((error) => {
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

/**
 * Handles the execution of the EnchantedArmor command.
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleEnchantedArmor(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/enchantedarmor.js:33)`);
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to use this command.`);
    }

    const encharmorscore = ScoreManager.getScore("encharmor", player);

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Check for additional non-positional arguments
    const length = args.length;
    let validFlagFound = false; // Flag to track if any valid flag is encountered
    for (let i = 0; i < length; i++) {
        const additionalArg: string = args[i].toLowerCase();

        // Handle additional arguments
        switch (additionalArg) {
            case "-h":
            case "--help":
                validFlagFound = true;
                return enchantedArmorHelp(player, prefix, encharmorscore, configuration.customcommands.enchantedarmor);
            case "-s":
            case "--status":
                // Handle status flag
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Enchanted Armor module is currently ${encharmorscore > 0 ? "enabled" : "disabled"}`);
                break;
            case "-e":
            case "--enable":
                // Handle enable flag
                validFlagFound = true;
                if (encharmorscore > 0) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Enchanted Armor module is already enabled.`);
                } else {
                    player.runCommand(`scoreboard players set paradox:config encharmor 1`);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6Anti Enchanted Armor§f!`);
                }
                break;
            case "-d":
            case "--disable":
                // Handle disable flag
                validFlagFound = true;
                if (encharmorscore <= 0) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Enchanted Armor module is already disabled.`);
                } else {
                    player.runCommand(`scoreboard players set paradox:config encharmor 0`);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4Anti Enchanted Armor§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        // No additional arguments provided, display help
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}enchantedarmor --help for more information.`);
        return;
    }

    return player.runCommand(`scoreboard players operation @a encharmor = paradox:config encharmor`);
}

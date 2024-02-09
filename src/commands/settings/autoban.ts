import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { AutoBan } from "../../penrose/TickEvent/ban/autoban.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the Autoban command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} autoBanBoolean - The status of AutoBan module.
 * @param {boolean} setting - The status of the AutoBan custom command setting.
 */
function autobanHelp(player: Player, prefix: string, autoBanBoolean: boolean, setting: boolean): void {
    // Determine the status of the command and module
    const commandStatus: string = setting ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";
    const moduleStatus: string = autoBanBoolean ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";

    // Display help information to the player
    sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: autoban`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}autoban [options]`,
        `§4[§6Description§4]§f: Toggles the AutoBan module, which automatically bans players based on their violations if above 50.`,
        `§4[§6Options§4]§f:`,
        `    -h, --help`,
        `       §4[§7Display this help message§4]§f`,
        `    -s, --status`,
        `       §4[§7Display the current status of AutoBan module§4]§f`,
        `    -e, --enable`,
        `       §4[§7Enable AutoBan module§4]§f`,
        `    -d, --disable`,
        `       §4[§7Disable AutoBan module§4]§f`,
    ]);
}

/**
 * Handles the Autoban command.
 * @name autoban
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function autoban(message: ChatSendAfterEvent, args: string[]) {
    handleAutoban(message, args).catch((error) => {
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
 * Handles the execution of the Autoban command.
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleAutoban(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/autoban.js:36)`);
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to use this command.`);
    }

    // Get Dynamic Property Boolean
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
                return autobanHelp(player, prefix, configuration.modules.autoBan.enabled, configuration.customcommands.autoban);
            case "-s":
            case "--status":
                // Handle status flag
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AutoBan module is currently ${configuration.modules.autoBan.enabled ? "enabled" : "disabled"}`);
                break;
            case "-e":
            case "--enable":
                // Handle enable flag
                validFlagFound = true;
                if (configuration.modules.autoBan.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AutoBan module is already enabled.`);
                } else {
                    configuration.modules.autoBan.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6AutoBan§f!`);
                    AutoBan();
                }
                break;
            case "-d":
            case "--disable":
                // Handle disable flag
                validFlagFound = true;
                if (!configuration.modules.autoBan.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AutoBan module is already disabled.`);
                } else {
                    configuration.modules.autoBan.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4AutoBan§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        // No additional arguments provided, display help
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}autoban --help for more information.`);
    }
}

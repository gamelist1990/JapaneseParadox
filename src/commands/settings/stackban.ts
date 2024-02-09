import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Displays help information for the stackban command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} stackBanBoolean - The status of the stackBan module.
 * @param {boolean} setting - The status of the stackBan custom command setting.
 */
function stackBanHelp(player: Player, prefix: string, stackBanBoolean: boolean, setting: boolean): void {
    const commandStatus: string = setting ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";
    const moduleStatus: string = stackBanBoolean ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";

    sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: stackban`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}stackban [options]`,
        `§4[§6Description§4]§f: Toggles checks for players with illegal stacks over 64.`,
        `§4[§6Options§4]§f:`,
        `    -d, --disable`,
        `       §4[§7Disable stackBan module§4]§f`,
        `    -s, --status`,
        `       §4[§7Display the current status of stackBan module§4]§f`,
        `    -e, --enable`,
        `       §4[§7Enable stackBan module§4]§f`,
        `    -h, --help`,
        `       §4[§7Display this help message§4]§f`,
    ]);
}

/**
 * @name stackBan
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function stackBan(message: ChatSendAfterEvent, args: string[]): void {
    handleStackBan(message, args).catch((error) => {
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
 * Handles the stackban command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleStackBan(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // Validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | Error: ${message} isn't defined. Did you forget to pass it? (./commands/settings/stackban.js:35)`);
    }

    const player: Player = message.sender;
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to use this command.`);
        return;
    }

    // Get Dynamic Property Boolean
    const configuration: ConfigInterface = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Check for custom prefix
    const prefix: string = getPrefix(player);

    // Was help requested
    if ((args[0] && args[0].toLowerCase() === "help") || !configuration.customcommands.stackban) {
        return stackBanHelp(player, prefix, configuration.modules.stackBan.enabled, configuration.customcommands.stackban);
    }

    // Check for additional non-positional arguments
    const length = args.length;
    let validFlagFound = false; // Flag to track if any valid flag is encountered
    for (let i = 0; i < length; i++) {
        const additionalArg: string = args[i].toLowerCase();

        // Handle additional arguments
        switch (additionalArg) {
            case "-h":
            case "--help":
                // Display help information
                validFlagFound = true;
                return stackBanHelp(player, prefix, configuration.modules.stackBan.enabled, configuration.customcommands.stackban);

            case "-d":
            case "--disable":
                // Disable stackBan module if it's not already disabled
                validFlagFound = true;
                if (configuration.modules.stackBan.enabled === false) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f §4StackBans§f is already disabled.`);
                } else {
                    configuration.modules.stackBan.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4StackBans§f!`);
                }
                break;

            case "-e":
            case "--enable":
                // Enable stackBan module if it's not already enabled
                validFlagFound = true;
                if (configuration.modules.stackBan.enabled === true) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f §6StackBans§f is already enabled.`);
                } else {
                    configuration.modules.stackBan.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6StackBans§f!`);
                }
                break;

            case "-s":
            case "--status":
                // Display current status of StackBan module
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f StackBan module is currently ${configuration.modules.stackBan.enabled ? "§aENABLED" : "§4DISABLED"}§f.`);
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Please use ${prefix}stackban --help for usage information.`);
    }
}

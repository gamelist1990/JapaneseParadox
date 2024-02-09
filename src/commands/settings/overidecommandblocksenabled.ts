import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ScoreManager } from "../../classes/ScoreManager.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the overridecbe command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {number} cmdsscore - The current score for the 'cmds' objective.
 * @param {boolean} setting - The status of the overridecbe custom command setting.
 */
function overrideCBEHelp(player: Player, prefix: string, cmdsscore: number, setting: boolean): void {
    // Determine the status of the command and module
    const commandStatus: string = setting ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";
    const moduleStatus: string = cmdsscore <= 0 ? "§6[§4DISABLED§6]§f" : "§6[§aENABLED§6]§f";

    // Display help information to the player
    sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: overridecbe`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}overridecbe [options]`,
        `§4[§6Description§4]§f: Forces the commandblocksenabled gamerule to be enabled or disabled at all times.`,
        `§4[§6Options§4]§f:`,
        `    -h, --help`,
        `       §4[§7Display this help message§4]§f`,
        `    -s, --status`,
        `       §4[§7Display the current status of CommandBlocksEnabled module§4]§f`,
        `    -e, --enable`,
        `       §4[§7Enable CommandBlocksEnabled module§4]§f`,
        `    -d, --disable`,
        `       §4[§7Disable CommandBlocksEnabled module§4]§f`,
    ]);
}

/**
 * @name overridecbe
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function overridecbe(message: ChatSendAfterEvent, args: string[]) {
    handleOverrideCBE(message, args).catch((error) => {
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
 * Handles the overridecbe command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleOverrideCBE(message: ChatSendAfterEvent, args: string[]) {
    // Validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/overridecbe.js:7)`);
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to use this command.`);
    }

    const cmdsscore = ScoreManager.getScore("cmds", player);

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
                // Display help message
                validFlagFound = true;
                overrideCBEHelp(player, prefix, cmdsscore, configuration.customcommands.overidecommandblocksenabled);
                break;
            case "-s":
            case "--status":
                // Display current status of CommandBlocksEnabled module
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f CommandBlocksEnabled module is currently ${cmdsscore <= 0 ? "§4DISABLED" : "§aENABLED"}§f.`);
                break;
            case "-e":
            case "--enable":
                // Enable CommandBlocksEnabled module
                validFlagFound = true;
                if (cmdsscore <= 0) {
                    player.runCommand(`scoreboard players set paradox:config cmds 1`);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has set CommandBlocksEnabled as §aenabled§f!`);
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f CommandBlocksEnabled module is already enabled`);
                }
                break;
            case "-d":
            case "--disable":
                // Disable CommandBlocksEnabled module
                validFlagFound = true;
                if (cmdsscore <= 0) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f CommandBlocksEnabled module is already disabled`);
                } else {
                    player.runCommand(`scoreboard players set paradox:config cmds 0`);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has set CommandBlocksEnabled as §4disabled§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}overridecbe --help for command usage.`);
    }
}

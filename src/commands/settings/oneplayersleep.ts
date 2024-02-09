import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the ops command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} opsBoolean - The status of the OPS module.
 * @param {boolean} setting - The status of the ops custom command setting.
 */
function opsHelp(player: Player, prefix: string, opsBoolean: boolean, setting: boolean): void {
    // Determine the status of the command and module
    const commandStatus: string = setting ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";
    const moduleStatus: string = opsBoolean ? "§6[§4DISABLED§6]§f" : "§6[§aENABLED§6]§f";

    // Display help information to the player
    sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: ops`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}ops [options]`,
        `§4[§6Description§4]§f: Toggles One Player Sleep (OPS) for all online players.`,
        `§4[§6Options§4]§f:`,
        `    -h, --help`,
        `       §4[§7Display this help message§4]§f`,
        `    -s, --status`,
        `       §4[§7Display the current status of OPS module§4]§f`,
        `    -e, --enable`,
        `       §4[§7Enable OPS module§4]§f`,
        `    -d, --disable`,
        `       §4[§7Disable OPS module§4]§f`,
    ]);
}

/**
 * @name ops
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function ops(message: ChatSendAfterEvent, args: string[]) {
    handleOps(message, args).catch((error) => {
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
 * Handles the ops command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleOps(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/oneplayersleep.js:36)`);
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
                // Display help message
                validFlagFound = true;
                opsHelp(player, prefix, configuration.modules.ops.enabled, configuration.customcommands.ops);
                break;
            case "-s":
            case "--status":
                // Display current status of OPS module
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f OPS module is currently ${configuration.modules.ops.enabled ? "§aENABLED" : "§4DISABLED"}§f.`);
                break;
            case "-e":
            case "--enable":
                // Enable OPS module
                validFlagFound = true;
                if (configuration.modules.ops.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f OPS module is already enabled`);
                } else {
                    configuration.modules.ops.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6OPS§f!`);
                    //Use the native inbuilt gamerule
                    player.runCommandAsync(`/gamerule playersSleepingPercentage 1`);
                }
                break;
            case "-d":
            case "--disable":
                // Disable OPS module
                validFlagFound = true;
                if (!configuration.modules.ops.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f OPS module is already disabled`);
                } else {
                    configuration.modules.ops.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4OPS§f!`);
                    //Use the native inbuilt gamerule
                    player.runCommandAsync(`/gamerule playersSleepingPercentage 100`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}ops --help for command usage.`);
    }
}

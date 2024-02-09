import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { XrayA } from "../../penrose/PlayerBreakBlockAfterEvent/xray/xray_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the xrayA command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} xrayBoolean - The status of the xrayA module.
 * @param {boolean} setting - The status of the xrayA custom command setting.
 */
function xrayAHelp(player: Player, prefix: string, xrayBoolean: boolean, setting: boolean): void {
    // Determine the status of the command and module
    const commandStatus: string = setting ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";
    const moduleStatus: string = xrayBoolean ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";

    // Display help information to the player
    sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: xraya`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}xraya [options]`,
        `§4[§6Description§4]§f: Notifies staff when and where players mine specific ores.`,
        `§4[§6Options§4]§f:`,
        `    -h, --help`,
        `       §4[§7Display this help message§4]§f`,
        `    -s, --status`,
        `       §4[§7Display the current status of XrayA module§4]§f`,
        `    -e, --enable`,
        `       §4[§7Enable XrayA module§4]§f`,
        `    -d, --disable`,
        `       §4[§7Disable XrayA module§4]§f`,
    ]);
}

/**
 * @name xrayA
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function xrayA(message: ChatSendAfterEvent, args: string[]): void {
    handleXrayA(message, args).catch((error) => {
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
 * Handles the xrayA command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleXrayA(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // Validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/xrayA.js:36)`);
    }

    const player: Player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to use this command.`);
    }

    const configuration: ConfigInterface = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Check for custom prefix
    const prefix: string = getPrefix(player);

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
                xrayAHelp(player, prefix, configuration.modules.xrayA.enabled, configuration.customcommands.xraya);
                break;
            case "-s":
            case "--status":
                // Display current status of XrayA module
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f XrayA module is currently ${configuration.modules.xrayA.enabled ? "§aENABLED" : "§4DISABLED"}§f.`);
                break;
            case "-e":
            case "--enable":
                // Enable XrayA module
                validFlagFound = true;
                if (!configuration.modules.xrayA.enabled) {
                    configuration.modules.xrayA.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f has enabled §6XrayA§f!`);
                    XrayA();
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f XrayA module is already enabled`);
                }
                break;
            case "-d":
            case "--disable":
                // Disable XrayA module
                validFlagFound = true;
                if (configuration.modules.xrayA.enabled) {
                    configuration.modules.xrayA.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f has disabled §4XrayA§f!`);
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f XrayA module is already disabled`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        // Invalid command
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}xraya --help for command usage.`);
    }
}

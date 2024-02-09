import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { NamespoofB } from "../../penrose/TickEvent/namespoof/namespoof_b.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the namespoofB command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} nameSpoofBoolean - The status of the NamespoofB module.
 * @param {boolean} setting - The status of the namespoofb custom command setting.
 */
function namespoofBHelp(player: Player, prefix: string, nameSpoofBoolean: boolean, setting: boolean): void {
    // Determine the status of the command and module
    const commandStatus: string = setting ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";
    const moduleStatus: string = nameSpoofBoolean ? "§6[§4DISABLED§6]§f" : "§6[§aENABLED§6]§f";

    // Display help information to the player
    sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: namespoofb`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}namespoofb [options]`,
        `§4[§6Description§4]§f: Toggles checks for a player's name that has Non-ASCII characters.`,
        `§4[§6Options§4]§f:`,
        `    -h, --help`,
        `       §4[§7Display this help message§4]§f`,
        `    -s, --status`,
        `       §4[§7Display the current status of NamespoofB module§4]§f`,
        `    -e, --enable`,
        `       §4[§7Enable NamespoofB module§4]§f`,
        `    -d, --disable`,
        `       §4[§7Disable NamespoofB module§4]§f`,
    ]);
}

/**
 * @name namespoofB
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function namespoofB(message: ChatSendAfterEvent, args: string[]) {
    handleNamespoofB(message, args).catch((error) => {
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
 * Handles the namespoofB command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleNamespoofB(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/namespoofb.js:36)`);
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
                namespoofBHelp(player, prefix, configuration.modules.namespoofB.enabled, configuration.customcommands.namespoofb);
                break;
            case "-s":
            case "--status":
                // Display current status of NamespoofB module
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f NamespoofB module is currently ${configuration.modules.namespoofB.enabled ? "§aENABLED" : "§4DISABLED"}§f.`);
                break;
            case "-e":
            case "--enable":
                // Enable NamespoofB module
                validFlagFound = true;
                if (configuration.modules.namespoofB.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f NamespoofB module is already enabled`);
                } else {
                    configuration.modules.namespoofB.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6NamespoofB§f!`);
                    NamespoofB();
                }
                break;
            case "-d":
            case "--disable":
                // Disable NamespoofB module
                validFlagFound = true;
                if (!configuration.modules.namespoofB.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f NamespoofB module is already disabled`);
                } else {
                    configuration.modules.namespoofB.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4NamespoofB§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}namespoofb --help for command usage.`);
    }
}

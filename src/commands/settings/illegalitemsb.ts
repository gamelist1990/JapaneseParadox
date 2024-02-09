import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { IllegalItemsB } from "../../penrose/PlayerPlaceBlockAfterEvent/illegalitems/illegalitems_b.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the illegalitemsB command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} illegalItemsBBoolean - The status of the illegalItemsB module.
 * @param {boolean} setting - The status of the illegalItemsB custom command setting.
 */
function illegalItemsBHelp(player: Player, prefix: string, illegalItemsBBoolean: boolean, setting: boolean): void {
    // Determine the status of the command and module
    const commandStatus: string = setting ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";
    const moduleStatus: string = illegalItemsBBoolean ? "§6[§4DISABLED§6]§f" : "§6[§aENABLED§6]§f";

    // Display help information to the player
    sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: illegalitemsb`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}illegalitemsb [options]`,
        `§4[§6Description§4]§f: Toggles checks for players who place illegal items.`,
        `§4[§6Options§4]§f:`,
        `    -h, --help`,
        `       §4[§7Display this help message§4]§f`,
        `    -s, --status`,
        `       §4[§7Display the current status of IllegalItemsB module§4]§f`,
        `    -e, --enable`,
        `       §4[§7Enable IllegalItemsB module§4]§f`,
        `    -d, --disable`,
        `       §4[§7Disable IllegalItemsB module§4]§f`,
    ]);
}

/**
 * Handles the illegalitemsB command.
 * @name illegalitemsB
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function illegalitemsB(message: ChatSendAfterEvent, args: string[]) {
    handleIllegalItemsB(message, args).catch((error) => {
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
 * Handles the execution of the illegalitemsB command.
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleIllegalItemsB(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/illegalitemsb.js:36)`);
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
                return illegalItemsBHelp(player, prefix, configuration.modules.illegalitemsB.enabled, configuration.customcommands.illegalitemsb);
            case "-s":
            case "--status":
                // Handle status flag
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f IllegalItemsB module is currently ${configuration.modules.illegalitemsB.enabled ? "enabled" : "disabled"}`);
                break;
            case "-e":
            case "--enable":
                // Handle enable flag
                validFlagFound = true;
                if (configuration.modules.illegalitemsB.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f IllegalItemsB module is already enabled.`);
                } else {
                    configuration.modules.illegalitemsB.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6IllegalItemsB§f!`);
                    IllegalItemsB();
                }
                break;
            case "-d":
            case "--disable":
                // Handle disable flag
                validFlagFound = true;
                if (!configuration.modules.illegalitemsB.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f IllegalItemsB module is already disabled.`);
                } else {
                    configuration.modules.illegalitemsB.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4IllegalItemsB§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}illegalitemsb --help for more information.`);
    }
}

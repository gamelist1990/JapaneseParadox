import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { KillAura } from "../../penrose/EntityHitEntityAfterEvent/killaura.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the AuraCheck command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} antiKillAuraBoolean - The status of AntiKillAura module.
 * @param {boolean} setting - The status of the AntiKillAura custom command setting.
 */
function auraCheckHelp(player: Player, prefix: string, antiKillAuraBoolean: boolean, setting: boolean): void {
    // Determine the status of the command and module
    const commandStatus: string = setting ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";
    const moduleStatus: string = antiKillAuraBoolean ? "§6[§4DISABLED§6]§f" : "§6[§aENABLED§6]§f";

    // Display help information to the player
    sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: auracheck`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}auracheck [options]`,
        `§4[§6Description§4]§f: Toggles checks for attacks outside a 90-degree angle in AntiKillAura module.`,
        `§4[§6Options§4]§f:`,
        `    -h, --help`,
        `       §4[§7Display this help message§4]§f`,
        `    -s, --status`,
        `       §4[§7Display the current status of AntiKillAura module§4]§f`,
        `    -e, --enable`,
        `       §4[§7Enable AntiKillAura module§4]§f`,
        `    -d, --disable`,
        `       §4[§7Disable AntiKillAura module§4]§f`,
    ]);
}

/**
 * Handles the AuraCheck command.
 * @name auracheck
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function auracheck(message: ChatSendAfterEvent, args: string[]) {
    handleAuraCheck(message, args).catch((error) => {
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
 * Handles the execution of the AuraCheck command.
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleAuraCheck(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/utility/auracheck.js:29)`);
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
                return auraCheckHelp(player, prefix, configuration.modules.antiKillAura.enabled, configuration.customcommands.antikillaura);
            case "-s":
            case "--status":
                // Handle status flag
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AntiKillAura module is currently ${configuration.modules.antiKillAura.enabled ? "enabled" : "disabled"}`);
                break;
            case "-e":
            case "--enable":
                // Handle enable flag
                validFlagFound = true;
                if (configuration.modules.antiKillAura.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AntiKillAura module is already enabled.`);
                } else {
                    configuration.modules.antiKillAura.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6AntiKillAura§f!`);
                    KillAura();
                }
                break;
            case "-d":
            case "--disable":
                // Handle disable flag
                validFlagFound = true;
                if (!configuration.modules.antiKillAura.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AntiKillAura module is already disabled.`);
                } else {
                    configuration.modules.antiKillAura.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4AntiKillAura§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        // No additional arguments provided, display help
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}antikillaura --help for more information.`);
    }
}

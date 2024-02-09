import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { BadPackets1 } from "../../penrose/ChatSendBeforeEvent/spammer/badpackets_1.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the BadPackets1 command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} badPackets1Boolean - The status of BadPackets1 module.
 * @param {boolean} setting - The status of the BadPackets1 custom command setting.
 */
function badpackets1Help(player: Player, prefix: string, badPackets1Boolean: boolean, setting: boolean): void {
    const commandStatus: string = setting ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";
    const moduleStatus: string = badPackets1Boolean ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";

    sendMsgToPlayer(player, [
        `§o§4[§6Command§4]§f: badpackets1`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}badpackets1 [options]`,
        `§4[§6Description§4]§f: Toggles checks for message lengths with each broadcast.`,
        `§4[§6Options§4]§f:`,
        `    -h, --help`,
        `       §4[§7Display this help message§4]§f`,
        `    -s, --status`,
        `       §4[§7Display the current status of Badpackets1§4]§f`,
        `    -e, --enable`,
        `       §4[§7Enable Badpackets1§4]§f`,
        `    -d, --disable`,
        `       §4[§7Disable Badpackets1§4]§f`,
    ]);
}

/**
 * @name badpackets1
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function badpackets1(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/badpackets1.js:36)");
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
                return badpackets1Help(player, prefix, configuration.modules.badpackets1.enabled, configuration.customcommands.badpackets1);
            case "-s":
            case "--status":
                // Handle status flag
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Badpackets1 is currently ${configuration.modules.badpackets1.enabled ? "enabled" : "disabled"}`);
                break;
            case "-e":
            case "--enable":
                // Handle enable flag
                validFlagFound = true;
                if (configuration.modules.badpackets1.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Badpackets1 is already enabled.`);
                } else {
                    configuration.modules.badpackets1.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6Badpackets1§f!`);
                    BadPackets1();
                }
                break;
            case "-d":
            case "--disable":
                // Handle disable flag
                validFlagFound = true;
                if (!configuration.modules.badpackets1.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Badpackets1 is already disabled.`);
                } else {
                    configuration.modules.badpackets1.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4Badpackets1§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}badpackets1 --help for more information.`);
    }
}

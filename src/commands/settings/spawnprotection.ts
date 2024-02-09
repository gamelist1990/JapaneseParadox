import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { SpawnProtection } from "../../penrose/TickEvent/spawnprotection/spawnProtection.js";
import ConfigInterface from "../../interfaces/Config.js";

function spawnprotectionHelp(player: Player, prefix: string, spawnProtectionBoolean: boolean, setting: boolean) {
    // Determine the status of the command and module
    const commandStatus: string = setting ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";
    const moduleStatus: string = spawnProtectionBoolean ? "§6[§aENABLED§6]§f" : "§6[§4DISABLED§6]§f";

    // Display help information to the player
    sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: spawnprotection`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}spawnprotection [options]`,
        `§4[§6Description§4]§f: Toggles area protection to limit building/mining.`,
        `§4[§6Options§4]§f:`,
        `    -e, --enable`,
        `       §4[§7Enable spawn protection§4]§f`,
        `    -d, --disable`,
        `       §4[§7Disable spawn protection§4]§f`,
        `    -h, --help`,
        `       §4[§7Display this help message§4]§f`,
        `    -s, --status`,
        `       §4[§7Display the current status of stackBan module§4]§f`,
        `    -c <x> <y> <z>, --center <x> <y> <z>`,
        `       §4[§7Set spawn protection with center coordinates§4]§f`,
        `    -r <r>, --radius <r>`,
        `       §4[§7Set spawn protection radius based on center§4]§f`,
    ]);
}

/**
 * @name spawnprotection
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function spawnprotection(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/spawnprotection.js:36)");
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
    let updates = false; // Flag to track if vec3 or rad is modified
    for (let i = 0; i < length; i++) {
        const additionalArg: string = args[i].toLowerCase();

        // Handle additional arguments
        switch (additionalArg) {
            case "-h":
            case "--help":
                // Display help message
                validFlagFound = true;
                return spawnprotectionHelp(player, prefix, configuration.modules.spawnprotection.enabled, configuration.customcommands.spawnprotection);
            case "-s":
            case "--status":
                // Display current status of SpawnProtection module
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Spawn Protection module is currently ${configuration.modules.spawnprotection.enabled ? "§aENABLED" : "§4DISABLED"}§f.`);
                break;
            case "-e":
            case "--enable":
                // Enable SpawnProtection module
                validFlagFound = true;
                updates = true;
                if (!configuration.modules.spawnprotection.enabled) {
                    const vec3 = configuration.modules.spawnprotection.vector3;
                    const allZero = vec3.x === 0 && vec3.y === 0 && vec3.z === 0;
                    const rad = configuration.modules.spawnprotection.radius;
                    if (allZero && rad === 0) {
                        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Please set Center and Radius for Spawn Protection first!`);
                    }
                    configuration.modules.spawnprotection.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    SpawnProtection();
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Spawn Protection module is already enabled`);
                }
                break;
            case "-d":
            case "--disable":
                // Disable SpawnProtection module
                validFlagFound = true;
                if (configuration.modules.spawnprotection.enabled) {
                    configuration.modules.spawnprotection.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4Spawn Protection§f!`);
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Spawn Protection module is already disabled`);
                }
                break;
            case "-c":
            case "--center": {
                // Set Center for Spawn Protection
                validFlagFound = true;
                updates = true;
                const shiftArray = args.slice(i + 1);
                if (shiftArray && shiftArray.length < 3) {
                    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid arguments provided. Please include x y z, for example: 10 64 -10.`);
                }

                let [x, y, z] = shiftArray.slice(0, 3).map((arg) => (arg === "~" ? arg : parseFloat(arg)));

                if ((x !== "~" && isNaN(x as number)) || (y !== "~" && isNaN(y as number)) || (z !== "~" && isNaN(z as number))) {
                    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid arguments provided. Please make sure x, y, and z are valid numbers.`);
                }

                if (x === "~") {
                    x = Math.ceil(player.location.x);
                }
                if (y === "~") {
                    y = Math.ceil(player.location.y);
                }
                if (z === "~") {
                    z = Math.ceil(player.location.z);
                }

                const vector3 = { x: x, y: y, z: z };
                configuration.modules.spawnprotection.vector3 = vector3;
                dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                break;
            }
            case "-r":
            case "--radius": {
                // Set Center for Spawn Protection
                validFlagFound = true;
                updates = true;
                const shiftArray = args.slice(i + 1);
                if (shiftArray && shiftArray.length < 1) {
                    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid arguments provided. Please include radius, for example: 90.`);
                }
                const radius = parseFloat(shiftArray[0]);

                configuration.modules.spawnprotection.radius = Math.abs(radius as number);
                dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                break;
            }
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}spawnprotection --help for command usage.`);
    }

    if (updates) {
        const messageAction = configuration.modules.spawnprotection.enabled ? "has updated" : "has enabled";
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f ${messageAction} §6Spawn Protection§f!`);
    }
}

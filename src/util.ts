import { Player, PlayerLeaveAfterEvent, Vector, world } from "@minecraft/server";
import { kickablePlayers } from "./kickcheck.js";
import { ScoreManager } from "./classes/ScoreManager.js";
import { dynamicPropertyRegistry } from "./penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "./interfaces/Config.js";

const overworld = world.getDimension("overworld");
const timerMap = new Map<string, number>();

function getRegistry() {
    return dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
}

function onPlayerLogout(event: PlayerLeaveAfterEvent): void {
    // Remove the player's data from the map when they log off
    const playerName = event.playerId;
    timerMap.delete(playerName);
}
world.afterEvents.playerLeave.subscribe(onPlayerLogout);

/**
 * Flag players who trigger certain checks or sub-checks, with information about the type of hack, the item involved, and any debug information available.
 *
 * @name flag
 * @param {Player} player - The player object
 * @param {string} check - What check ran the function.
 * @param {string} checkType - What sub-check ran the function (ex. a, b ,c).
 * @param {string} hackType - What the hack is considered as (ex. movement, combat, exploit).
 * @param {string} item - Item object.
 * @param {number} stack - Item object stack.
 * @param {string} debugName - Name for the debug value.
 * @param {string} debug - Debug info.
 * @param {boolean} shouldTP - Whever to tp the player to itself.
 */
export function flag(player: Player, check: string, checkType: string, hackType: string, item: string, stack: number, debugName: string, debug: string, shouldTP: boolean) {
    if (shouldTP) {
        player.teleport(new Vector(player.location.x, player.location.y, player.location.z), {
            dimension: player.dimension,
            rotation: { x: 0, y: 0 },
            facingLocation: { x: 0, y: 0, z: 0 },
            checkForBlocks: true,
            keepVelocity: false,
        });
    }

    ScoreManager.setScore(player, `${check.toLowerCase()}vl`, 1, true);

    if (debug) {
        sendMsg("@a[tag=notify]", `§f§4[§6Paradox§4]§f${player.name} §6を検知しました §7(${hackType}) §4${check}/${checkType} §7(${debugName}=${debug})§4.VL= ${ScoreManager.getScore(check.toLowerCase() + "vl", player)}`);
    } else if (item && stack) {
        sendMsg("@a[tag=notify]", `§f§4[§6Paradox§4]§f${player.name} §6を検知しました §7(${hackType}) §4${check}/${checkType} §7(${item.replace("minecraft:", "")}=${stack})§4.VL= ${ScoreManager.getScore(check.toLowerCase() + "vl", player)}`);
    } else {
        sendMsg("@a[tag=notify]", `§f§4[§6Paradox§4]§f${player.name} §6を検知しました §7(${hackType}) §4${check}/${checkType}です。VL= ${ScoreManager.getScore(check.toLowerCase() + "vl", player)}`);
    }

    if (check === "Namespoof") {
        player.runCommandAsync(`kick "${player.name}" §f\n\n§4[§6Paradox§4]§f 名前に不正な文字が含まれています!`).catch(() => {
            // If we can't kick them with /kick, then we instantly despawn them
            kickablePlayers.add(player);
            player.triggerEvent("paradox:kick");
        });
    }
}

/**
 * This function sends a kick message to a banned player, including the banning moderator and reason. If ban appeals are enabled, a Discord link will also be included in the message. If the player cannot be kicked, they will be despawned instantly.
 *
 * @name banMessage
 * @param {Player} player - The player object
 */
export function banMessage(player: Player) {
    const configuration = getRegistry();
    const tags = player.getTags();

    let reason: string;
    let by: string;

    for (const tag of tags) {
        if (tag.startsWith("By:")) {
            by = tag.slice(3);
        } else if (tag.startsWith("Reason:")) {
            reason = tag.slice(7);
        }
    }

    if (configuration.modules.banAppeal.enabled === true) {
        const appealLink = `\n§4[§6discord§4]§f: §b${configuration.modules.banAppeal.discordLink}`;
        player.runCommandAsync(`kick "${player.name}" §f\n§l§4あなたは禁止されています!§r\n§4[§6禁止By§4]§f: §7${by || "§7N/A"}§f\n§4[§6理由§4]§f: §7${reason || "§7N/A"}§f${appealLink}`).catch(() => {
            // If we can't kick them with /kick, then we instantly despawn them
            kickablePlayers.add(player);
            player.triggerEvent("paradox:kick");
        });
    } else {
        player.runCommandAsync(`kick "${player.name}" §f\n§l§4あなたは禁止されています!\n§r\n§4[§6禁止By§4]§f: §7${by || "§7N/A"}§f\n§4[§6理由§4]§f: §7${reason || "§7N/A"}§f`).catch(() => {
            // If we can't kick them with /kick, then we instantly despawn them
            kickablePlayers.add(player);
            player.triggerEvent("paradox:kick");
        });
    }

    // Notify staff that a player was banned
    sendMsg("@a[tag=paradoxOpped]", [`§f§4[§6Paradox§4]§f §7${player.name}§f '§4[§6禁止§4]§f: §7${by || "§7N/A"}§f', '§4[§6理由§4]§f: §7${reason || "§7該当なし"}§f`]);
}

/**
 * Gets the prefix tag of a player, if it exists.
 *
 * @name getPrefix
 * @param {Player} player - The player object
 */
export function getPrefix(player: Player) {
    const configuration = getRegistry();
    const tags = player.getTags();
    let customprefix = null;

    for (const tag of tags) {
        if (tag.startsWith("Prefix:")) {
            customprefix = tag.replace("Prefix:", "");
            break;
        }
    }

    configuration.customcommands.prefix = customprefix || configuration.customcommands.prefix;
    return configuration.customcommands.prefix;
}

/**
 * Sets a timer for a given player.
 *
 * @param player - A string representing the player for whom the timer is being set.
 * @param spawn - An optional boolean parameter with a default value of `false`.
 * If `spawn` is set to `true`, the timer will be set for 10 seconds;
 * otherwise, it will be set for 2 seconds.
 */
export function setTimer(player: string, spawn: boolean = false) {
    let timer: number = 0;
    if (spawn === true) {
        // Set a timer for 10 seconds
        timer = Date.now() + 10000;
    } else {
        // Set a timer for 2 seconds
        timer = Date.now() + 2000;
    }

    // Store the timer in the map
    timerMap.set(player, timer);
}

/**
 * Checks if the timer for the specified player has expired.
 *
 * @param player - A string representing the player whose timer will be checked.
 * @returns A boolean value indicating whether the timer has expired (`true`) or not (`false`).
 */
export function isTimerExpired(player: string) {
    // Get the timer for the player
    const timer = timerMap.get(player);

    // If the timer doesn't exist, assume it's expired
    if (!timer) {
        return true;
    }

    // Check if the timer has expired
    if (Date.now() > timer) {
        timerMap.delete(player);
        return true;
    }

    return false;
}

/**
 * Sends a message to one or multiple targets in Minecraft.
 *
 * @param targets The target or array of targets to send the messages to.
 * @param message The message to send. This can be a string or an array of strings.
 */
export const sendMsg = async (targets: string | string[], message: string | string[]) => {
    const targetsArray = Array.isArray(targets) ? targets : [targets];
    const isArray = Array.isArray(message);
    const modifiedMessage = isArray ? (message as string[]).map((msg) => msg.replace(/§f/g, "§f§o")) : (message as string).replace(/§f/g, "§f§o");

    // Loop through each target and send the message
    for (const target of targetsArray) {
        overworld.runCommandAsync(`tellraw ${/^ *@[spear]( *\[.*\] *)?$|^ *("[^"]+"|\S+) *$/.test(target) ? target : JSON.stringify(target)} {"rawtext":[{"text":${JSON.stringify(modifiedMessage)}}]}`);
    }
};

/**
 * Sends a message to a player in Minecraft.
 *
 * @param target The player to send the message to.
 * @param message The message to send. This can be a string or an array of strings.
 */
export const sendMsgToPlayer = async (target: Player, message: string | string[]) => {
    const isArray = Array.isArray(message);

    let modifiedMessage: string | string[];

    if (isArray) {
        modifiedMessage = (message as string[]).map((msg) => msg.replace(/§f/g, "§f§o")).join("\n");
    } else {
        modifiedMessage = (message as string).replace(/§f/g, "§f§o");
    }

    target.sendMessage({ rawtext: [{ text: "\n" + modifiedMessage }] });
};

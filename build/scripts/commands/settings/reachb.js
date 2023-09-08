import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import config from "../../data/config.js";
import { world } from "@minecraft/server";
import { ReachB } from "../../penrose/EntityHitEntityAfterEvent/reach_b.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
function reachBHelp(player, prefix, reachBBoolean) {
    let commandStatus;
    if (!config.customcommands.reachb) {
        commandStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    let moduleStatus;
    if (reachBBoolean === false) {
        moduleStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        moduleStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: reachb`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: reachb [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Toggles checks for player's attacking beyond reach.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}reachb`,
        `    ${prefix}reachb help`,
    ]);
}
/**
 * @name reachB
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function reachB(message, args) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/reachb.js:36)");
    }
    const player = message.sender;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限がないと実行できません！！`);
    }
    // Get Dynamic Property Boolean
    const reachBBoolean = dynamicPropertyRegistry.get("reachb_b");
    // Check for custom prefix
    const prefix = getPrefix(player);
    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.reachb) {
        return reachBHelp(player, prefix, reachBBoolean);
    }
    if (reachBBoolean === false) {
        // Allow
        dynamicPropertyRegistry.set("reachb_b", true);
        world.setDynamicProperty("reachb_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6ReachB§f!`);
        ReachB();
    }
    else if (reachBBoolean === true) {
        // Deny
        dynamicPropertyRegistry.set("reachb_b", false);
        world.setDynamicProperty("reachb_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4ReachB§f!`);
    }
}

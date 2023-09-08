import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import config from "../../data/config.js";
import { world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { ShowRules } from "../../gui/showrules/showrules.js";
function showrulesHelp(player, prefix, showrulesBoolean) {
    let commandStatus;
    if (!config.customcommands.showrules) {
        commandStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    let moduleStatus;
    if (showrulesBoolean === false) {
        moduleStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        moduleStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: showrules`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: showrules [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Toggles showing the rules when the player loads in for the first time.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}showrules`,
        `    ${prefix}showrules help`,
    ]);
}
/**
 * @name showrules
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function showrules(message, args) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/showrules.js:36)");
    }
    const player = message.sender;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限がないと実行できません！！`);
    }
    // Get Dynamic Property Boolean
    const showrulesBoolean = dynamicPropertyRegistry.get("showrules_b");
    // Check for custom prefix
    const prefix = getPrefix(player);
    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.showrules) {
        return showrulesHelp(player, prefix, showrulesBoolean);
    }
    if (showrulesBoolean === false) {
        // Allow
        dynamicPropertyRegistry.set("showrules_b", true);
        world.setDynamicProperty("showrules_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6showrules§f!`);
        ShowRules();
    }
    else if (showrulesBoolean === true) {
        // Deny
        dynamicPropertyRegistry.set("showrules_b", false);
        world.setDynamicProperty("showrules_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4showrules§f!`);
    }
}

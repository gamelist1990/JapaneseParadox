import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import config from "../../data/config.js";
import { world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
function stackBanHelp(player, prefix, stackBanBoolean) {
    let commandStatus;
    if (!config.customcommands.stackban) {
        commandStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    let moduleStatus;
    if (stackBanBoolean === false) {
        moduleStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        moduleStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: stackban`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: stackban [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Toggles checks for player's with illegal stacks over 64.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}stackban`,
        `    ${prefix}stackban help`,
    ]);
}
/**
 * @name stackban
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function stackban(message, args) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/stackban.js:35)");
    }
    const player = message.sender;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限がないと実行できません！！`);
    }
    // Get Dynamic Property Boolean
    const stackBanBoolean = dynamicPropertyRegistry.get("stackban_b");
    const illegalItemsABoolean = dynamicPropertyRegistry.get("illegalitemsa_b");
    const illegalItemsBBoolean = dynamicPropertyRegistry.get("illegalitemsb_b");
    // Check for custom prefix
    const prefix = getPrefix(player);
    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.stackban) {
        return stackBanHelp(player, prefix, stackBanBoolean);
    }
    if (!illegalItemsABoolean && !illegalItemsBBoolean) {
        if (stackBanBoolean) {
            // In this stage they are likely turning it off so oblige their request
            dynamicPropertyRegistry.set("stackban_b", false);
            return world.setDynamicProperty("stackban_b", false);
        }
        // If illegal items are not enabled then let user know this feature is inaccessible
        // It will not work without one of them
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to enable Illegal Items to use this feature.`);
    }
    if (stackBanBoolean === false) {
        // Allow
        dynamicPropertyRegistry.set("stackban_b", true);
        world.setDynamicProperty("stackban_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6StackBans§f!`);
    }
    else if (stackBanBoolean === true) {
        // Deny
        dynamicPropertyRegistry.set("stackban_b", false);
        world.setDynamicProperty("stackban_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4StackBans§f!`);
    }
}

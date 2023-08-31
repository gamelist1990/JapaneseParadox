import { world } from "@minecraft/server";
import config from "../../data/config.js";
import { AntiKnockbackA } from "../../penrose/TickEvent/knockback/antikb_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
function antikbHelp(player, prefix, antikbBoolean) {
    let commandStatus;
    if (!config.customcommands.antikb) {
        commandStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    let moduleStatus;
    if (antikbBoolean === false) {
        moduleStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        moduleStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: antikb`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: antikb [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Toggles Anti Knockback for all players.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}antikb`,
        `    ${prefix}antikb help`,
    ]);
}
/**
 * @name antiknockback
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function antiknockback(message, args) {
    handleAntiKnockback(message, args).catch((error) => {
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
async function handleAntiKnockback(message, args) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/antikb.js:36)");
    }
    const player = message.sender;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限がないと実行できません！！`);
    }
    // Get Dynamic Property Boolean
    const antikbBoolean = dynamicPropertyRegistry.get("antikb_b");
    // Check for custom prefix
    const prefix = getPrefix(player);
    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.antikb) {
        return antikbHelp(player, prefix, antikbBoolean);
    }
    if (antikbBoolean === false) {
        // Allow
        dynamicPropertyRegistry.set("antikb_b", true);
        world.setDynamicProperty("antikb_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6Anti Knockback§f!`);
        AntiKnockbackA();
    }
    else if (antikbBoolean === true) {
        // Deny
        dynamicPropertyRegistry.set("antikb_b", false);
        world.setDynamicProperty("antikb_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4Anti Knockback§f!`);
    }
}

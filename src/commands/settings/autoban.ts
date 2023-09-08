import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import config from "../../data/config.js";
import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { AutoBan } from "../../penrose/TickEvent/ban/autoban.js";

function autobanHelp(player: Player, prefix: string, autoBanBoolean: string | number | boolean) {
    let commandStatus: string;
    if (!config.customcommands.autoban) {
        commandStatus = "§6[§4DISABLED§6]§f";
    } else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    let moduleStatus: string;
    if (autoBanBoolean === false) {
        moduleStatus = "§6[§4DISABLED§6]§f";
    } else {
        moduleStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: autoban`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: autoban [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Toggles the autoban module which will ban players based on their violations if above 50.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}autoban`,
        `    ${prefix}autoban help`,
    ]);
}

/**
 * @name autoban
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function autoban(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/autoban.js:36)");
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限がないと実行できません！！`);
    }

    // Get Dynamic Property Boolean
    const autoBanBoolean = dynamicPropertyRegistry.get("autoban_b");

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.autoban) {
        return autobanHelp(player, prefix, autoBanBoolean);
    }

    if (autoBanBoolean === false) {
        // Allow
        dynamicPropertyRegistry.set("autoban_b", true);
        world.setDynamicProperty("autoban_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6autoban§f!`);
        AutoBan();
    } else if (autoBanBoolean === true) {
        // Deny
        dynamicPropertyRegistry.set("autoban_b", false);
        world.setDynamicProperty("autoban_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4autoban§f!`);
    }
}

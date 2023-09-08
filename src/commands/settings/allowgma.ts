import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import config from "../../data/config.js";
import { Adventure } from "../../penrose/TickEvent/gamemode/adventure.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";

function allowgmaHelp(player: Player, prefix: string, adventureGMBoolean: string | number | boolean) {
    let commandStatus: string;
    if (!config.customcommands.allowgma) {
        commandStatus = "§6[§4DISABLED§6]§f";
    } else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    let moduleStatus: string;
    if (adventureGMBoolean === false) {
        moduleStatus = "§6[§4DISABLED§6]§f";
    } else {
        moduleStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: allowgma`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: allowgma [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Toggles Gamemode 2 (Adventure) to be used.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}allowgma`,
        `    ${prefix}allowgma help`,
    ]);
}

/**
 * @name allowgma
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function allowgma(message: ChatSendAfterEvent, args: string) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/allowGMA.js:36)");
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限がないと実行できません！！`);
    }

    // Get Dynamic Property Boolean
    const adventureGMBoolean = dynamicPropertyRegistry.get("adventuregm_b");
    const creativeGMBoolean = dynamicPropertyRegistry.get("creativegm_b");
    const survivalGMBoolean = dynamicPropertyRegistry.get("survivalgm_b");

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.allowgma) {
        return allowgmaHelp(player, prefix, adventureGMBoolean);
    }

    if (adventureGMBoolean === false) {
        // Allow
        dynamicPropertyRegistry.set("adventuregm_b", true);
        world.setDynamicProperty("adventuregm_b", true);
        // Make sure at least one is allowed since this could cause serious issues if all were locked down
        // We will allow Adventure Mode in this case
        if (survivalGMBoolean === true && creativeGMBoolean === true) {
            dynamicPropertyRegistry.set("adventuregm_b", false);
            world.setDynamicProperty("adventuregm_b", false);
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f Since all gamemodes were disallowed, Adventure mode has been enabled.`);
            Adventure();
            return;
        }
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f has disallowed §4Gamemode 2 (Adventure)§f to be used!`);
        Adventure();
    } else if (adventureGMBoolean === true) {
        // Deny
        dynamicPropertyRegistry.set("adventuregm_b", false);
        world.setDynamicProperty("adventuregm_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f has allowed §6Gamemode 2 (Adventure)§f to be used!`);
    }
}

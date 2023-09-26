import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import config from "../../data/config.js";
import { ChatSendAfterEvent, Player, world, Vector3 } from "@minecraft/server";
import { CrasherA } from "../../penrose/TickEvent/crasher/crasher_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";

function crasheraHelp(player: Player, prefix: string, crasherABoolean: string | number | boolean | Vector3) {
    let commandStatus: string;
    if (!config.customcommands.crashera) {
        commandStatus = "§6[§4DISABLED§6]§f";
    } else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    let moduleStatus: string;
    if (crasherABoolean === false) {
        moduleStatus = "§6[§4DISABLED§6]§f";
    } else {
        moduleStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: crashera`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: crashera [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Toggles checks for the infamous Horion Crasher.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}crashera`,
        `    ${prefix}crashera help`,
    ]);
}

/**
 * @name crasherA
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function crasherA(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/crashera.js:36)");
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限がないと実行できません！！`);
    }

    // Get Dynamic Property Boolean
    const crasherABoolean = dynamicPropertyRegistry.get("crashera_b");

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.crashera) {
        return crasheraHelp(player, prefix, crasherABoolean);
    }

    if (crasherABoolean === false) {
        // Allow
        dynamicPropertyRegistry.set("crashera_b", true);
        world.setDynamicProperty("crashera_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6CrasherA§f!`);
        CrasherA();
    } else if (crasherABoolean === true) {
        // Deny
        dynamicPropertyRegistry.set("crashera_b", false);
        world.setDynamicProperty("crashera_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4CrasherA§f!`);
    }
}

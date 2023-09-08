import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import config from "../../data/config.js";
import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { XrayA } from "../../penrose/BlockBreakAfterEvent/xray/xray_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";

function xrayAHelp(player: Player, prefix: string, xrayBoolean: string | number | boolean) {
    let commandStatus: string;
    if (!config.customcommands.xraya) {
        commandStatus = "§6[§4DISABLED§6]§f";
    } else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    let moduleStatus: string;
    if (xrayBoolean === false) {
        moduleStatus = "§6[§4DISABLED§6]§f";
    } else {
        moduleStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: xraya`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: xraya [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Notify's staff when and where player's mine specific ores.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}xraya`,
        `    ${prefix}xraya help`,
    ]);
}

/**
 * @name xrayA
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function xrayA(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/xraya.js:36)");
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限がないと実行できません！！`);
    }

    // Get Dynamic Property Boolean
    const xrayBoolean = dynamicPropertyRegistry.get("xraya_b");

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.xraya) {
        return xrayAHelp(player, prefix, xrayBoolean);
    }

    if (xrayBoolean === false) {
        // Allow
        dynamicPropertyRegistry.set("xraya_b", true);
        world.setDynamicProperty("xraya_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6XrayA§f!`);
        XrayA();
    } else if (xrayBoolean === true) {
        // Deny
        dynamicPropertyRegistry.set("xraya_b", false);
        world.setDynamicProperty("xraya_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4XrayA§f!`);
    }
}

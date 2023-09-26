import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import config from "../../data/config.js";
import { ChatSendAfterEvent, Player, Vector3, world } from "@minecraft/server";
import { NamespoofB } from "../../penrose/TickEvent/namespoof/namespoof_b.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";

function namespoofBHelp(player: Player, prefix: string, nameSpoofBoolean: string | number | boolean | Vector3) {
    let commandStatus: string;
    if (!config.customcommands.namespoofb) {
        commandStatus = "§6[§4DISABLED§6]§f";
    } else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    let moduleStatus: string;
    if (nameSpoofBoolean === false) {
        moduleStatus = "§6[§4DISABLED§6]§f";
    } else {
        moduleStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: namespoofb`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: namespoofb [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Toggles checks for player's name that has Non ASCII characters.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}namespoofb`,
        `    ${prefix}namespoofb help`,
    ]);
}

/**
 * @name namespoofB
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function namespoofB(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/namespoofb.js:36)");
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません`);
    }

    // Get Dynamic Property Boolean
    const nameSpoofBoolean = dynamicPropertyRegistry.get("namespoofb_b");

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.namespoofb) {
        return namespoofBHelp(player, prefix, nameSpoofBoolean);
    }

    if (nameSpoofBoolean === false) {
        // Allow
        dynamicPropertyRegistry.set("namespoofb_b", true);
        world.setDynamicProperty("namespoofb_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 有効にしました＝＞ §6NamespoofB§f!`);
        NamespoofB;
    } else if (nameSpoofBoolean === true) {
        // Deny
        dynamicPropertyRegistry.set("namespoofb_b", false);
        world.setDynamicProperty("namespoofb_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効にしました＝＞ §4NamespoofB§f!`);
    }
}

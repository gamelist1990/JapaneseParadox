import { ChatSendAfterEvent, Player } from "@minecraft/server";
import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";

function vanishHelp(player: Player, prefix: string) {
    let commandStatus: string;
    if (!config.customcommands.vanish) {
        commandStatus = "§6[§4DISABLED§6]§f";
    } else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: vanish`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: vanish [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Turns the player invisible to monitor online player's.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}vanish`,
        `        §4- §6Turns the player invisible to other players§f`,
        `    ${prefix}vanish help`,
        `        §4- §6Show command help§f`,
    ]);
}

/**
 * @name vanish
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function vanish(message: ChatSendAfterEvent, args: string[]) {
    handleVanish(message, args).catch((error) => {
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

async function handleVanish(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./utility/vanish.js:26)");
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限がないと実行できません！！`);
    }

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.vanish) {
        return vanishHelp(player, prefix);
    }

    const vanishBoolean = player.hasTag("vanish");

    if (vanishBoolean) {
        player.removeTag("vanish");
        player.triggerEvent("unvanish");
        player.runCommandAsync(`effect @s clear`);
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 透明化が解除されました`);
        sendMsg(`@a[tag=paradoxOpped]`, `§f§4[§6Paradox§4]§f ${player.name}§fは透明化が解除されました`);
    } else {
        player.addTag("vanish");
        player.triggerEvent("vanish");
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 透明化が有効です`);
        sendMsg(`@a[tag=paradoxOpped]`, `§f§4[§6Paradox§4]§f ${player.name}§f は透明化が有効になりました`);
    }
}

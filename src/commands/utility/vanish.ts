import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { MinecraftEffectTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index.js";
import ConfigInterface from "../../interfaces/Config.js";

function vanishHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: vanish`,
        `§4[§6ステータス§4]§f: ${commandStatus}`,
        `§4[§6使用法§4]§f: vanish [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6説明§4]§f: Turns the player invisible to monitor online player's.`,
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
        return console.warn(`${new Date()} | ` + "エラー: ${message} が定義されていません。渡すのを忘れましたか? (./utility/vanish.js:26)");
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(
            player,
            `§f§4[§6Paradox§4]§f このコマンドを使用するには、管理者にしか使えません
`
        );
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.vanish) {
        return vanishHelp(player, prefix, configuration.customcommands.vanish);
    }

    const vanishBoolean = player.hasTag("vanish");

    if (vanishBoolean) {
        player.removeTag("vanish");
        player.triggerEvent("unvanish");
        // Remove effects
        const effectsToRemove = [MinecraftEffectTypes.Invisibility, MinecraftEffectTypes.NightVision];

        for (const effectType of effectsToRemove) {
            player.removeEffect(effectType);
        }
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You are no longer vanished.`);
        sendMsg(`@a[tag=paradoxOpped]`, `§f§4[§6Paradox§4]§f §7${player.name}§f is no longer in vanish.`);
    } else {
        player.addTag("vanish");
        player.triggerEvent("vanish");
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You are now vanished!`);
        sendMsg(`@a[tag=paradoxOpped]`, `§f§4[§6Paradox§4]§f §7${player.name}§f is now vanished!`);
    }
}

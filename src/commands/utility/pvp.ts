import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";

function pvpHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: pvp`,
        `§4[§6ステータス§4]§f: ${commandStatus}`,
        `§4[§6使用法§4]§f: pvp [optional]`,
        `§4[§6Optional§4]§f: enable, disable, help`,
        `§4[§6説明§4]§f: Enables or Disables PVP. While disabled you wont take damage when another player attacks you.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}pvp enable`,
        `        §4- §6Enables PVP§f`,
        `    ${prefix}pvp disable`,
        `        §4- §6Disables PVP§f`,
        `    ${prefix}pvp help`,
        `        §4- §6Show command help§f`,
    ]);
}

/**
 * @name pvp
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function pvp(message: ChatSendAfterEvent, args: string[]) {
    // Validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "エラー: ${message} が定義されていません。渡すのを忘れましたか? ./commands/utility/pvp.js:26)");
    }

    const player = message.sender;

    // Check for custom prefix
    const prefix = getPrefix(player);

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Are there arguements
    if (!args.length) {
        return pvpHelp(player, prefix, configuration.customcommands.pvp);
    }

    // Was help requested
    const argCheck = args[0];
    if (argCheck && (args[0].toLowerCase() === "help" || !configuration.customcommands.pvp)) {
        return pvpHelp(player, prefix, configuration.customcommands.pvp);
    }
    if (argCheck && args[0].toLowerCase() === "enable") {
        player.removeTag("pvpDisabled");
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You have §2enabled §fPVP.`);
    }
    if (argCheck && args[0].toLowerCase() === "disable") {
        player.addTag("pvpDisabled");
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You have §4disabled §fPVP.`);
    }
}

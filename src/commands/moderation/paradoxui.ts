import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { paradoxui } from "../../gui/paradoxui.js";
import { ShowRules } from "../../gui/showrules/showrules.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

function paradoxuiHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4DISABLED§6]§f";
    } else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: paradoxui`,
        `§4[§6ステータス§4]§f: ${commandStatus}`,
        `§4[§6使用法§4]§f: paradoxui [オプション]`,
        `§4[§6オプション§4]§f: help`,
        `§4[§6説明§4]§f: メインメニューのGUIを表示します。`,
        `§4[§6例§4]§f:`,
        `    ${prefix}paradoxui`,
        `        §4- §6ParadoxのメインメニューGUIを開く§f`,
        `    ${prefix}paradoxui help`,
        `        §4- §6コマンドのヘルプを表示§f`,
    ]);
}

/**
 * @name paradoxUI
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function paradoxUI(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "エラー: ${message} が定義されていません。渡すのを忘れましたか? (./commands/moderation/paradoxui.js:36)");
    }

    const player = message.sender;

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    //check to see if the player has the rules tag incase they have been able to call the UI command before the
    // rules have been displayed.
    if (player.hasTag("ShowRulesOnJoin") && configuration.modules.showrules.enabled === true) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ルールに同意していない。これらが表示されたら試してみてください.`);
        return ShowRules();
    }

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.paradoxiu) {
        return paradoxuiHelp(player, prefix, configuration.customcommands.paradoxiu);
    }

    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ParadoxUIのチャットウィンドウを閉じる.`);
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f §6ParadoxUI§f を要求しました!`);
    paradoxui(player);
}

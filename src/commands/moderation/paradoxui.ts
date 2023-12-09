import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { paradoxui } from "../../gui/paradoxui.js";
import { ShowRules } from "../../gui/showrules/showrules.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

function paradoxuiHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `§6コマンド§4]§f: パラドクスイ`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f: paradoxui [オプション]。`,
        `§4[§6オプション§4]§f: ヘルプ`,
        `§4[§6説明§4]§f：メインメニューの GUI を表示する。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}paradoxui`,
        `        §4- §6ParadoxのメインメニューGUIを開く§f`,
        `    ${prefix}paradoxui help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name paradoxUI
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function paradoxUI(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/paradoxui.js:36)");
    }

    const player = message.sender;

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    //の前にUIコマンドを呼び出すことができた場合に備えて、プレーヤーがルールタグを持っているかどうかをチェックする。
    // のルールが表示された。
    if (player.hasTag("ShowRulesOnJoin") && configuration.modules.showrules.enabled === true) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたはルールに同意していません。表示されましたら、お試しください。`);
        return ShowRules();
    }

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.paradoxiu) {
        return paradoxuiHelp(player, prefix, configuration.customcommands.paradoxiu);
    }

    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fParadoxUIのチャットウィンドウを閉じる。`);
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f がメニューを開きました§f!`);
    paradoxui(player);
}

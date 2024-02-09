import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

function notifyHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f。";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: notify`,
        `§4[§6ステータス§4]§f: ${commandStatus}.`,
        `§4[§6使用法§4]§f: notify [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6説明§4]§f：不正行為の通知をトグルのように切り替える。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}notify`,
        `        §4- §6チート通知の切り替え§f`,
        `    ${prefix}notify help`,
        `        §4- §6Show command help§f`,
    ]);
}

/**
 * @name notify
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function notify(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`新しい日付()}。|` + "エラー: ${message} が定義されていません。渡すのを忘れましたか? (./commands/moderation/notify.js:26)");
    }

    const player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(
            player,
            `§f§4[§6Paradox§4]§f このコマンドを使用するには、管理者にしか使えません
`
        );
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.notify) {
        return notifyHelp(player, prefix, configuration.customcommands.notify);
    }

    const tagBoolean = player.hasTag("notify");

    // 無効
    if (tagBoolean) {
        player.removeTag("notify");
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたはチート通知を無効にしています。`);
    }

    // 有効にする
    if (!tagBoolean) {
        player.addTag("notify");
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fチート通知を有効にしました。`);
    }
}

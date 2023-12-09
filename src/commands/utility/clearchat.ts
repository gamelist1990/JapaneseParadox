import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

function clearChatHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\nコマンド§4[§6コマンド§4]§f：クリアチャット`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f: clearchat [オプション］`,
        `§4[§6オプション§4]§f: ヘルプ`,
        `§4[§6説明§4]§f：チャットをクリアする。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}clearchat`,
        `        §4- §6チャットをクリアする§f`,
        `    ${prefix}clearchat help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name clearchat
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function clearchat(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./utility/notify.js:26)");
    }

    const player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.clearchat) {
        return clearChatHelp(player, prefix, configuration.customcommands.clearchat);
    }

    for (let clear = 0; clear < 10; clear++) sendMsg("@a", "\n".repeat(60));

    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f チャットは§7${player.name}§f によってクリアされました`);
}

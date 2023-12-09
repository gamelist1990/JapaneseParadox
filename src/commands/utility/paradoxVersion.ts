import { ChatSendAfterEvent, Player } from "@minecraft/server";
import versionFile from "../../version.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";

function versionHelp(player: Player, prefix: string) {
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f：バージョン`,
        `§4[§6使用§4]§f: バージョン [オプション］`,
        `§4[§6オプション§4]§f: ヘルプ`,
        `§4[§6説明§4]§f：インストールされている paradox のバージョンを表示する。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}version`,
        `        §4- §6インストールされたParadoxのプリントアウト§f`,
        `    ${prefix}version help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name paradoxVersion
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function paradoxVersion(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./utility/paradoxVersion.js:26)");
    }

    const player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
    }

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    // 助けを求められたか
    const argCheck = args[0];
    if (argCheck && args[0].toLowerCase() === "help") {
        return versionHelp(player, prefix);
    }

    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f Version §2${versionFile.version}`);
}

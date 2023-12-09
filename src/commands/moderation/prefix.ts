import { getPrefix, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

function resetPrefix(player: Player, configuration: ConfigInterface) {
    const sanitize = player.getTags();
    for (const tag of sanitize) {
        if (tag.startsWith("Prefix:")) {
            player.removeTag(tag);
            configuration.customcommands.prefix = "!";
        }
    }
    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f接頭辞がリセットされた！`);
}

function prefixHelp(player: Player, prefix: string) {
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: 接頭辞`,
        `§4[§6使用§4]§f：接頭辞 [オプション］`,
        `§4[§6オプション§4]§f：接頭辞、ヘルプ`,
        `§4[§6説明§4]§f：コマンドの接頭辞を変更する。最大 2 文字。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}prefix !!`,
        `        §4- §6 コマンドの接頭辞を "!!" に変更 §f`,
        `    ${prefix}prefix @!`,
        `        §4- §6 コマンドの接頭辞を "@!" に変更 §f`,
        `    ${prefix}prefix $`,
        `        §4- §6コマンドの接頭辞を"$"に変更 §f`,
        `    ${prefix}prefix help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name prefix
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function prefix(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/prefix.js:34)");
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
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.prefix) {
        return prefixHelp(player, prefix);
    }

    // 反論はあるか
    if (!args.length) {
        return prefixHelp(player, prefix);
    }

    // 配列に文字列'リセット'が含まれているかチェックする。
    const argcheck = args.includes("reset");

    // リセット接頭辞
    if (argcheck === true) {
        resetPrefix(player, configuration);
        return;
    }

    if (args[0][0] == "/") {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f接頭辞'/'の使用は許されない！`);
    }

    // 条件下での接頭辞変更コマンド
    if (args[0].length <= 2 && args[0].length >= 1) {
        resetPrefix(player, configuration);
        configuration.customcommands.prefix = args[0];
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 接頭辞が'§7${args[0]}§f'に変更されました`);
        return player.addTag("Prefix:" + args[0]);
    } else {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f接頭辞の長さを2文字以上にすることはできない！`);
    }
}

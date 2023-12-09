import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

function creditsHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: クレジット`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f：クレジット [オプション］`,
        `§4[§6オプション§4]§f: ヘルプ`,
        `§4[§6説明§4]§f：Paradox Anti Cheatのクレジットを表示する。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}credits`,
        `        §4- §6Show credits for Paradox Anti Cheat§f`,
        `    ${prefix}credits help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name credits
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function credits(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/credits.js:26)");
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
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.credits) {
        return creditsHelp(player, prefix, configuration.customcommands.credits);
    }

    sendMsgToPlayer(player, [
        ` `,
        `§l§6 Scythe AntiCheatに基づく。`,
        `§l§4-----------------------------------------------------`,
        `§lGithub:§f https://https://github.com/MrDiamond64/Scythe-AntiCheat`,
        `§lMrDiamond64 によって開発され、維持されている。`,
        ` `,
        `§l§6鎌への主な貢献者`,
        `§l§4-----------------------------------------------------`,
        `Visual1mpact#1435 - 関数ベースのコマンドを GameTest コマンドに移植し、多くのバグを見つける`,
        ` `,
        `§l§6 Paradox・アンチチート (アーカイブ)`,
        `§l§4-----------------------------------------------------`,
        `§lGithub:§f https://github.com/Visual1mpact/Paradox_AntiCheat`,
        `§lParadox AntiCheat§f - Bedrock Edition上で悪意あるハッカーと戦うためのユーティリティ。`,
        `§開発・保守：Visual1mpact#1435`,
        ` `,
        `§l§6 Paradox・アンチチート (アーカイブ)`,
        `§l§4-----------------------------------------------------`,
        `§lGithub:§f https://github.com/frostice482/Paradox_AntiCheat`,
        `§FrostIce482#8139によって開発および保守されています。`,
        ` `,
        `§l§6Paradox・アンチチート(続き)`,
        `§l§4-----------------------------------------------------`,
        `§lGithub:§f https://github.com/Pete9xi/Paradox_AntiCheat`,
        `§Pete9xi#7928によって開発・保守されている。`,
        ` `,
        `§l§6Paradoxの主な要因`,
        `§l§4-----------------------------------------------------`,
        `不具合#8024 - 機能の実装とバグ修正`,
        `FrostIce482#8139 - 機能の実装、デバッグの強化、バグ修正`,
        `Visual1mpact#1435 - 機能の実装、デバッグ、セキュリティ、およびバグ修正`,
        `Pete9xi#7928 - 機能の実装、デバッグ、GUI グル、バグ修正`,
        ` `,
    ]);
    return;
}

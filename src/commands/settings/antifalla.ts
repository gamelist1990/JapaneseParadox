import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { AntiFallA } from "../../penrose/TickEvent/antifalla/antifall_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the AntiFallA command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} antifallABoolean - The status of AntiFallA module.
 * @param {boolean} setting - The status of the AntiFallA custom command setting.
 */
function antifallaHelp(player: Player, prefix: string, antifallABoolean: boolean, setting: boolean): void {
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = antifallABoolean ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f：アンチフォール`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}antifalla [options]`,
        `§4[§6Description§4]§f：サバイバルモードで落下ダメージを受けないようにするためのチェックを切り替えられるようにする。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7アンチフォールモジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7アンチフォールモジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7アンチフォールモジュールを無効にする§4]§f`,
    ]);
}

/**
 * @name antifallA
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function antifallA(message: ChatSendAfterEvent, args: string[]): void {
    handleAntiFallA(message, args).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // スタックトレース情報の抽出
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });
}

async function handleAntiFallA(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | Error: ${message} isn't defined. Did you forget to pass it? (./commands/settings/antifalla.js:36)`);
    }

    const player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
        return;
    }

    // ダイナミック・プロパティ・ブール値の取得
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    // 位置以外の引数をチェックする
    const length = args.length;
    let validFlagFound = false; // Flag to track if any valid flag is encountered
    for (let i = 0; i < length; i++) {
        const additionalArg: string = args[i].toLowerCase();

        // 追加引数の処理
        switch (additionalArg) {
            case "-h":
            case "--help":
                validFlagFound = true;
                return antifallaHelp(player, prefix, configuration.modules.antifallA.enabled, configuration.customcommands.antifalla);
            case "-s":
            case "--status":
                // ハンドル状態フラグ
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AntiFallA module is currently ${configuration.modules.antifallA.enabled ? "有効" : "無効"}`);
                break;
            case "-e":
            case "--enable":
                // ハンドルイネーブルフラグ
                validFlagFound = true;
                if (configuration.modules.antifallA.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f転倒防止モジュールは既にBooleanになっている．`);
                } else {
                    configuration.modules.antifallA.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6AntiFallA§f!`);
                    AntiFallA();
                }
                break;
            case "-d":
            case "--disable":
                // ハンドル無効フラグ
                validFlagFound = true;
                if (!configuration.modules.antifallA.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f落下防止モジュールは既に無効になっている。`);
                } else {
                    configuration.modules.antifallA.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4AntiFallA§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}antifalla --help for more information.`);
    }
}

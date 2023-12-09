import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { AntiPhaseA } from "../../penrose/TickEvent/phase/phase_a.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the AntiPhaseA command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} antiPhaseABoolean - The status of AntiPhaseA module.
 * @param {boolean} setting - The status of the AntiPhaseA custom command setting.
 */
function antiphaseaHelp(player: Player, prefix: string, antiPhaseABoolean: boolean, setting: boolean): void {
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = antiPhaseABoolean ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    sendMsgToPlayer(player, [
        `§6コマンド§4]§f：アンチファセア`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}antiphasea [options]`,
        `§4[§6解説§4]§f：ブロックをフェイズスルーする能力についてプレイヤーを監視する。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7AntiPhaseAモジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7AntiPhaseAモジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7AntiPhaseAモジュールを無効にする§4]§f`,
    ]);
}

/**
 * @name antiphaseA
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function antiphaseA(message: ChatSendAfterEvent, args: string[]): void {
    handleAntiPhaseA(message, args).catch((error) => {
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

async function handleAntiPhaseA(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | Error: ${message} isn't defined. Did you forget to pass it? (./commands/settings/antiphasea.js:34)`);
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
                return antiphaseaHelp(player, prefix, configuration.modules.antiphaseA.enabled, configuration.customcommands.phase);
            case "-s":
            case "--status":
                // ハンドル状態フラグ
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AntiPhaseA module is currently ${configuration.modules.antiphaseA.enabled ? "有効" : "無効"}`);
                break;
            case "-e":
            case "--enable":
                // ハンドルイネーブルフラグ
                validFlagFound = true;
                if (configuration.modules.antiphaseA.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fアンチフェーズモジュールは既にBooleanになっている。`);
                } else {
                    configuration.modules.antiphaseA.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6AntiPhaseA§f!`);
                    AntiPhaseA();
                }
                break;
            case "-d":
            case "--disable":
                // ハンドル無効フラグ
                validFlagFound = true;
                if (!configuration.modules.antiphaseA.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fアンチフェーズモジュールは既に無効になっている。`);
                } else {
                    configuration.modules.antiphaseA.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4AntiPhaseA§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}antiphasea --help for more information.`);
    }
}

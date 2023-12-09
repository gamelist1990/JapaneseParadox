import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { AutoClicker } from "../../penrose/EntityHitEntityAfterEvent/autoclicker.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the Autoclicker command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} autoClickerBoolean - The status of AutoClicker module.
 * @param {boolean} setting - The status of the AutoClicker custom command setting.
 */
function autoclickerHelp(player: Player, prefix: string, autoClickerBoolean: boolean, setting: boolean): void {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = autoClickerBoolean ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `\n[コマンド§4[§6 コマンド§4]§f: オートクリッカー`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}autoclicker [options]`,
        `§4[§6Description§4]§f：攻撃中にオートクリッカーを使用しているプレイヤーのチェックを切り替える。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7オートクリッカーモジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7オートクリッカーモジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7オートクリッカーモジュールを無効にする§4]§f`,
    ]);
}

/**
 * Handles the Autoclicker command.
 * @name autoclicker
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function autoclicker(message: ChatSendAfterEvent, args: string[]) {
    handleAutoclicker(message, args).catch((error) => {
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

/**
 * Handles the execution of the Autoclicker command.
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleAutoclicker(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/autoclicker.js:33)`);
    }

    const player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
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
                return autoclickerHelp(player, prefix, configuration.modules.autoclicker.enabled, configuration.customcommands.autoclicker);
            case "-s":
            case "--status":
                // ハンドル状態フラグ
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AutoClicker module is currently ${configuration.modules.autoclicker.enabled ? "有効" : "無効"}`);
                break;
            case "-e":
            case "--enable":
                // ハンドルイネーブルフラグ
                validFlagFound = true;
                if (configuration.modules.autoclicker.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fオートクリッカーモジュールが既にBooleanになっている。`);
                } else {
                    configuration.modules.autoclicker.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6AutoClicker§f!`);
                    AutoClicker();
                }
                break;
            case "-d":
            case "--disable":
                // ハンドル無効フラグ
                validFlagFound = true;
                if (!configuration.modules.autoclicker.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fオートクリッカーモジュールは既に無効になっています。`);
                } else {
                    configuration.modules.autoclicker.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4AutoClicker§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        // 追加の引数はありません。
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}autoclicker --help for more information.`);
    }
}

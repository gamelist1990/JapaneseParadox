import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the illegalLores command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} illegalLoresBoolean - The status of the illegalLores module.
 * @param {boolean} setting - The status of the illegalLores custom command setting.
 */
function illegalLoresHelp(player: Player, prefix: string, illegalLoresBoolean: boolean, setting: boolean): void {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = illegalLoresBoolean ? "§6[§4無効§6]§f" : "§6[§a有効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `§n§o§4[§6コマンド§4]§f: イリーガルコース`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}illegallores [options]`,
        `§4[§6Description§4]§f：アイテムの不正な伝承のチェックをトグルする。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       モジュール§4[§7IllegalLores モジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7不正アクセス禁止モジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7IllegalLoresモジュールを無効にする§4]§f`,
    ]);
}

/**
 * Handles the illegalLores command.
 * @name illegalLores
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function illegalLores(message: ChatSendAfterEvent, args: string[]) {
    handleIllegalLores(message, args).catch((error) => {
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
 * Handles the execution of the illegalLores command.
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleIllegalLores(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/illegalLores.js:35)`);
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
                return illegalLoresHelp(player, prefix, configuration.modules.illegalLores.enabled, configuration.customcommands.illegallores);
            case "-s":
            case "--status":
                // ハンドル状態フラグ
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f IllegalLores module is currently ${configuration.modules.illegalLores.enabled ? "有効" : "無効"}`);
                break;
            case "-e":
            case "--enable":
                // ハンドルイネーブルフラグ
                validFlagFound = true;
                if (configuration.modules.illegalLores.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f IllegalLores モジュールは既にBooleanになっている．`);
                } else {
                    configuration.modules.illegalLores.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6IllegalLores§f!`);
                }
                break;
            case "-d":
            case "--disable":
                // ハンドル無効フラグ
                validFlagFound = true;
                if (!configuration.modules.illegalLores.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f IllegalLores モジュールは既に無効になっている。`);
                } else {
                    configuration.modules.illegalLores.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4IllegalLores§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}illegallores --help for more information.`);
    }
}

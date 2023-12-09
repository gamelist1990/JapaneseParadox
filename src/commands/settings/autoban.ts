import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { AutoBan } from "../../penrose/TickEvent/ban/autoban.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the Autoban command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} autoBanBoolean - The status of AutoBan module.
 * @param {boolean} setting - The status of the AutoBan custom command setting.
 */
function autobanHelp(player: Player, prefix: string, autoBanBoolean: boolean, setting: boolean): void {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = autoBanBoolean ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `\n[コマンド§4[§6 コマンド§4]§f: オートバン`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}autoban [options]`,
        `§4[§6Description§4]§f：AutoBanモジュールを切り替えます。AutoBanモジュールは、50を超えた場合、違反行為に基づいて自動的にプレイヤーを禁止します。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7オートバンモジュールの現在のステータスを表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7オートバンモジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7オートバンモジュールを無効にする§4]§f`,
    ]);
}

/**
 * Handles the Autoban command.
 * @name autoban
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function autoban(message: ChatSendAfterEvent, args: string[]) {
    handleAutoban(message, args).catch((error) => {
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
 * Handles the execution of the Autoban command.
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleAutoban(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/autoban.js:36)`);
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
                return autobanHelp(player, prefix, configuration.modules.autoBan.enabled, configuration.customcommands.autoban);
            case "-s":
            case "--status":
                // ハンドル状態フラグ
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AutoBan module is currently ${configuration.modules.autoBan.enabled ? "有効" : "無効"}`);
                break;
            case "-e":
            case "--enable":
                // ハンドルイネーブルフラグ
                validFlagFound = true;
                if (configuration.modules.autoBan.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f自動禁止モジュールは既にBooleanになっている。`);
                } else {
                    configuration.modules.autoBan.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6AutoBan§f!`);
                    AutoBan();
                }
                break;
            case "-d":
            case "--disable":
                // ハンドル無効フラグ
                validFlagFound = true;
                if (!configuration.modules.autoBan.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f自動禁止モジュールは既に無効になっている。`);
                } else {
                    configuration.modules.autoBan.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4AutoBan§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        // 追加の引数はありません。
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}autoban --help for more information.`);
    }
}

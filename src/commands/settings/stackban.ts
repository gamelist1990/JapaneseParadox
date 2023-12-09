import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Displays help information for the stackban command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} stackBanBoolean - The status of the stackBan module.
 * @param {boolean} setting - The status of the stackBan custom command setting.
 */
function stackBanHelp(player: Player, prefix: string, stackBanBoolean: boolean, setting: boolean): void {
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = stackBanBoolean ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    sendMsgToPlayer(player, [
        `§n§o§4[§6コマンド§4]§f：スタックバン`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}stackban [options]`,
        `§4[§6解説§4]§f：64以上の不正なスタックを持つプレイヤーのチェックを行います。`,
        `§4[§6オプション§4]§f：`,
        `    -d, --disable`,
        `       §4[§7スタック禁止モジュール§4を無効にする]§f`,
        `    -s, --status`,
        `       §4[§7スタック禁止モジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7スタック禁止モジュールをBooleanにする§4]§f`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
    ]);
}

/**
 * @name stackBan
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function stackBan(message: ChatSendAfterEvent, args: string[]): void {
    handleStackBan(message, args).catch((error) => {
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
 * Handles the stackban command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleStackBan(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | Error: ${message} isn't defined. Did you forget to pass it? (./commands/settings/stackban.js:35)`);
    }

    const player: Player = message.sender;
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
        return;
    }

    // ダイナミック・プロパティ・ブール値の取得
    const configuration: ConfigInterface = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // カスタム接頭辞のチェック
    const prefix: string = getPrefix(player);

    // 助けを求められたか
    if ((args[0] && args[0].toLowerCase() === "help") || !configuration.customcommands.stackban) {
        return stackBanHelp(player, prefix, configuration.modules.stackBan.enabled, configuration.customcommands.stackban);
    }

    // 位置以外の引数をチェックする
    const length = args.length;
    let validFlagFound = false; // Flag to track if any valid flag is encountered
    for (let i = 0; i < length; i++) {
        const additionalArg: string = args[i].toLowerCase();

        // 追加引数の処理
        switch (additionalArg) {
            case "-h":
            case "--help":
                // ヘルプ情報を表示する
                validFlagFound = true;
                return stackBanHelp(player, prefix, configuration.modules.stackBan.enabled, configuration.customcommands.stackban);

            case "-d":
            case "--disable":
                // stackBanモジュールがまだ無効でなければ無効にする。
                validFlagFound = true;
                if (configuration.modules.stackBan.enabled === false) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f §4StackBans§f は既に無効になっている．`);
                } else {
                    configuration.modules.stackBan.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4StackBans§f!`);
                }
                break;

            case "-e":
            case "--enable":
                // stackBanモジュールがまだBooleanでなければBooleanにする。
                validFlagFound = true;
                if (configuration.modules.stackBan.enabled === true) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f§6StackBans§fは既にBooleanになっている．`);
                } else {
                    configuration.modules.stackBan.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6StackBans§f!`);
                }
                break;

            case "-s":
            case "--status":
                // StackBanモジュールの現在のステータスを表示する
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f StackBan module is currently ${configuration.modules.stackBan.enabled ? "§aBoolean" : "§4無効"}§f.`);
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Please use ${prefix}stackban --help for usage information.`);
    }
}

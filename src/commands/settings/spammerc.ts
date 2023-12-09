import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { SpammerC } from "../../penrose/ChatSendBeforeEvent/spammer/spammer_c.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the spammerC command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} spammerC.enabled - The status of the spammerC module.
 * @param {boolean} setting - The status of the spammerC custom command setting.
 */
function spammerCHelp(player: Player, prefix: string, spammerCBoolean: boolean, setting: boolean): void {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = spammerCBoolean ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `§n§o§4[§6コマンド§4]§f: spammerc`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}spammerc [options]`,
        `§4[§6説明§4]§f：アイテムの使用中に送信されたメッセージのチェックを切り替えます。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7スパマーCモジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7スパマーCモジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7SpammerCモジュールを無効にする§4]§f`,
    ]);
}

/**
 * @name spammerC
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function spammerC(message: ChatSendAfterEvent, args: string[]): void {
    handleSpammerC(message, args).catch((error) => {
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
 * Handles the spammerC command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleSpammerC(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/spammerC.js:36)`);
    }

    const player: Player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
    }

    const configuration: ConfigInterface = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // カスタム接頭辞のチェック
    const prefix: string = getPrefix(player);

    // 位置以外の引数をチェックする
    const length = args.length;
    let validFlagFound = false; // Flag to track if any valid flag is encountered
    for (let i = 0; i < length; i++) {
        const additionalArg: string = args[i].toLowerCase();

        // 追加引数の処理
        switch (additionalArg) {
            case "-h":
            case "--help":
                // ヘルプメッセージを表示する
                validFlagFound = true;
                spammerCHelp(player, prefix, configuration.modules.spammerC.enabled, configuration.customcommands.spammerc);
                break;
            case "-s":
            case "--status":
                // SpammerCモジュールの現在のステータスを表示する
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f SpammerC module is currently ${configuration.modules.spammerC.enabled ? "§aBoolean" : "§4無効"}§f.`);
                break;
            case "-e":
            case "--enable":
                // SpammerCモジュールをBooleanにする
                validFlagFound = true;
                if (!configuration.modules.spammerC.enabled) {
                    configuration.modules.spammerC.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です=> §6SpammerC§f!`);
                    SpammerC();
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f SpammerC モジュールは既にBooleanになっています。`);
                }
                break;
            case "-d":
            case "--disable":
                // SpammerCモジュールを無効にする
                validFlagFound = true;
                if (configuration.modules.spammerC.enabled) {
                    configuration.modules.spammerC.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f has 無効 §4SpammerC§f!`);
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f SpammerC モジュールは既に無効になっています。`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}spammerc --help for command usage.`);
    }
}

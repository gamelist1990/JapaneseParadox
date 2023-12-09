import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { AFK } from "../../penrose/TickEvent/afk/afk.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the AFK command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {ConfigInterface} configuration - The current configuration.
 */
function afkHelp(player: Player, prefix: string, configuration: ConfigInterface): void {
    const commandStatus: string = configuration.customcommands.afk ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = configuration.modules.afk.enabled ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    sendMsgToPlayer(player, [
        `§6コマンド§o§4[§6コマンド§4]§f: afk`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}afk [options]`,
        `§4[§6Description§4]§f: Kicks players that are AFK for ${configuration.modules.afk.minutes} minutes.`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7AFKの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7AFKをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7AFKを無効にする§4]§f`,
        `    -m <値>, -分 <値`,
        `       §4[§7タイマーを分単位で設定する§4]§f`,
    ]);
}

/**
 * Handles the AFK command.
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function afk(message: ChatSendAfterEvent, args: string[]): void {
    handleAFK(message, args).catch((error) => {
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

async function handleAFK(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        console.warn(`${new Date()} | Error: ${message} isn't defined. Did you forget to pass it? (./commands/settings/afk.js:36)`);
        return;
    }

    const player: Player = message.sender;

    // ユニークIDの取得
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
                return afkHelp(player, prefix, configuration);
            case "-s":
            case "--status":
                // ハンドル状態フラグ
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fAFKは現在、 ${configuration.modules.afk.enabled ? "有効" : "無効"}`);
                break;
            case "-e":
            case "--enable":
                // ハンドルイネーブルフラグ
                validFlagFound = true;
                if (configuration.modules.afk.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AFKはすでにBooleanになっている。`);
                } else {
                    configuration.modules.afk.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6AFK§f!`);
                    AFK();
                }
                break;
            case "-d":
            case "--disable":
                // ハンドル無効フラグ
                validFlagFound = true;
                if (!configuration.modules.afk.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AFKはすでに無効になっている。`);
                } else {
                    configuration.modules.afk.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4AFK§f!`);
                }
                break;
            case "-m":
            case "--minutes": {
                validFlagFound = true;
                const numberConvert = Number(args[i + 1]);
                if (isNaN(numberConvert)) {
                    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid option. Use ${prefix}afk --help for more information.`);
                }
                configuration.modules.afk.minutes = numberConvert;
                dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has set §6AFK§f timer to §6${numberConvert}§f minutes!`);
                break;
            }
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}afk --help for more information.`);
    }
}

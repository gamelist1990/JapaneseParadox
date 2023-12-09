import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { ReachB } from "../../penrose/EntityHitEntityAfterEvent/reach_b.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the reachb command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} reachBBoolean - The status of the reachB module.
 * @param {boolean} setting - The status of the reachb custom command setting.
 */
function reachBHelp(player: Player, prefix: string, reachBBoolean: boolean, setting: boolean): void {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = reachBBoolean ? "§6[§4無効§6]§f" : "§6[§a有効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `§6コマンド§4]§f：到達点`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}reachb [options]`,
        `§4[§6解説§4]§f．プレイヤーの攻撃が届かないかどうかのチェックを切り替える。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7ReachBモジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7ReachBモジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7ReachBモジュールを無効にする§4]§f`,
    ]);
}

/**
 * @name reachB
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function reachB(message: ChatSendAfterEvent, args: string[]): void {
    handleReachB(message, args).catch((error) => {
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
 * Handles the reachb command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleReachB(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/reachb.js:36)`);
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
                reachBHelp(player, prefix, configuration.modules.reachB.enabled, configuration.customcommands.reachb);
                break;
            case "-s":
            case "--status":
                // ReachBモジュールの現在のステータスを表示
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ReachB module is currently ${configuration.modules.reachB.enabled ? "§aBoolean" : "§4無効"}§f.`);
                break;
            case "-e":
            case "--enable":
                // ReachBモジュールをBooleanにする
                validFlagFound = true;
                if (!configuration.modules.reachB.enabled) {
                    configuration.modules.reachB.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6ReachB§f!`);
                    ReachB();
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ReachB モジュールは既にBooleanです。`);
                }
                break;
            case "-d":
            case "--disable":
                // ReachBモジュールを無効にする
                validFlagFound = true;
                if (configuration.modules.reachB.enabled) {
                    configuration.modules.reachB.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4ReachB§f!`);
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ReachB モジュールは既に無効になっています。`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}reachb --help for command usage.`);
    }
}

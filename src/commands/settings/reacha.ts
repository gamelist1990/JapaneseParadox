import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { BeforeReachA } from "../../penrose/PlayerPlaceBlockBeforeEvent/reach/reach_a.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the reacha command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} reachABoolean - The status of the reachA module.
 * @param {boolean} setting - The status of the reacha custom command setting.
 */
function reachAHelp(player: Player, prefix: string, reachABoolean: boolean, setting: boolean) {
    // コマンドとモジュールのステータスを決定する
    const commandStatus = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus = reachABoolean ? "§6[§4無効§6]§f" : "§6[§a有効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `§n§o§4[§6コマンド§4]§f：リーチャ`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}reacha [options]`,
        `§4[§6解説§4]§f：手の届かないところにブロックを置いているプレイヤーのチェッ クを切り替える。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7リーチモジュールの現在の状態の表示§4]§f`,
        `    -e, --enable`,
        `       §4[§7ReachAモジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7ReachAモジュールを無効にする§4]§f`,
    ]);
}

/**
 * @name reachA
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function reachA(message: ChatSendAfterEvent, args: string[]) {
    handleReachA(message, args).catch((error) => {
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
 * Handles the reacha command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleReachA(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/reacha.js:36)`);
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
                reachAHelp(player, prefix, configuration.modules.reachA.enabled, configuration.customcommands.reacha);
                break;
            case "-s":
            case "--status":
                // ReachAモジュールの現在のステータスを表示
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ReachA module is currently ${configuration.modules.reachA.enabled ? "§aBoolean" : "§4無効"}§f.`);
                break;
            case "-e":
            case "--enable":
                // ReachAモジュールをBooleanにする
                validFlagFound = true;
                if (!configuration.modules.reachA.enabled) {
                    configuration.modules.reachA.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6ReachA§f!`);
                    BeforeReachA();
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fリーチモジュールは既にBooleanです。`);
                }
                break;
            case "-d":
            case "--disable":
                // ReachAモジュールを無効にする
                validFlagFound = true;
                if (configuration.modules.reachA.enabled) {
                    configuration.modules.reachA.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4ReachA§f!`);
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ReachA モジュールは既に無効になっています。`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}reacha --help for command usage.`);
    }
}

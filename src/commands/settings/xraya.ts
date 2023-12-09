import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { XrayA } from "../../penrose/PlayerBreakBlockAfterEvent/xray/xray_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the xrayA command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} xrayBoolean - The status of the xrayA module.
 * @param {boolean} setting - The status of the xrayA custom command setting.
 */
function xrayAHelp(player: Player, prefix: string, xrayBoolean: boolean, setting: boolean): void {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = xrayBoolean ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `§6コマンド§4]§f: xraya`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}xraya [options]`,
        `§4[§6説明§4]§f：プレイヤーがいつどこで特定の鉱石を採掘したかをスタッフに通知する。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7XrayAモジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7XrayAモジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7XrayAモジュールを無効にする§4]§f`,
    ]);
}

/**
 * @name xrayA
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function xrayA(message: ChatSendAfterEvent, args: string[]): void {
    handleXrayA(message, args).catch((error) => {
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
 * Handles the xrayA command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleXrayA(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/xrayA.js:36)`);
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
                xrayAHelp(player, prefix, configuration.modules.xrayA.enabled, configuration.customcommands.xraya);
                break;
            case "-s":
            case "--status":
                // XrayAモジュールの現在のステータスを表示する
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f XrayA module is currently ${configuration.modules.xrayA.enabled ? "§aBoolean" : "§4無効"}§f.`);
                break;
            case "-e":
            case "--enable":
                // XrayAモジュールをBooleanにする
                validFlagFound = true;
                if (!configuration.modules.xrayA.enabled) {
                    configuration.modules.xrayA.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です=> §6XrayA§f!`);
                    XrayA();
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fXrayAモジュールは既にBooleanになっています。`);
                }
                break;
            case "-d":
            case "--disable":
                // XrayAモジュールを無効にする
                validFlagFound = true;
                if (configuration.modules.xrayA.enabled) {
                    configuration.modules.xrayA.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f has 無効 §4XrayA§f!`);
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fXrayA モジュールは既に無効になっています。`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        // 無効なコマンド
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}xraya --help for command usage.`);
    }
}

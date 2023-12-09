import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { Adventure } from "../../penrose/TickEvent/gamemode/adventure.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the AllowGMA command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} adventureGMBoolean - The status of Adventure Gamemode module.
 * @param {boolean} setting - The status of the AllowGMA custom command setting.
 */
function allowgmaHelp(player: Player, prefix: string, adventureGMBoolean: boolean, setting: boolean): void {
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = adventureGMBoolean ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    sendMsgToPlayer(player, [
        `§6コマンド§4]§f: 許可するガンマ`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}allowgma [options]`,
        `§4[§6解説§4]§f：ゲームモード2(アドベンチャー)の使用を切り替えられるようにする。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7アドベンチャーゲームモードの現在のステータスを表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7アドベンチャーゲームモードをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7アドベンチャーゲームモードを無効にする§4]§f`,
    ]);
}

/**
 * @name allowgma
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function allowgma(message: ChatSendAfterEvent, args: string[]): void {
    handleAllowGMA(message, args).catch((error) => {
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

async function handleAllowGMA(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | Error: ${message} isn't defined. Did you forget to pass it? (./commands/settings/allowGMA.js:36)`);
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
                return allowgmaHelp(player, prefix, configuration.modules.adventureGM.enabled, configuration.customcommands.allowgma);
            case "-s":
            case "--status":
                // ハンドル状態フラグ
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Adventure Gamemode is currently ${configuration.modules.adventureGM.enabled ? "有効" : "無効"}`);
                break;
            case "-e":
            case "--enable":
                // ハンドルイネーブルフラグ
                validFlagFound = true;
                if (configuration.modules.adventureGM.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fアドベンチャーゲームモードは既にBooleanになっています。`);
                } else {
                    configuration.modules.adventureGM.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disallowed §4Gamemode 2 (Adventure)§f to be used!`);
                    Adventure();
                }
                break;
            case "-d":
            case "--disable":
                // ハンドル無効フラグ
                validFlagFound = true;
                if (!configuration.modules.adventureGM.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fアドベンチャーゲームモードは既に無効になっています。`);
                } else {
                    configuration.modules.adventureGM.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has allowed §6Gamemode 2 (Adventure)§f to be used!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}allowgma --help for more information.`);
    }
}

import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { ScaffoldA } from "../../penrose/PlayerPlaceBlockAfterEvent/scaffold/scaffold_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the AntiScaffoldA command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} antiScaffoldABoolean - The status of AntiScaffoldA module.
 * @param {boolean} setting - The status of the AntiScaffoldA custom command setting.
 */
function antiscaffoldaHelp(player: Player, prefix: string, antiScaffoldABoolean: boolean, setting: boolean): void {
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = antiScaffoldABoolean ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    sendMsgToPlayer(player, [
        `§n§o§4[§6コマンド§4]§f：アンチスカフォルダ`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}antiscaffolda [options]`,
        `§4[§6解説§4]§f：不正な足場の使用を監視する。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7アンチスキャフォールドモジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7AntiScaffoldAモジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7AntiScaffoldAモジュールを無効にする§4]§f`,
    ]);
}

/**
 * @name antiscaffoldA
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function antiscaffoldA(message: ChatSendAfterEvent, args: string[]): void {
    handleAntiScaffoldA(message, args).catch((error) => {
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

async function handleAntiScaffoldA(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | Error: ${message} isn't defined. Did you forget to pass it? (./commands/settings/antiscaffolda.js:36)`);
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
                return antiscaffoldaHelp(player, prefix, configuration.modules.antiscaffoldA.enabled, configuration.customcommands.antiscaffolda);
            case "-s":
            case "--status":
                // ハンドル状態フラグ
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AntiScaffoldA module is currently ${configuration.modules.antiscaffoldA.enabled ? "有効" : "無効"}`);
                break;
            case "-e":
            case "--enable":
                // ハンドルイネーブルフラグ
                validFlagFound = true;
                if (configuration.modules.antiscaffoldA.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fアンチスキャフォールドモジュールは既にBooleanになっている。`);
                } else {
                    configuration.modules.antiscaffoldA.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6AntiScaffoldA§f!`);
                    ScaffoldA();
                }
                break;
            case "-d":
            case "--disable":
                // ハンドル無効フラグ
                validFlagFound = true;
                if (!configuration.modules.antiscaffoldA.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fアンチスキャフォールドモジュールは既に無効になっている。`);
                } else {
                    configuration.modules.antiscaffoldA.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4AntiScaffoldA§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}antiscaffolda --help for more information.`);
    }
}

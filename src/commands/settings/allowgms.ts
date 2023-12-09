import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { Survival } from "../../penrose/TickEvent/gamemode/survival.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the AllowGMS command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} survivalGMBoolean - The status of Survival Gamemode module.
 * @param {boolean} setting - The status of the AllowGMS custom command setting.
 */
function allowgmsHelp(player: Player, prefix: string, survivalGMBoolean: boolean, setting: boolean): void {
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = survivalGMBoolean ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    sendMsgToPlayer(player, [
        `\n[コマンド§4[§6 コマンド§4]§f: allowgms`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}allowgms [options]`,
        `§4[§6説明§4]§f：ゲームモード0(サバイバル)の使用を切り替えられるようにする。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7サバイバルゲームモードの現在のステータスを表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7サバイバルゲームモードをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7サバイバルゲームモードを無効にする§4]§f`,
    ]);
}

/**
 * @name allowgms
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function allowgms(message: ChatSendAfterEvent, args: string[]): void {
    handleAllowGMS(message, args).catch((error) => {
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

async function handleAllowGMS(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | Error: ${message} isn't defined. Did you forget to pass it? (./commands/settings/allowGMS.js:37)`);
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
                return allowgmsHelp(player, prefix, configuration.modules.survivalGM.enabled, configuration.customcommands.allowgms);
            case "-s":
            case "--status":
                // ハンドル状態フラグ
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Survival Gamemode is currently ${configuration.modules.survivalGM.enabled ? "有効" : "無効"}`);
                break;
            case "-e":
            case "--enable":
                // ハンドルイネーブルフラグ
                validFlagFound = true;
                if (configuration.modules.survivalGM.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fサバイバルゲームモードは既にBooleanになっている。`);
                } else {
                    configuration.modules.survivalGM.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disallowed §4Gamemode 0 (Survival)§f to be used!`);
                    Survival();
                }
                break;
            case "-d":
            case "--disable":
                // ハンドル無効フラグ
                validFlagFound = true;
                if (!configuration.modules.survivalGM.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fサバイバルゲームモードは既に無効になっています。`);
                } else {
                    configuration.modules.survivalGM.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has allowed §6Gamemode 0 (Survival)§f to be used!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}allowgms --help for more information.`);
    }
}

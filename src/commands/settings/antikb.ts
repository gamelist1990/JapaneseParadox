import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { AntiKnockbackA } from "../../penrose/TickEvent/knockback/antikb_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the AntiKnockback command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {ConfigInterface} configuration - The configuration object.
 */
function antikbHelp(player: Player, prefix: string, configuration: ConfigInterface): void {
    const commandStatus: string = configuration.customcommands.antikb ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = configuration.modules.antikbA.enabled ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    sendMsgToPlayer(player, [
        `§6コマンド§4]§f: アンチCB`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}antikb [options]`,
        `§4[§6Description§4]§f：すべてのプレイヤーのアンチノックバックの切り替えを可能にする。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7アンチノックバックモジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7アンチノックバック・モジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7アンチノックバック・モジュールを無効にする§4]§f`,
        `    -v <値>, --速度 <値`,
        `       §4[§7変化速度強度§4]§f`,
    ]);
}

/**
 * Handles the AntiKnockback command.
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function antikb(message: ChatSendAfterEvent, args: string[]): void {
    handleAntiKnockback(message, args).catch((error) => {
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

async function handleAntiKnockback(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | Error: ${message} isn't defined. Did you forget to pass it? (./commands/settings/antikb.js:36)`);
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
                return antikbHelp(player, prefix, configuration);
            case "-s":
            case "--status":
                // ハンドル状態フラグ
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AntiKnockback module is currently ${configuration.modules.antikbA.enabled ? "有効" : "無効"}`);
                break;
            case "-e":
            case "--enable":
                // ハンドルイネーブルフラグ
                validFlagFound = true;
                if (configuration.modules.antikbA.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fアンチノックバックモジュールは既にBooleanになっている。`);
                } else {
                    configuration.modules.antikbA.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6Anti Knockback§f!`);
                    AntiKnockbackA();
                }
                break;
            case "-d":
            case "--disable":
                // ハンドル無効フラグ
                validFlagFound = true;
                if (!configuration.modules.antikbA.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fアンチノックバックモジュールは既に無効になっている。`);
                } else {
                    configuration.modules.antikbA.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4Anti Knockback§f!`);
                }
                break;
            case "-v":
            case "--velocity": {
                // ハンドル速度フラグ
                validFlagFound = true;
                const numberConvert = Number(args[i + 1]);
                if (isNaN(numberConvert)) {
                    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid option. Use ${prefix}antikb --help for more information.`);
                }
                configuration.modules.antikbA.velocityIntensity = numberConvert;
                dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has updated §6Anti Knockback§f velocity to §6${numberConvert}§f!`);
                break;
            }
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}antikb --help for more information.`);
    }
}

import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { BedrockValidate } from "../../penrose/TickEvent/bedrock/bedrockvalidate.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the BedrockValidate command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} bedrockValidateBoolean - The status of BedrockValidate module.
 * @param {boolean} setting - The status of the BedrockValidate custom command setting.
 */
function bedrockValidateHelp(player: Player, prefix: string, bedrockValidateBoolean: boolean, setting: boolean): void {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = bedrockValidateBoolean ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `§6コマンド§4]§f: 岩盤バリデーション`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}bedrockvalidate [options]`,
        `§4[§6Description§4]§f：岩盤検証のチェックを切り替える。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7BedrockValidateモジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7BedrockValidateモジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7BedrockValidateモジュールを無効にする§4]§f`,
    ]);
}

/**
 * Handles the BedrockValidate command.
 * @name bedrockvalidate
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function bedrockvalidate(message: ChatSendAfterEvent, args: string[]) {
    handleBedrockValidate(message, args).catch((error) => {
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
 * Handles the execution of the BedrockValidate command.
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleBedrockValidate(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/bedrockValidate.js:36)`);
    }

    const player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
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
                return bedrockValidateHelp(player, prefix, configuration.modules.bedrockValidate.enabled, configuration.customcommands.bedrockvalidate);
            case "-s":
            case "--status":
                // ハンドル状態フラグ
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f BedrockValidate module is currently ${configuration.modules.bedrockValidate.enabled ? "有効" : "無効"}`);
                break;
            case "-e":
            case "--enable":
                // ハンドルイネーブルフラグ
                validFlagFound = true;
                if (configuration.modules.bedrockValidate.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fBedrockValidateモジュールは既にBooleanになっています。`);
                } else {
                    configuration.modules.bedrockValidate.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6BedrockValidate§f!`);
                    BedrockValidate();
                }
                break;
            case "-d":
            case "--disable":
                // ハンドル無効フラグ
                validFlagFound = true;
                if (!configuration.modules.bedrockValidate.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f BedrockValidate モジュールは既に無効になっています。`);
                } else {
                    configuration.modules.bedrockValidate.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4BedrockValidate§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        // 追加の引数はありません。
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}bedrockvalidate --help for more information.`);
    }
}

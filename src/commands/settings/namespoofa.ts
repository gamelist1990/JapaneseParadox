import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { NamespoofA } from "../../penrose/TickEvent/namespoof/namespoof_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the namespoofA command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} nameSpoofBoolean - The status of the NamespoofA module.
 * @param {boolean} setting - The status of the namespoofa custom command setting.
 */
function namespoofAHelp(player: Player, prefix: string, nameSpoofBoolean: boolean, setting: boolean): void {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = nameSpoofBoolean ? "§6[§4無効§6]§f" : "§6[§a有効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `§6コマンド§4]§f: ネームプーファ`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}namespoofa [options]`,
        `§4[§6解説§4]§f：プレイヤーの名前が文字数の制限を超えたかどうかのチェックを切り替えます。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7NamespoofAモジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7NamespoofAモジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7NamespoofAモジュールを無効にする§4]§f`,
    ]);
}

/**
 * @name namespoofA
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function namespoofA(message: ChatSendAfterEvent, args: string[]) {
    handleNamespoofA(message, args).catch((error) => {
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
 * Handles the namespoofA command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleNamespoofA(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/namespoofa.js:36)`);
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
                // ヘルプメッセージを表示する
                validFlagFound = true;
                namespoofAHelp(player, prefix, configuration.modules.namespoofA.enabled, configuration.customcommands.namespoofa);
                break;
            case "-s":
            case "--status":
                // NamespoofAモジュールの現在の状態を表示する
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f NamespoofA module is currently ${configuration.modules.namespoofA.enabled ? "§aBoolean" : "§4無効"}§f.`);
                break;
            case "-e":
            case "--enable":
                // NamespoofAモジュールをBooleanにする
                validFlagFound = true;
                if (configuration.modules.namespoofA.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f名前偽装モジュールは既にBooleanです。`);
                } else {
                    configuration.modules.namespoofA.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6NamespoofA§f!`);
                    NamespoofA();
                }
                break;
            case "-d":
            case "--disable":
                // NamespoofAモジュールを無効にする
                validFlagFound = true;
                if (!configuration.modules.namespoofA.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f名前偽装モジュールは既に無効である。`);
                } else {
                    configuration.modules.namespoofA.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4NamespoofA§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}namespoofa --help for command usage.`);
    }
}

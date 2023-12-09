import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { NamespoofB } from "../../penrose/TickEvent/namespoof/namespoof_b.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the namespoofB command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} nameSpoofBoolean - The status of the NamespoofB module.
 * @param {boolean} setting - The status of the namespoofb custom command setting.
 */
function namespoofBHelp(player: Player, prefix: string, nameSpoofBoolean: boolean, setting: boolean): void {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = nameSpoofBoolean ? "§6[§4無効§6]§f" : "§6[§a有効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: namespoofb`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}namespoofb [options]`,
        `§4[§6Description§4]§f：非 ASCII 文字を含むプレイヤー名のチェックを切り替えます。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7NamespoofBモジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7NamespoofBモジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7NamespoofBモジュールを無効にする§4]§f`,
    ]);
}

/**
 * @name namespoofB
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function namespoofB(message: ChatSendAfterEvent, args: string[]) {
    handleNamespoofB(message, args).catch((error) => {
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
 * Handles the namespoofB command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleNamespoofB(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/namespoofb.js:36)`);
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
                namespoofBHelp(player, prefix, configuration.modules.namespoofB.enabled, configuration.customcommands.namespoofb);
                break;
            case "-s":
            case "--status":
                // NamespoofBモジュールの現在の状態を表示する
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f NamespoofB module is currently ${configuration.modules.namespoofB.enabled ? "§aBoolean" : "§4無効"}§f.`);
                break;
            case "-e":
            case "--enable":
                // NamespoofBモジュールをBooleanにする
                validFlagFound = true;
                if (configuration.modules.namespoofB.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f名前偽装モジュールは既にBooleanです。`);
                } else {
                    configuration.modules.namespoofB.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6NamespoofB§f!`);
                    NamespoofB();
                }
                break;
            case "-d":
            case "--disable":
                // NamespoofBモジュールを無効にする
                validFlagFound = true;
                if (!configuration.modules.namespoofB.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f名前偽装モジュールは既に無効である。`);
                } else {
                    configuration.modules.namespoofB.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4NamespoofB§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}namespoofb --help for command usage.`);
    }
}

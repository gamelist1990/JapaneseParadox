import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ScoreManager } from "../../classes/ScoreManager.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the removecb command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {number} commandblocksscore - The current score for the 'コマンドブロック' objective.
 * @param {boolean} setting - The status of the removecommandblocks custom command setting.
 */
function removeCBEHelp(player: Player, prefix: string, commandblocksscore: number, setting: boolean): void {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = commandblocksscore <= 0 ? "§6[§4無効§6]§f" : "§6[§a有効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `\nコマンド§4[§6 コマンド§4]§f: removecb`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}removecb [options]`,
        `§4[§6Description§4]§f：アンチコマンドブロックを切り替える（Booleanにするとすべてクリアされる）。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7アンチコマンドブロックモジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7アンチ・コマンド・ブロック・モジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7コマンドブロック対策モジュール§4を無効にする]§f`,
    ]);
}

/**
 * @name removecb
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function removecb(message: ChatSendAfterEvent, args: string[]): void {
    handleRemoveCB(message, args).catch((error) => {
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
 * Handles the removecb command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleRemoveCB(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/removeCommandBlocks.js:33)`);
    }

    const player: Player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
    }

    const commandblocksscore: number = ScoreManager.getScore("commandblocks", player);

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
                removeCBEHelp(player, prefix, commandblocksscore, configuration.customcommands.removecommandblocks);
                break;
            case "-s":
            case "--status":
                // アンチコマンドブロックモジュールの現在のステータスを表示
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Anti Command Blocks module is currently ${commandblocksscore <= 0 ? "§4無効" : "§aBoolean"}§f.`);
                break;
            case "-e":
            case "--enable":
                // アンチ・コマンド・ブロック・モジュールをBooleanにする
                validFlagFound = true;
                if (commandblocksscore <= 0) {
                    player.runCommand(`scoreboard players set paradox:config commandblocks 1`);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6Anti Command Blocks§f!`);
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fコマンドブロック対策モジュールが既にBoolean`);
                }
                break;
            case "-d":
            case "--disable":
                // アンチ・コマンド・ブロック・モジュールを無効にする
                validFlagFound = true;
                if (commandblocksscore <= 0) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fコマンドブロック対策モジュールは既に無効になっています。`);
                } else {
                    player.runCommand(`scoreboard players set paradox:config commandblocks 0`);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4Anti Command Blocks§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}removecb --help for command usage.`);
    }
}

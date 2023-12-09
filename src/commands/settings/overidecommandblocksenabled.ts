import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ScoreManager } from "../../classes/ScoreManager.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the overridecbe command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {number} cmdsscore - The current score for the 'cmds' objective.
 * @param {boolean} setting - The status of the overridecbe custom command setting.
 */
function overrideCBEHelp(player: Player, prefix: string, cmdsscore: number, setting: boolean): void {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = cmdsscore <= 0 ? "§6[§4無効§6]§f" : "§6[§a有効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `§6コマンド§4]§f: オーバーライド`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}overridecbe [options]`,
        `§4[§6Description§4]§f：commandblocksBoolean gamerule を常にBooleanまたは無効にする。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7CommandBlocksBooleanモジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7Enable CommandBlocksBoolean モジュール§4]§f`,
        `    -d, --disable`,
        `       §4[§7CommandBlocksBoolean モジュールを無効にする§4]§f`,
    ]);
}

/**
 * @name overridecbe
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function overridecbe(message: ChatSendAfterEvent, args: string[]) {
    handleOverrideCBE(message, args).catch((error) => {
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
 * Handles the overridecbe command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleOverrideCBE(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/overridecbe.js:7)`);
    }

    const player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
    }

    const cmdsscore = ScoreManager.getScore("cmds", player);

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
                overrideCBEHelp(player, prefix, cmdsscore, configuration.customcommands.overidecommandblocksenabled);
                break;
            case "-s":
            case "--status":
                // CommandBlocksBooleanモジュールの現在のステータスを表示する。
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f CommandBlocksBoolean module is currently ${cmdsscore <= 0 ? "§4無効" : "§aBoolean"}§f.`);
                break;
            case "-e":
            case "--enable":
                // CommandBlocksBooleanモジュールをBooleanにする
                validFlagFound = true;
                if (cmdsscore <= 0) {
                    player.runCommand(`scoreboard players set paradox:config cmds 1`);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has set CommandBlocksBoolean as §aBoolean§f!`);
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fCommandBlocksBooleanモジュールは既にBooleanです。`);
                }
                break;
            case "-d":
            case "--disable":
                // CommandBlocksBooleanモジュールを無効にする
                validFlagFound = true;
                if (cmdsscore <= 0) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fコマンドブロックBooleanモジュールが既に無効`);
                } else {
                    player.runCommand(`scoreboard players set paradox:config cmds 0`);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has set CommandBlocksBoolean as §4無効§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}overridecbe --help for command usage.`);
    }
}

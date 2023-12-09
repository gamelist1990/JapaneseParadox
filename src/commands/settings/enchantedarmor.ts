import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ScoreManager } from "../../classes/ScoreManager.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the EnchantedArmor command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {number} encharmorscore - The Enchanted Armor score for the player.
 * @param {boolean} setting - The status of the Enchanted Armor custom command setting.
 */
function enchantedArmorHelp(player: Player, prefix: string, encharmorscore: number, setting: boolean): void {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = encharmorscore > 0 ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `\n[魔法§4][§6コマンド§4]§f：エンチャントアーマー`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}enchantedarmor [options]`,
        `§4[§6Description§4]§f：すべてのプレイヤーのアンチエンチャントアーマーを切り替える。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7エンチャントアーマーモジュールの現在のステータスを表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7Enable Enchanted Armor モジュール§4]§f`,
        `    -d, --disable`,
        `       §4[§7エンチャント・アーマー・モジュール§4を無効にする]§f`,
    ]);
}

/**
 * Handles the EnchantedArmor command.
 * @name enchantedarmor
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function enchantedarmor(message: ChatSendAfterEvent, args: string[]) {
    handleEnchantedArmor(message, args).catch((error) => {
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
 * Handles the execution of the EnchantedArmor command.
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleEnchantedArmor(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/enchantedarmor.js:33)`);
    }

    const player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
    }

    const encharmorscore = ScoreManager.getScore("encharmor", player);

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
                return enchantedArmorHelp(player, prefix, encharmorscore, configuration.customcommands.enchantedarmor);
            case "-s":
            case "--status":
                // ハンドル状態フラグ
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Enchanted Armor module is currently ${encharmorscore > 0 ? "Boolean" : "無効"}`);
                break;
            case "-e":
            case "--enable":
                // ハンドルイネーブルフラグ
                validFlagFound = true;
                if (encharmorscore > 0) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fエンチャントアーマーモジュールは既にBooleanである。`);
                } else {
                    player.runCommand(`scoreboard players set paradox:config encharmor 1`);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6Anti Enchanted Armor§f!`);
                }
                break;
            case "-d":
            case "--disable":
                // ハンドル無効フラグ
                validFlagFound = true;
                if (encharmorscore <= 0) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fエンチャント・アーマー・モジュールは既に無効になっている。`);
                } else {
                    player.runCommand(`scoreboard players set paradox:config encharmor 0`);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4Anti Enchanted Armor§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        // 追加の引数はありません。
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}enchantedarmor --help for more information.`);
        return;
    }

    return player.runCommand(`scoreboard players operation @a encharmor = paradox:config encharmor`);
}

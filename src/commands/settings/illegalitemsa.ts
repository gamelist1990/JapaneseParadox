import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { IllegalItemsA } from "../../penrose/TickEvent/illegalitems/illegalitems_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the illegalitemsA command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} illegalItemsABoolean - The status of the illegalItemsA module.
 * @param {boolean} setting - The status of the illegalItemsA custom command setting.
 */
function illegalItemsAHelp(player: Player, prefix: string, illegalItemsABoolean: boolean, setting: boolean): void {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = illegalItemsABoolean ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `§n§o§4[§6コマンド§4]§f: 不正項目`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}illegalitemsa [options]`,
        `§4[§6Description§4]§f：インベントリに不正なアイテムを持っているプレイヤーのチェックをトグルする。`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7IllegalItemsAモジュールの現在の状態を表示する§4]§f`,
        `    -e, --enable`,
        `       §4[§7IllegalItemsAモジュールをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7IllegalItemsAモジュールを無効にする§4]§f`,
    ]);
}

/**
 * Handles the illegalitemsA command.
 * @name illegalitemsA
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function illegalitemsA(message: ChatSendAfterEvent, args: string[]) {
    handleIllegalItemsA(message, args).catch((error) => {
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
 * Handles the execution of the illegalitemsA command.
 * @param {ChatSendAfterEvent} message - The message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleIllegalItemsA(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + `Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/illegalitemsa.js:36)`);
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
                return illegalItemsAHelp(player, prefix, configuration.modules.illegalitemsA.enabled, configuration.customcommands.illegalitemsa);
            case "-s":
            case "--status":
                // ハンドル状態フラグ
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f IllegalItemsA module is currently ${configuration.modules.illegalitemsA.enabled ? "有効" : "無効"}`);
                break;
            case "-e":
            case "--enable":
                // ハンドルイネーブルフラグ
                validFlagFound = true;
                if (configuration.modules.illegalitemsA.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f IllegalItemsA モジュールが既にBooleanになっている。`);
                } else {
                    configuration.modules.illegalitemsA.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    const nohasTag = world.getPlayers({ excludeTags: ["illegalitemsA"] });
                    for (const temp of nohasTag) {
                        temp.addTag("illegalitemsA");
                    }
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6IllegalItemsA§f!`);
                    IllegalItemsA();
                }
                break;
            case "-d":
            case "--disable":
                // ハンドル無効フラグ
                validFlagFound = true;
                if (!configuration.modules.illegalitemsA.enabled) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f IllegalItemsA モジュールは既に無効になっている。`);
                } else {
                    configuration.modules.illegalitemsA.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    const hasTag = world.getPlayers({ tags: ["illegalitemsA"] });
                    for (const temp of hasTag) {
                        temp.removeTag("illegalitemsA");
                    }
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4IllegalItemsA§f!`);
                }
                break;
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}illegalitemsa --help for more information.`);
    }
}

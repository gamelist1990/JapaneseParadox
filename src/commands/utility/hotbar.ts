import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { Hotbar } from "../../penrose/TickEvent/hotbar/hotbar.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

const configMessageBackup = new WeakMap();
// ダミーオブジェクト
const dummy: object = [];

function hotbarHelp(player: Player, prefix: string, hotbarBoolean: boolean, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    let moduleStatus: string;
    if (hotbarBoolean === false) {
        moduleStatus = "§6[§4無効§6]§f";
    } else {
        moduleStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `§n§o§4[§6コマンド§4]§f: ホットバー`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6使用§4]§f: ホットバー [オプション］`,
        `§4[§6オプション§4]§f：メッセージ、無効、ヘルプ`,
        `§4[§6解説§4]§f：現在オンラインになっているすべてのプレイヤーのホットバーメッセージを表示する。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}hotbar`,
        `        §4- §6現在のホットバーメッセージを表示する§f`,
        `    ${prefix}hotbar disable`,
        `        §4- §6ホットバーメッセージを無効にする§f`,
        `    ${prefix}hotbar Anarchy Server | Realm Code: 34fhf843`,
        `        §4- §6ホットバーのメッセージを「Anarchy Server | Realm Code：34fhf843"§f`,
        `    ${prefix}hotbar help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name hotbar
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function hotbar(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/utility/hotbar.js:37)");
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

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.hotbar) {
        return hotbarHelp(player, prefix, configuration.modules.hotbar.enabled, configuration.customcommands.hotbar);
    }

    /**
     * Backup original message from config (initial usage only)
     *
     * Reload server to reset this in memory
     */
    if (configMessageBackup.has(dummy) === false) {
        configMessageBackup.set(dummy, configuration.modules.hotbar.message);
    }

    if ((configuration.modules.hotbar.enabled === false && !args.length) || (configuration.modules.hotbar.enabled === false && args[0].toLowerCase() !== "disable")) {
        // 許可する
        configuration.modules.hotbar.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        if (args.length >= 1) {
            configuration.modules.hotbar.message = args.join(" ");
        } else {
            configuration.modules.hotbar.message = configMessageBackup.get(dummy);
        }
        sendMsg("@a[tag=paradoxOpped]", `§7${player.name}§f 以下の機能が有効です=> §6Hotbar`);
        Hotbar();
    } else if (configuration.modules.hotbar.enabled === true && args.length === 1 && args[0].toLowerCase() === "disable") {
        // 拒否する
        configuration.modules.hotbar.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§7${player.name}§f は無効 §6Hotbar`);
    } else if ((configuration.modules.hotbar.enabled === true && args.length >= 1) || (configuration.modules.hotbar.enabled === true && !args.length)) {
        if (args.length >= 1) {
            configuration.modules.hotbar.message = args.join(" ");
        } else {
            configuration.modules.hotbar.message = configMessageBackup.get(dummy);
        }
        sendMsg("@a[tag=paradoxOpped]", `§7${player.name}§f has updated §6Hotbar`);
    } else {
        return hotbarHelp(player, prefix, configuration.modules.hotbar.enabled, configuration.customcommands.hotbar);
    }
}

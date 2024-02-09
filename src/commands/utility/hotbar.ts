import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { Hotbar } from "../../penrose/TickEvent/hotbar/hotbar.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

const configMessageBackup = new WeakMap();
// Dummy object
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
        `\n§o§4[§6コマンド§4]§f: hotbar`,
        `§4[§6ステータス§4]§f: ${commandStatus}`,
        `§4[§6モジュール§4]§f: ${moduleStatus}`,
        `§4[§6使用法§4]§f: hotbar [optional]`,
        `§4[§6Optional§4]§f: message, disable, help`,
        `§4[§6説明§4]§f: Displays a hotbar message for all player's currently online.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}hotbar`,
        `        §4- §6Display the current hotbar message§f`,
        `    ${prefix}hotbar disable`,
        `        §4- §6Disable the hotbar message§f`,
        `    ${prefix}hotbar Anarchy Server | Realm Code: 34fhf843`,
        `        §4- §6Set the hotbar message to "Anarchy Server | Realm Code: 34fhf843"§f`,
        `    ${prefix}hotbar help`,
        `        §4- §6Show command help§f`,
    ]);
}

/**
 * @name hotbar
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function hotbar(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "エラー: ${message} が定義されていません。渡すのを忘れましたか? (./commands/utility/hotbar.js:37)");
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(
            player,
            `§f§4[§6Paradox§4]§f このコマンドを使用するには、管理者にしか使えません
`
        );
    }

    // Get Dynamic Property Boolean
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Was help requested
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
        // Allow
        configuration.modules.hotbar.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        if (args.length >= 1) {
            configuration.modules.hotbar.message = args.join(" ");
        } else {
            configuration.modules.hotbar.message = configMessageBackup.get(dummy);
        }
        sendMsg("@a[tag=paradoxOpped]", `§7${player.name}§f 有効になりました: §6Hotbar`);
        Hotbar();
    } else if (configuration.modules.hotbar.enabled === true && args.length === 1 && args[0].toLowerCase() === "disable") {
        // Deny
        configuration.modules.hotbar.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§7${player.name}§f 無効にしました: §6Hotbar`);
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

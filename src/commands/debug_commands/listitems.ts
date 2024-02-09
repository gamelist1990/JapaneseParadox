import { ChatSendAfterEvent, ItemStack, Player, world } from "@minecraft/server";
import { MinecraftItemTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import { WorldExtended } from "../../classes/WorldExtended/World";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry";
import ConfigInterface from "../../interfaces/Config";

function listItems(player: Player, prefix: string, debug: boolean) {
    let commandStatus: string;
    if (!debug) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: listitems`,
        `§4[§6ステータス§4]§f: ${commandStatus}`,
        `§4[§6使用法§4]§f: listitems [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6説明§4]§f: Prints every item in the game and their max stack.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}listitems`,
        `    ${prefix}listitems help`,
    ]);
}

/**
 * @name listitems
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function listitems(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "エラー: ${message} が定義されていません。渡すのを忘れましたか? (./commands/debug_commands/listitems.js:30)");
    }

    const player = message.sender;

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Check for hash/salt and validate password
    const hash = player.getDynamicProperty("hash");
    const salt = player.getDynamicProperty("salt");

    // Use either the operator's ID or the encryption password as the key
    const key = configuration.encryption.password ? configuration.encryption.password : player.id;

    // Generate the hash
    const encode = (world as WorldExtended).hashWithSalt(salt as string, key);
    // Make sure the user has permissions to run the command
    if (!encode || hash === undefined || encode !== hash) {
        return sendMsgToPlayer(
            player,
            `§f§4[§6Paradox§4]§f このコマンドを使用するには、管理者にしか使えません
`
        );
    }

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.debug) {
        return listItems(player, prefix, configuration.debug);
    }

    for (const item in MinecraftItemTypes) {
        const itemInfo = new ItemStack(MinecraftItemTypes[item as keyof typeof MinecraftItemTypes]);
        console.log("'" + itemInfo.typeId + "': " + itemInfo.maxAmount + ",");
    }
    sendMsgToPlayer(player, "§f§4[§6Paradox§4]§f リストが完成しました。コンソールログを確認してください。");
}

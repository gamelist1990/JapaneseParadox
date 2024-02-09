import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

function ecWipeHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: ecwipe`,
        `§4[§6ステータス§4]§f: ${commandStatus}`,
        `§4[§6使用法§4]§f: ecwipe [optional]`,
        `§4[§6Optional§4]§f: username, help`,
        `§4[§6説明§4]§f: Will wipe out player's entire ender chest.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}ecwipe ${player.name}`,
        `        §4- §6Wipe out the entire ender chest of ${player.name}§f`,
        `    ${prefix}ecwipe help`,
        `        §4- §6Show command help§f`,
    ]);
}

/**
 * @name ecwipe
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided.
 */
export function ecwipe(message: ChatSendAfterEvent, args: string[]) {
    handleECWipe(message, args).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // Extract stack trace information
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });
}

async function handleECWipe(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "エラー: ${message} が定義されていません。渡すのを忘れましたか? (./commands/utility/ecwipe.js:29)");
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

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Are there arguements
    if (!args.length) {
        return ecWipeHelp(player, prefix, configuration.customcommands.ecwipe);
    }

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.ecwipe) {
        return ecWipeHelp(player, prefix, configuration.customcommands.ecwipe);
    }

    // try to find the player requested
    let member: Player;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    if (!member) {
        return sendMsgToPlayer(
            player,
            `§f§4[§6Paradox§4]§f そのプレーヤーが見つかりませんでした!
`
        );
    }

    // There are 30 slots ranging from 0 to 29
    for (let slot = 0; slot < 30; slot++) {
        member.runCommand(`replaceitem entity @s slot.enderchest ${slot} air`);
    }
    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Wiped §7${member.name}'s§f enderchest!`);
}

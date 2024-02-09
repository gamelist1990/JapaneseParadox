import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer, sendMsg } from "../../util.js";
import { PlayerExtended } from "../../classes/PlayerExtended/Player.js";
import ConfigInterface from "../../interfaces/Config.js";

function rankHelp(player: Player, prefix: string, configuration: ConfigInterface) {
    let commandStatus: string;
    if (!configuration.customcommands.rank || !configuration.customcommands.chatranks) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    let moduleStatus: string;
    if (configuration.modules.chatranks.enabled === false || !configuration.customcommands.chatranks) {
        moduleStatus = "§6[§4無効§6]§f";
    } else {
        moduleStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: rank`,
        `§4[§6ステータス§4]§f: ${commandStatus}`,
        `§4[§6モジュール§4]§f: ${moduleStatus}`,
        `§4[§6使用法§4]§f: rank <username> [optional]`,
        `§4[§6Optional§4]§f: tag, tag--tag, reset, help`,
        `§4[§6説明§4]§f: Gives one or more ranks to a specified player or resets it.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}rank ${player.name} {Admin}`,
        `        §4- §6Give the "Admin" rank to the specified player§f`,
        `    ${prefix}rank ${player.name} [Contributor]--{Mod}`,
        `        §4- §6Give the "Contributor" and "Mod" ranks to the specified player§f`,
        `    ${prefix}rank ${player.name} (Staff)--Mod--[Helper]`,
        `        §4- §6Give the "Staff", "Mod", and "Helper" rank to the specified player§f`,
        `    ${prefix}rank reset ${player.name}`,
        `        §4- §6Reset all ranks of the specified player§f`,
        `    ${prefix}rank help`,
        `        §4- §6Show command help§f`,
    ]);
}

/**
 * @name rank
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function rank(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "エラー: ${message} が定義されていません。渡すのを忘れましたか? (./utility/rank.js:37)");
    }

    const player = message.sender;

    // fixes a bug that kills !tag when using custom names
    player.nameTag = player.name;

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

    // Are there arguements
    if (!args.length) {
        return rankHelp(player, prefix, configuration);
    }

    // Was help requested
    const argCheck = args[0].toLowerCase();
    if (argCheck === "help" || !configuration.customcommands.rank || !configuration.modules.chatranks.enabled || !configuration.customcommands.chatranks) {
        return rankHelp(player, prefix, configuration);
    }

    const playerName = args.slice(0, -1).join(" "); // Combine all arguments except the last one as the player name
    const rank = args[args.length - 1]; // Last argument is the rank

    // Check if the rank argument starts or ends with a hyphen
    if (rank.startsWith("-") || rank.endsWith("-")) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f The rank cannot start or end with a hyphen.`);
    }

    // try to find the player requested
    let member: Player;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(playerName.toLowerCase().replace(/"|\\|@/g, ""))) {
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

    // check if array contains the string 'reset'
    const argcheck = args[1]?.toLowerCase() || undefined;

    // reset rank
    if (argcheck === "reset") {
        (member as PlayerExtended).resetTag();
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${member.name}§f has reset their rank`);
        return;
    }

    // Add new rank if command is utilize correctly
    if (args.length >= 2) {
        const newRank = "Rank:" + rank;
        (member as PlayerExtended).resetTag();
        member.addTag(newRank);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${member.name}§f has reset their rank`);
    } else {
        return rankHelp(player, prefix, configuration);
    }

    if (player === member) {
        return sendMsg("@a[tag=paradoxOpped]", `§7${player.name}§f has changed their rank`);
    }

    sendMsg("@a[tag=paradoxOpped]", `§7${player.name}§f has changed §7${member.name}'s§f rank!`);
}

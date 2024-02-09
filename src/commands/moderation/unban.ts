import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

export const queueUnban = new Set<string>();

function listQueue(queued: Set<string>, player: Player) {
    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Queued to be unbanned:`);
    const setSize = queued.size;
    if (setSize > 0) {
        queued.forEach((queue: string) =>
            // List the players that are queued to be unbanned
            sendMsgToPlayer(player, ` §o§6|§f §4[§f${queue}§4]§f`)
        );
    } else {
        sendMsgToPlayer(player, ` §o§6|§f §4[§fList Is Empty§4]§f`);
    }
}

function unbanHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4DISABLED§6]§f";
    } else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: unban`,
        `§4[§6ステータス§4]§f: ${commandStatus}`,
        `§4[§6使用法§4]§f: unban [オプション]`,
        `§4[§6オプション§4]§f: ユーザー名, ヘルプ, リスト, 削除`,
        `§4[§6説明§4]§f: 指定したプレイヤーがBANされている場合に参加できるようにします（グローバルBANは含まれません）。`,
        `§4[§6例§4]§f:`,
        `    ${prefix}unban ${player.name}`,
        `        §4- §6${player.name}がBANされている場合でも参加できるようにする§f`,
        `    ${prefix}unban list`,
        `        §4- §6BAN解除待ちのプレイヤーリストを表示§f`,
        `    ${prefix}unban delete <username>`,
        `        §4- §6プレイヤーをBAN解除待ちリストから削除§f`,
        `    ${prefix}unban help`,
        `        §4- §6コマンドのヘルプを表示§f`,
    ]);
}

export function unban(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | エラー: ${message} が定義されていません。渡すのを忘れましたか? (./commands/moderation/unban.js:35)`);
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f このコマンドを使用するには、逆説である必要があります.`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Are there arguments
    if (!args.length) {
        return unbanHelp(player, prefix, configuration.customcommands.unban);
    }

    // Was help requested
    const argCheck = args[0];
    if (argCheck && args[0].toLowerCase() === "help") {
        return unbanHelp(player, prefix, configuration.customcommands.unban);
    }

    // List the queue if requested
    if (argCheck && args[0].toLowerCase() === "list") {
        return listQueue(queueUnban, player);
    }

    // Delete player from the queue if requested
    if (argCheck && args[0].toLowerCase() === "delete") {
        const nameToDelete = args.slice(1).join(" ");
        if (queueUnban.delete(nameToDelete)) {
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${nameToDelete}§f が禁止解除キューから削除されました!`);
        } else {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f §7${nameToDelete}§f が禁止解除キューにありません!`);
        }
        return;
    }

    // Extract the username from the command and perform the unban action
    let username = args.join(" ");
    if (username.startsWith('"') && username.endsWith('"')) {
        username = username.slice(1, -1);
    }

    queueUnban.add(username);
    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 禁止解除待ちのプレイヤー: §7${username}§f`);
}

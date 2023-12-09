import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

export const queueUnban = new Set<string>();

function listQueue(queued: Set<string>, player: Player) {
    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 禁止解除のためにキューに入れられた：`);
    const setSize = queued.size;
    if (setSize > 0) {
        queued.forEach((queue: string) =>
            // 出禁解除待ちの選手をリストアップする。
            sendMsgToPlayer(player, ` §o§6|§f §4[§f${queue}§4]§f`)
        );
    } else {
        sendMsgToPlayer(player, `§o§6|§f §4[§fList Is Empty§4]§f`);
    }
}

function unbanHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\nコマンド§4[§6 コマンド§4]§f: 禁止解除`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: unban [オプション].`,
        `§4[§6オプション§4]§f：ユーザー名、ヘルプ、リスト、削除`,
        `§4[§6Description§4]§f：BANされても指定したプレイヤーの参加を許可する(グローバルBANは含まれない)。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}unban ${player.name}`,
        `        §4- §6Allow ${player.name} to join if banned§f`,
        `    ${prefix}unban list`,
        `        §4- §6BAN 解除待ちプレイヤーリスト§f`,
        `    ${prefix}unban delete <username>`,
        `        §4- §6 アンバンのキューからプレイヤーを取り除く§f`,
        `    ${prefix}unban help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

export function unban(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | Error: ${message} isn't defined. Did you forget to pass it? (./commands/moderation/unban.js:35)`);
    }

    const player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    // 反論はあるか？
    if (!args.length) {
        return unbanHelp(player, prefix, configuration.customcommands.unban);
    }

    // 助けを求められたか
    const argCheck = args[0];
    if (argCheck && args[0].toLowerCase() === "help") {
        return unbanHelp(player, prefix, configuration.customcommands.unban);
    }

    // 要求があれば、キューをリストアップする
    if (argCheck && args[0].toLowerCase() === "list") {
        return listQueue(queueUnban, player);
    }

    // 要求があれば、プレーヤーをキューから削除する。
    if (argCheck && args[0].toLowerCase() === "delete") {
        const nameToDelete = args.slice(1).join(" ");
        if (queueUnban.delete(nameToDelete)) {
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${nameToDelete}§f Unbanから削除されました！`);
        } else {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f §7${nameToDelete}§f はUnbanに存在しません！`);
        }
        return;
    }

    // コマンドからユーザー名を取り出し、アンバンアクションを実行する。
    let username = args.join(" ");
    if (username.startsWith('"') && username.endsWith('"')) {
        username = username.slice(1, -1);
    }

    queueUnban.add(username);
    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Unban待ちのプレイヤー：§7${username}§f`);
}

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
        `\n§o§4[§6コマンド§4]§f：ランク`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ランク <ユーザー名> [オプション].`,
        `§4[§6オプション§4]§f: タグ、タグ--タグ、リセット、ヘルプ`,
        `§4[§6 解説§4]§f：指定されたプレイヤーに1つ以上のランクを与えるか、リセッ トする。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}rank ${player.name} {Admin}`,
        `        §4- §6指定されたプレイヤーに「管理者」ランクを与える§f`,
        `    ${prefix}rank ${player.name} [Contributor]--{Mod}`,
        `        §4- §6指定されたプレイヤーに「貢献者」と「改造者」ランクを与える§f`,
        `    ${prefix}rank ${player.name} (Staff)--Mod--[Helper]`,
        `        §4- §6指定されたプレイヤーに「スタッフ」「モッド」「ヘルパー」ランクを 与える§f`,
        `    ${prefix}rank reset ${player.name}`,
        `        §4-§6指定したプレイヤーの全てのランクをリセットする§f`,
        `    ${prefix}rank help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name rank
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function rank(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./utility/rank.js:37)");
    }

    const player = message.sender;

    // カスタム・ネーム使用時に!tagが消滅するバグを修正。
    player.nameTag = player.name;

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

    // 反論はあるか
    if (!args.length) {
        return rankHelp(player, prefix, configuration);
    }

    // 助けを求められたか
    const argCheck = args[0].toLowerCase();
    if (argCheck === "help" || !configuration.customcommands.rank || !configuration.modules.chatranks.enabled || !configuration.customcommands.chatranks) {
        return rankHelp(player, prefix, configuration);
    }

    const playerName = args.slice(0, -1).join(" "); // Combine all arguments except the last one as the player name
    const rank = args[args.length - 1]; // Last argument is the rank

    // 引数rankがハイフンで始まるか終わるかをチェックする。
    if (rank.startsWith("-") || rank.endsWith("-")) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 階級はハイフンで始まることも終わることもできない。`);
    }

    // リクエストされた選手を探す
    let member: Player;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(playerName.toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f その選手は見つからなかった！`);
    }

    // 配列に文字列'リセット'が含まれているかチェックする。
    const argcheck = args[1]?.toLowerCase() || undefined;

    // リセットランク
    if (argcheck === "reset") {
        (member as PlayerExtended).resetTag();
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${member.name}§f has reset their rank`);
        return;
    }

    // コマンドが正しく利用されていれば、新しいランクを追加する
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

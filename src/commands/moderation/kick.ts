import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

function kickHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f。";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: kick`,
        `§4[§6ステータス§4]§f: ${commandStatus}.`,
        `§4[§6使用§4]§f: キック [オプション].`,
        `§4[§6Optional§4]§f: username, reason, help`,
        `§4[§6説明§4]§f：指定されたユーザをキックし、オプションで理由を与える。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}kick ${player.name}`,
        `        §4- §6Kick ${player.name} without specifying a reason§f`,
        `    ${prefix}kick ${player.name} Hacker!`,
        `        §4- §6Kick ${player.name} with the reason "Hacker!"§f`,
        `    ${prefix}kick ${player.name} Stop trolling!`,
        `        §4- §6Kick ${player.name} with the reason "Stop trolling!"§f`,
        `    ${prefix}kick help`,
        `        §4- §6Show command help§f`,
    ]);
}

/**
 * @name kick
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function kick(message: ChatSendAfterEvent, args: string[]) {
    handleKick(message, args).catch((error) => {
        console.error("Paradoxの未処理拒否：", error);
        // スタックトレース情報の抽出
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("エラーの原因", sourceInfo[0]);
            }
        }
    });
}

async function handleKick(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`新しい日付()}。|` + "エラー: ${message} が定義されていません。渡し忘れですか？(./commands/moderation/kick.js:33)");
    }

    const player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(
            player,
            `§f§4[§6Paradox§4]§f このコマンドを使用するには、管理者にしか使えません
`
        );
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.kick) {
        return kickHelp(player, prefix, configuration.customcommands.kick);
    }

    // 反論はあるか
    if (!args.length) {
        return kickHelp(player, prefix, configuration.customcommands.kick);
    }

    // 引数処理の変更
    let playerName = args.shift();
    let reason = "理由なし";

    // コマンドに理由があるかチェックする
    if (args.length > 1) {
        // 理由がある場合はダブルクォートを外す
        reason = args
            .slice(1)
            .join(" ")
            .replace(/(^"|"$)/g, "");
    }

    // 選手名にダブルクォーテーションがある場合は、それを削除する。
    playerName = playerName.replace(/(^"|"$)/g, "");

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

    // 自分たちで蹴らないようにする
    if (member === player) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 自分を蹴ることはできない。`);
    }
    player.runCommandAsync(`kick "${member.name}" §f\n\n${reason}`).catch((error) => {
        console.warn(`新しい日付()}。|` + error);
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f その選手を蹴ることができなかった．`);
    });
    return sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f が §7${member.name}§f を蹴った。理由: §7${reason}§f`);
}

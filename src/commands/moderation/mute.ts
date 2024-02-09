import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

function muteHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f。";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: mute`,
        `§4[§6ステータス§4]§f: ${commandStatus}.`,
        `§4[§6使用§4]§f: ミュート [オプション］`,
        `§4[§6Optional§4]§f: mute, reason, help`,
        `§4[§6説明§4]§f：指定されたユーザをミュートし、オプションで理由を与える。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}mute ${player.name}`,
        `        §4- §6Mute ${player.name} without specifying a reason§f`,
        `    ${prefix}mute ${player.name} Stop spamming!`,
        `        §4- §6Mute ${player.name} with the reason "Stop spamming!"§f`,
        `    ${prefix}mute help`,
        `        §4- §6Show command help§f`,
    ]);
}

/**
 * @name mute
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function mute(message: ChatSendAfterEvent, args: string[]) {
    handleMute(message, args).catch((error) => {
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

async function handleMute(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`新しい日付()}。|` + "エラー: ${message} が定義されていません。渡し忘れですか？./commands/moderation/mute.js:30)");
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
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.mute) {
        return muteHelp(player, prefix, configuration.customcommands.mute);
    }

    // 反論はあるか
    if (!args.length) {
        return muteHelp(player, prefix, configuration.customcommands.mute);
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

    // ユニークIDの取得
    const uniqueId2 = dynamicPropertyRegistry.getProperty(member, member?.id);

    // 自分たちがミュートにならないようにする
    if (uniqueId2 === uniqueId) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 自分自身を無言にすることはできない。`);
    }

    // スタッフがミュートしないようにする
    if (uniqueId2 === member.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fスタッフプレイヤーをミュートすることはできません。`);
    }

    // まだミュートされていなければ、タグを付ける
    if (!member.hasTag("isMuted")) {
        member.addTag("isMuted");
    } else {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのプレイヤーは既にミュートされている。`);
    }
    // エデュケーション・エディションが有効であれば、合法的にミュートする。
    member.runCommandAsync(`ability @s mute true`);
    sendMsgToPlayer(member, `§f§4[§6Paradox§4]§f ミュートされています。理由: §7${reason}§f`);
    return sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f が §7${member.name}§f をミュートしました。理由: §7${reason}§f`);
}

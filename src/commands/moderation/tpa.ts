import { world, Player, ChatSendAfterEvent } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer, setTimer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

function tpaHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f。";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: tpa`,
        `§4[§6ステータス§4]§f: ${commandStatus}.`,
        `§4[§6使用§4]§f: tpa [オプション］`,
        `§4[§6Optional§4]§f: username, help`,
        `§4[§6解説§4]§f：プレイヤーにテレポートする。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}tpa ${player.name} Steve`,
        `        §4- §6Steve から ${player.name} へのテレポートをリクエスト§f`,
        `    ${prefix}tpa Steve ${player.name}`,
        `        §4- §6スティーブを ${player.name} にテレポートするようリクエスト§f`,
        `    ${prefix}tpa help`,
        `        §4- §6Show command help§f`,
    ]);
}

/**
 * @name tpa
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function tpa(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`新しい日付()}。|` + "エラー: ${message} が定義されていません。渡し忘れですか？(./commands/moderation/tpa.js:31)");
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
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.tpa) {
        return tpaHelp(player, prefix, configuration.customcommands.tpa);
    }

    // 反論はあるか
    if (!args.length) {
        return tpaHelp(player, prefix, configuration.customcommands.tpa);
    }

    let artificalPlayer: Player;
    let member: Player;

    // 要求された選手を見つけよう
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
            artificalPlayer = pl;
        }
        if (pl.name.toLowerCase().includes(args[1].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
        }
        if (artificalPlayer && member) {
            break;
        }
    }
    // オンラインですか？
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f そのプレイヤーが見つかりませんでした!詳細については、「§7${prefix}tpa help§f」を試してください。`);
    }

    // テレポートが相手側にあるか、またはその逆かをチェックし、設定する。
    if (args[0] && args[1]) {
        // その選手のところにテレポートしよう
        setTimer(artificalPlayer.id);
        artificalPlayer.teleport(member.location, {
            dimension: member.dimension,
            rotation: { x: 0, y: 0 },
            facingLocation: { x: 0, y: 0, z: 0 },
            checkForBlocks: true,
            keepVelocity: false,
        });
        // テレポートしたことを知らせる
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f §7${artificalPlayer.name}§f を §7${member.name}§f にテレポートしました`);
    } else {
        // 誰を指定する必要がある
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fテレポートの「from」と「who」を忘れている。`);
        return tpaHelp(player, prefix, configuration.customcommands.tpa);
    }
}

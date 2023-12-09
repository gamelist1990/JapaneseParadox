import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import ConfigInterface from "../../interfaces/Config.js";

function deopHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `§n§o§4[§6コマンド§4]§f: デオプ`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f: デオプ [オプション］`,
        `§4[§6オプション§4]§f: ユーザー名、ヘルプ`,
        `§4[§6解説§4]§f：Paradox AntiCheat 機能の使用許可を取り消す。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}deop ${player.name}`,
        `        §4-§6Paradox・オプの許可をプレイヤーから剥奪する§f`,
        `    ${prefix}deop help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name deop
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function deop(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/op.js:30)");
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

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.deop) {
        return deopHelp(player, prefix, configuration.customcommands.deop);
    }

    // 反論はあるか
    if (!args.length) {
        return deopHelp(player, prefix, configuration.customcommands.deop);
    }

    // リクエストされた選手を探す
    let member: Player;
    if (args.length) {
        const targetPlayerName = args.join(" "); // Combine all arguments into a single string
        const players = world.getPlayers();
        for (const pl of players) {
            if (pl.name.toLowerCase().includes(targetPlayerName.toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
                break;
            }
        }
    }

    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f その選手は見つからなかった！`);
    }

    // メンバーからのハッシュ/ソルトのチェックとパスワードの検証
    const memberHash = member.getDynamicProperty("hash");
    const memberSalt = member.getDynamicProperty("salt");

    // オペレーターのIDまたは暗号化パスワードのいずれかをキーとして使用する。
    const memberKey = configuration.encryption.password ? configuration.encryption.password : member.id;

    // ハッシュを生成する
    const memberEncode = (world as WorldExtended).hashWithSalt(memberSalt as string, memberKey);

    if (memberEncode && memberHash !== undefined && memberHash === memberEncode) {
        member.setDynamicProperty("hash");
        member.setDynamicProperty("salt");
        member.removeTag("paradoxOpped");
        dynamicPropertyRegistry.deleteProperty(member, member.id);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${member.name}§fはもうParadox-Oppedではありません。`);
        return sendMsgToPlayer(member, `§f§4[§6Paradox§4]§fあなたのOPステータスは取り消されました！`);
    }
    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f §7${member.name}§fはParadoxを使用する許可がありませんでした。`);
}

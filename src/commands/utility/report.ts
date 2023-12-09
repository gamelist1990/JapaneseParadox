import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

function reportHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f：レポート`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f：報告 [任意］`,
        `§4[§6オプション§4]§f: ユーザー名、理由、ヘルプ`,
        `§4[§6解説§4]§f：f:悪質な行為を行ったプレイヤーをオンラインスタッフに報告する。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}report ${player.name}`,
        `        §4- §6Report ${player.name} to online Staff§f`,
        `    ${prefix}report ${player.name} Caught hacking!`,
        `        §4- §6Report ${player.name} for hacking with a reason§f`,
        `    ${prefix}report help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name report
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function report(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/moderation/ban.js:29)");
    }

    const player = message.sender;
    const reason = args.slice(1).join(" ") || "No reason specified";

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // 反論はあるか
    if (!args.length) {
        return reportHelp(player, prefix, configuration.customcommands.report);
    }

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.report) {
        return reportHelp(player, prefix, configuration.customcommands.report);
    }

    // 要求された選手を見つけよう
    let member: Player;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    if (!member) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f !報告 <プレイヤー> <理由>§f`);
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f その選手は見つからなかった！`);
    }

    // 彼らが自分自身を報告しないようにする
    if (member === player) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 自己申告はできない。`);
    }

    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Reported §7${member.name}§f with reason: §7${reason}§f`);

    sendMsg("@a[tag=notify]", `§f§4[§6Paradox§4]§f §7${player.name}§f has reported §7${member.name}§f with reason: §7${reason}§f`);
}

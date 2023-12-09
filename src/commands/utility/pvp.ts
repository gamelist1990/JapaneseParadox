import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";

function pvpHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n[コマンド§4]§f: pvp`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f：PvP【オプション`,
        `§4[§6オプション§4]§f：Boolean、無効、ヘルプ`,
        `§4[§6Description§4]§f：PVPのBoolean/無効。無効の間は他のプレイヤーに攻撃されてもダメージを受けません。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}pvp enable`,
        `        §4- §6 PVPドライバー§f`,
        `    ${prefix}pvp disable`,
        `        §4-§6PVPを無効にする§f`,
        `    ${prefix}pvp help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name pvp
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function pvp(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/utility/pvp.js:26)");
    }

    const player = message.sender;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // 反論はあるか
    if (!args.length) {
        return pvpHelp(player, prefix, configuration.customcommands.pvp);
    }

    // 助けを求められたか
    const argCheck = args[0];
    if (argCheck && (args[0].toLowerCase() === "help" || !configuration.customcommands.pvp)) {
        return pvpHelp(player, prefix, configuration.customcommands.pvp);
    }
    if (argCheck && args[0].toLowerCase() === "enable") {
        player.removeTag("pvp無効");
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたは§2PVPをBooleanにしている。`);
    }
    if (argCheck && args[0].toLowerCase() === "disable") {
        player.addTag("pvp無効");
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたは§4PVPを無効にしている。`);
    }
}

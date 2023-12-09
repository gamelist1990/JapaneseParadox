import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

function ecWipeHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n[コマンド§4[§6コマンド§4]§f：ワイプ`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f: ecwipe [オプション］`,
        `§4[§6オプション§4]§f: ユーザー名、ヘルプ`,
        `§4[§6Description§4]§f：プレイヤーのエンダーチェストをすべて消し去る。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}ecwipe ${player.name}`,
        `        §4- §6Wipe out the entire ender chest of ${player.name}§f`,
        `    ${prefix}ecwipe help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name ecwipe
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided.
 */
export function ecwipe(message: ChatSendAfterEvent, args: string[]) {
    handleECWipe(message, args).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // スタックトレース情報の抽出
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });
}

async function handleECWipe(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/utility/ecwipe.js:29)");
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

    // 反論はあるか
    if (!args.length) {
        return ecWipeHelp(player, prefix, configuration.customcommands.ecwipe);
    }

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.ecwipe) {
        return ecWipeHelp(player, prefix, configuration.customcommands.ecwipe);
    }

    // リクエストされた選手を探す
    let member: Player;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f その選手は見つからなかった！`);
    }

    // 0から29までの30個のスロットがある。
    for (let slot = 0; slot < 30; slot++) {
        member.runCommand(`replaceitem entity @s slot.enderchest ${slot} air`);
    }
    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Wiped §7${member.name}'s§f enderchest!`);
}

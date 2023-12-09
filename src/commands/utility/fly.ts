import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

function flyHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f：フライ`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f：フライ［オプション］`,
        `§4[§6オプション§4]§f: ユーザー名、ヘルプ`,
        `§4[§6説明§4]§f．プレイヤーに飛行能力を与える。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}fly ${player.name}`,
        `        §4- §6Grant the ability to fly to ${player.name}§f`,
        `    ${prefix}fly help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

function mayflydisable(player: Player, member: Player) {
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 fly mode for ${player === member ? "themselves" : "§7" + member.name}.`);
}

function mayflyenable(player: Player, member: Player) {
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> fly mode for ${player === member ? "themselves" : "§7" + member.name}.`);
}

/**
 * @name fly
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - (Optional) Additional arguments provided (optional).
 */
export function fly(message: ChatSendAfterEvent, args: string[]) {
    handleFly(message, args).catch((error) => {
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

async function handleFly(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/utility/fly.js:38)");
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
        return flyHelp(player, prefix, configuration.customcommands.fly);
    }

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.fly) {
        return flyHelp(player, prefix, configuration.customcommands.fly);
    }

    // リクエストされた選手を探す
    let member: Player;
    if (args.length) {
        const players = world.getPlayers();
        for (const pl of players) {
            if (pl.name.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
                break;
            }
        }
    }

    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f その選手は見つからなかった！`);
    }

    const membertag = member.getTags();

    if (!membertag.includes("noflying") && !membertag.includes("flying")) {
        member
            .runCommandAsync(`ability @s mayfly true`)
            .then(() => {
                member.addTag("flying");
                mayflyenable(player, member);
            })
            .catch(() => {
                return sendMsgToPlayer(player, `この世界では、§f§4[§6Paradox§4]§f§4[Fly]§f 教育版は無効である。`);
            });
        return;
    }

    if (membertag.includes("flying")) {
        member.addTag("noflying");
    }

    if (member.hasTag("noflying")) {
        member
            .runCommandAsync(`ability @s mayfly false`)
            .then(() => {
                member.removeTag("flying");
                mayflydisable(player, member);
                member.removeTag("noflying");
            })
            .catch(() => {
                return sendMsgToPlayer(player, `この世界では、§f§4[§6Paradox§4]§f§4[Fly]§f 教育版は無効である。`);
            });
        return;
    }
}

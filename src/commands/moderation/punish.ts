import { world, Player, ChatSendAfterEvent, EntityInventoryComponent } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

function punishHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n罰則§4[§6命令§4]§f: 罰則`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f: [オプション]を罰する。`,
        `§4[§6オプション§4]§f: ユーザー名、ヘルプ`,
        `§4[§6解説§4]§f．プレイヤーのインベントリとエンダーチェストから全てのアイテムを取り除く。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}punish ${player.name}`,
        `        §4- §6Remove all items from ${player.name}§f`,
        `    ${prefix}punish help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name punish
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function punish(message: ChatSendAfterEvent, args: string[]) {
    handlePunish(message, args).catch((error) => {
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

async function handlePunish(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/punish.js:10)");
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
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.punish) {
        return punishHelp(player, prefix, configuration.customcommands.punish);
    }

    // 反論はあるか
    if (!args.length) {
        return punishHelp(player, prefix, configuration.customcommands.punish);
    }

    // 要求された選手を見つけよう
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

    // オンラインですか？
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f その選手は見つからなかった！`);
    }

    // 自分自身を罰することがないようにする
    if (member === player) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f あなた自身を罰することはできない。`);
    }

    // 0から29までの30個のスロットがある。
    // エンダーの胸を一掃しよう
    for (let slot = 0; slot < 30; slot++) {
        member.runCommand(`replaceitem entity @s slot.enderchest ${slot} air`);
    }

    // リクエストされた選手のインベントリーを取得し、それを消去できるようにする。
    const inventoryContainer = member.getComponent("minecraft:inventory") as EntityInventoryComponent;
    const inventory = inventoryContainer.container;

    for (let i = 0; i < inventory.size; i++) {
        const inventory_item = inventory.getItem(i);
        if (!inventory_item) {
            continue;
        }
        try {
            inventory.setItem(i, undefined);
        } catch {}
    }
    // 罰が行われたことをスタッフと選手に通知する。
    sendMsgToPlayer(member, `§f§4[§6Paradox§4]§f あなたがたは自分の行いのために罰を受けた！`);
    // タグ「通知」を誰も持っていない場合は、try/catchを使用する。
    return sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 処罰しました §7${member.name}§f`);
}

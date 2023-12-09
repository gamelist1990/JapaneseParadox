import { world, Player, ChatSendAfterEvent } from "@minecraft/server";
import { MinecraftEffectTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config";

function freezeHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `§6コマンド§4]§f: フリーズ`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f：フリーズ [オプション］`,
        `§4[§6オプション§4]§f: ユーザー名、ヘルプ`,
        `§4[§6解説§4]§f．指定したプレイヤーをフリーズまたはフリーズ解除する。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}freeze ${player.name}`,
        `        §4- §6Freeze or unfreeze ${player.name}§f`,
        `    ${prefix}freeze help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name freeze
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function freeze(message: ChatSendAfterEvent, args: string[]) {
    handleFreeze(message, args).catch((error) => {
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

async function handleFreeze(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/utility/freeze.js:30)");
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
        return freezeHelp(player, prefix, configuration.customcommands.freeze);
    }

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.freeze) {
        return freezeHelp(player, prefix, configuration.customcommands.freeze);
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

    // ユニークIDの取得
    const uniqueId2 = dynamicPropertyRegistry.getProperty(member, member?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId2 === member.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f スタッフを凍結することはできない。`);
    }

    const boolean = member.hasTag("paradoxFreeze");

    if (boolean) {
        member.removeTag("paradoxFreeze");
        const effectsToRemove = [MinecraftEffectTypes.Blindness, MinecraftEffectTypes.MiningFatigue, MinecraftEffectTypes.Weakness, MinecraftEffectTypes.Slowness];

        for (const effectType of effectsToRemove) {
            member.removeEffect(effectType);
        }

        sendMsgToPlayer(member, `§f§4[§6Paradox§4]§fあなたはもはや凍っていない。`);
        sendMsg(`a[tag=paradoxOpped]`, `§7${member.name}§f is no longer frozen.`);
        return;
    }

    if (!boolean) {
        const effectsToAdd = [MinecraftEffectTypes.Blindness, MinecraftEffectTypes.MiningFatigue, MinecraftEffectTypes.Weakness, MinecraftEffectTypes.Slowness];

        for (const effectType of effectsToAdd) {
            member.addEffect(effectType, 1000000, { amplifier: 255, showParticles: true });
        }

        member.addTag("paradoxFreeze");
        sendMsgToPlayer(member, `§f§4[§6Paradox§4]§f あなたは今凍っている。`);
        sendMsg(`a[tag=paradoxOpped]`, `§7${member.name}§f is now frozen.`);
        return;
    }
}

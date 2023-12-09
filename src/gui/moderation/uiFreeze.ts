import { Player, world } from "@minecraft/server";
import { MinecraftEffectTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { ModalFormResponse } from "@minecraft/server-ui";

/**
 * Handles the result of a modal form used for toggling freeze mode.
 *
 * @name uiFREEZE
 * @param {ModalFormResponse} freezeResult - The result of the freeze mode toggle modal form.
 * @param {string[]} onlineList - The list of online player names.
 * @param {Player} player - The player who triggered the freeze mode toggle modal form.
 */
export function uiFREEZE(freezeResult: ModalFormResponse, onlineList: string[], player: Player) {
    handleUIFreeze(freezeResult, onlineList, player).catch((error) => {
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

async function handleUIFreeze(freezeResult: ModalFormResponse, onlineList: string[], player: Player) {
    if (!freezeResult || freezeResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [value] = freezeResult.formValues;
    let member: Player = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value as number].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);
    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたはパラドックス・オップされる必要がある。`);
    }

    const boolean = member.hasTag("paradoxFreeze");

    if (boolean) {
        member.removeTag("paradoxFreeze");
        const effectsToRemove = [MinecraftEffectTypes.Blindness, MinecraftEffectTypes.MiningFatigue, MinecraftEffectTypes.Weakness, MinecraftEffectTypes.Slowness];

        for (const effectType of effectsToRemove) {
            member.removeEffect(effectType);
        }
        sendMsgToPlayer(member, `§f§4[§6Paradox§4]§fあなたはもはや凍っていない。`);
        sendMsg(`a[tag=paradoxOpped]`, `§7${member.name}§f フリーズが解かれました`);
        return;
    }

    if (!boolean) {
        const effectsToAdd = [MinecraftEffectTypes.Blindness, MinecraftEffectTypes.MiningFatigue, MinecraftEffectTypes.Weakness, MinecraftEffectTypes.Slowness];

        for (const effectType of effectsToAdd) {
            member.addEffect(effectType, 1000000, { amplifier: 255, showParticles: true });
        }
        member.addTag("paradoxFreeze");
        sendMsgToPlayer(member, `§f§4[§6パラドックス§4]§f あなたは今凍っている。`);
        sendMsg(`a[tag=paradoxOpped]`, `§7${member.name}§f 今あなたはフリーズしています.`);
        return;
    }

    return paradoxui(player);
}

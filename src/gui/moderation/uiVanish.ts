import { Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { ModalFormResponse } from "@minecraft/server-ui";
import { MinecraftEffectTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index.js";

/**
 * Handles the result of a modal form used for toggling player vanish mode.
 *
 * @name uiVANISH
 * @param {ModalFormResponse} vanishResult - The result of the player vanish mode toggle modal form.
 * @param {string[]} onlineList - The list of online player names.
 * @param {Player} player - The player who triggered the player vanish mode toggle modal form.
 */
export function uiVANISH(vanishResult: ModalFormResponse, onlineList: string[], player: Player) {
    handleUIVanish(vanishResult, onlineList, player).catch((error) => {
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

async function handleUIVanish(vanishResult: ModalFormResponse, onlineList: string[], player: Player) {
    if (!vanishResult || vanishResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [value] = vanishResult.formValues;
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
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたはParadox・オップされる必要がある。`);
    }

    // オンラインですか？
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f その選手は見つからなかった！`);
    }
    if (member.hasTag("vanish")) {
        member.addTag("novanish");
    }

    if (member.hasTag("novanish")) {
        member.removeTag("vanish");
    }

    if (member.hasTag("novanish")) {
        member.triggerEvent("unvanish");
        // 効果を取り除く
        const effectsToRemove = [MinecraftEffectTypes.Invisibility, MinecraftEffectTypes.NightVision];

        for (const effectType of effectsToRemove) {
            player.removeEffect(effectType);
        }
        sendMsgToPlayer(member, `§f§4[§6Paradox§4]§fもはやあなたは消えていない。`);
        sendMsg(`a[tag=paradoxOpped]`, `§7${member.name}§f is no longer in vanish.`);
    }

    if (!member.hasTag("novanish")) {
        member.addTag("vanish");
    }

    if (member.hasTag("vanish") && !member.hasTag("novanish")) {
        member.triggerEvent("vanish");
        sendMsgToPlayer(member, `§f§4[§6Paradox§4]§fあなたは今、消滅した！`);
        sendMsg(`a[tag=paradoxOpped]`, `§7${member.name}§f is now vanished!`);
    }

    if (member.hasTag("novanish")) {
        member.removeTag("novanish");
    }

    return paradoxui(player);
}

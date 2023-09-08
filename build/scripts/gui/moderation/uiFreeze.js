import { world } from "@minecraft/server";
import { MinecraftEffectTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
/**
 * Handles the result of a modal form used for toggling freeze mode.
 *
 * @name uiFREEZE
 * @param {ModalFormResponse} freezeResult - The result of the freeze mode toggle modal form.
 * @param {string[]} onlineList - The list of online player names.
 * @param {Player} player - The player who triggered the freeze mode toggle modal form.
 */
export function uiFREEZE(freezeResult, onlineList, player) {
    handleUIFreeze(freezeResult, onlineList, player).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // Extract stack trace information
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });
}
async function handleUIFreeze(freezeResult, onlineList, player) {
    if (!freezeResult || freezeResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [value] = freezeResult.formValues;
    let member = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません.`);
    }
    const boolean = member.hasTag("paradoxFreeze");
    if (boolean) {
        member.removeTag("paradoxFreeze");
        member.runCommand(`effect @s clear`);
        sendMsgToPlayer(member, `§f§4[§6Paradox§4]§f あなたはフリーズから開放されました`);
        sendMsg(`@a[tag=paradoxOpped]`, `${member.name}§f がフリーズから開放されたよ.`);
        return;
    }
    if (!boolean) {
        // Blindness
        member.addEffect(MinecraftEffectTypes.Blindness, 1000000, { amplifier: 255, showParticles: true });
        // Mining Fatigue
        member.addEffect(MinecraftEffectTypes.MiningFatigue, 1000000, { amplifier: 255, showParticles: true });
        // Weakness
        member.addEffect(MinecraftEffectTypes.Weakness, 1000000, { amplifier: 255, showParticles: true });
        // Slowness
        member.addEffect(MinecraftEffectTypes.Slowness, 1000000, { amplifier: 255, showParticles: true });
        member.addTag("paradoxFreeze");
        sendMsgToPlayer(member, `§f§4[§6Paradox§4]§f あなたはフリーズしました`);
        sendMsg(`@a[tag=paradoxOpped]`, `${member.name}§f がフリーズしました.`);
        return;
    }
    return paradoxui(player);
}

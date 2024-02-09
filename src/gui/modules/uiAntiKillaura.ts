import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { KillAura } from "../../penrose/EntityHitEntityAfterEvent/killaura";
import ConfigInterface from "../../interfaces/Config";

/**
 * Handles the result of a modal form used for toggling anti-kill aura mode.
 *
 * @name uiANTIKILLAURA
 * @param {ModalFormResponse} antikillauraResult - The result of the anti-kill aura mode toggle modal form.
 * @param {Player} player - The player who triggered the anti-kill aura mode toggle modal form.
 */
export function uiANTIKILLAURA(antikillauraResult: ModalFormResponse, player: Player) {
    handleUIAntiKillAura(antikillauraResult, player).catch((error) => {
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

async function handleUIAntiKillAura(antikillauraResult: ModalFormResponse, player: Player) {
    if (!antikillauraResult || antikillauraResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [AntiKillAuraToggle] = antikillauraResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Anti Killaura`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiKillAuraToggle === false) {
        // Deny
        configuration.modules.antiKillAura.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4AntiKillAura§f!`);
    } else if (AntiKillAuraToggle === true) {
        // Allow
        configuration.modules.antiKillAura.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6AntiKillAura§f!`);
        KillAura();
    }
    //show the main ui to the player once complete.
    return paradoxui(player);
}

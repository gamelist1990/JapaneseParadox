import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { AutoClicker } from "../../penrose/EntityHitEntityAfterEvent/autoclicker";
import ConfigInterface from "../../interfaces/Config";

/**
 * Handles the result of a modal form used for toggling anti-auto clicker mode.
 *
 * @name uiANTIAUTOCLICKER
 * @param {ModalFormResponse} antiautoclickerResult - The result of the anti-auto clicker mode toggle modal form.
 * @param {Player} player - The player who triggered the anti-auto clicker mode toggle modal form.
 */
export function uiANTIAUTOCLICKER(antiautoclickerResult: ModalFormResponse, player: Player) {
    handleUIAntiAutoClicker(antiautoclickerResult, player).catch((error) => {
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

async function handleUIAntiAutoClicker(antiautoclickerResult: ModalFormResponse, player: Player) {
    if (!antiautoclickerResult || antiautoclickerResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [AntiAutoClickerToggle] = antiautoclickerResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Auto Clicker`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiAutoClickerToggle === true) {
        // Allow
        configuration.modules.autoclicker.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6AutoClicker§f!`);
        AutoClicker();
    }
    if (AntiAutoClickerToggle === false) {
        // Deny
        configuration.modules.autoclicker.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4AutoClicker§f!`);
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

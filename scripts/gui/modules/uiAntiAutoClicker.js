import { world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { AutoClicker } from "../../penrose/EntityHitEntityAfterEvent/autoclicker";
/**
 * Handles the result of a modal form used for toggling anti-auto clicker mode.
 *
 * @name uiANTIAUTOCLICKER
 * @param {ModalFormResponse} antiautoclickerResult - The result of the anti-auto clicker mode toggle modal form.
 * @param {Player} player - The player who triggered the anti-auto clicker mode toggle modal form.
 */
export function uiANTIAUTOCLICKER(antiautoclickerResult, player) {
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
async function handleUIAntiAutoClicker(antiautoclickerResult, player) {
    if (!antiautoclickerResult || antiautoclickerResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [AntiAutoClickerToggle] = antiautoclickerResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Get Dynamic Property Boolean
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません to configure Auto Clicker`);
    }
    if (AntiAutoClickerToggle === true) {
        // Allow
        dynamicPropertyRegistry.set("autoclicker_b", true);
        world.setDynamicProperty("autoclicker_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6AutoClicker§f!`);
        AutoClicker();
    }
    if (AntiAutoClickerToggle === false) {
        // Deny
        dynamicPropertyRegistry.set("autoclicker_b", false);
        world.setDynamicProperty("autoclicker_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4AutoClicker§f!`);
    }
    //show the main ui to the player once complete.
    return paradoxui(player);
}

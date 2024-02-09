import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { ScaffoldA } from "../../penrose/PlayerPlaceBlockAfterEvent/scaffold/scaffold_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Handles the result of a modal form used for toggling anti-scaffold mode.
 *
 * @name uiANTISCAFFOLD
 * @param {ModalFormResponse} antiscaffoldResult - The result of the anti-scaffold mode toggle modal form.
 * @param {Player} player - The player who triggered the anti-scaffold mode toggle modal form.
 */
export function uiANTISCAFFOLD(antiscaffoldResult: ModalFormResponse, player: Player) {
    handleUIAntiScaffold(antiscaffoldResult, player).catch((error) => {
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

async function handleUIAntiScaffold(antiscaffoldResult: ModalFormResponse, player: Player) {
    if (!antiscaffoldResult || antiscaffoldResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [AntiScaffoldToggle] = antiscaffoldResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Anti Scaffold`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiScaffoldToggle === true) {
        // Allow
        configuration.modules.antiscaffoldA.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6AntiScaffoldA§f!`);
        ScaffoldA();
    }
    if (AntiScaffoldToggle === false) {
        // Deny
        configuration.modules.antiscaffoldA.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4AntiScaffoldA§f!`);
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

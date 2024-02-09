import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";

import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiANTISHULKER(antishulkerResult: ModalFormResponse, player: Player) {
    if (!antishulkerResult || antishulkerResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [AntiShulkerToggle] = antishulkerResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Anti Shulker`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiShulkerToggle === true) {
        // Allow
        configuration.modules.antishulker.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6Anti-Shulkers§f!`);
    }
    if (AntiShulkerToggle === false) {
        // Deny
        configuration.modules.antishulker.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4Anti-Shulkers§f!`);
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

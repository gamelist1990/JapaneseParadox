import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { ClearLag } from "../../penrose/TickEvent/clearlag/clearlag.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiLAGCLEAR(lagclearResult: ModalFormResponse, player: Player) {
    if (!lagclearResult || lagclearResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [LagClearToggle] = lagclearResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Clear Lag`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (LagClearToggle === true) {
        // Allow
        configuration.modules.clearLag.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6ClearLag§f!`);
        ClearLag();
    }
    if (LagClearToggle === false) {
        // Deny
        configuration.modules.clearLag.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4ClearLag§f!`);
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

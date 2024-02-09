import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { JesusA } from "../../penrose/TickEvent/jesus/jesus_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiANTIJESUS(antijesusResult: ModalFormResponse, player: Player) {
    if (!antijesusResult || antijesusResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [AntiJesusToggle] = antijesusResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Anti Jesus`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiJesusToggle === true) {
        // Allow
        configuration.modules.jesusA.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6JesusA§f!`);
        JesusA();
    }
    if (AntiJesusToggle === false) {
        // Deny
        configuration.modules.jesusA.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4JesusA§f!`);
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

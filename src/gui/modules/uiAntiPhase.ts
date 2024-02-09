import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { AntiPhaseA } from "../../penrose/TickEvent/phase/phase_a.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiANTIPHASE(antiphaseResult: ModalFormResponse, player: Player) {
    if (!antiphaseResult || antiphaseResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    // Get Dynamic Property Boolean
    const [AntiPhaseToggle] = antiphaseResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Anti Phase`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiPhaseToggle === true) {
        // Allow
        configuration.modules.antiphaseA.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6AntiPhaseA§f!`);
        AntiPhaseA();
    }
    if (AntiPhaseToggle === false) {
        configuration.modules.antiphaseA.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4AntiPhaseA§f!`);
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

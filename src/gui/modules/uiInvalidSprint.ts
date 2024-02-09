import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { InvalidSprintA } from "../../penrose/TickEvent/invalidsprint/invalidsprint_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiINVALIDSPRINT(invalidsprintResult: ModalFormResponse, player: Player) {
    if (!invalidsprintResult || invalidsprintResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [InvalidSprintToggle] = invalidsprintResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Invalid Sprint`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (InvalidSprintToggle === true) {
        // Allow
        configuration.modules.invalidsprintA.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6InvalidSprintA§f!`);
        InvalidSprintA();
    }

    if (InvalidSprintToggle === false) {
        configuration.modules.invalidsprintA.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4InvalidSprintA§f!`);
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

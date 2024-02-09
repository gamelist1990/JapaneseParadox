import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { OPS } from "../../penrose/TickEvent/oneplayersleep/oneplayersleep.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiOPS(opsResult: ModalFormResponse, player: Player) {
    if (!opsResult || opsResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [OnePlayerSleepToggle] = opsResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure OPS`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (OnePlayerSleepToggle === true) {
        configuration.modules.ops.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6OPS§f!`);
        OPS();
    }
    if (OnePlayerSleepToggle === false) {
        // Deny
        configuration.modules.ops.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4OPS§f!`);
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

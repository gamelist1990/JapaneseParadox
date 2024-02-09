import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { AutoBan } from "../../penrose/TickEvent/ban/autoban.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiAUTOBAN(autobanResult: ModalFormResponse, player: Player) {
    if (!autobanResult || autobanResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [autobanToggle] = autobanResult.formValues;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped.`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    const autoBanBoolean = configuration.modules.autoBan.enabled;

    if (autobanToggle === true && autoBanBoolean === false) {
        // Allow
        configuration.modules.autoBan.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6autoban§f!`);
        AutoBan();
    }
    if (autobanToggle === false && autoBanBoolean === true) {
        // Deny
        configuration.modules.autoBan.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4autoban§f!`);
    }

    return paradoxui(player);
}

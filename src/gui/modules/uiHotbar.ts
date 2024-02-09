import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { Hotbar } from "../../penrose/TickEvent/hotbar/hotbar.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

const configMessageBackup = new WeakMap();
// Dummy object
const dummy: object = [];

export function uiHOTBAR(hotbarResult: ModalFormResponse, player: Player) {
    if (!hotbarResult || hotbarResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [HotbarMessage, HotbarToggle, HotbarRestDefaultMessageToggle] = hotbarResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure the hotbar`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (configMessageBackup.has(dummy) === false) {
        configMessageBackup.set(dummy, configuration.modules.hotbar.message);
    }
    if (HotbarToggle === true && HotbarRestDefaultMessageToggle === false) {
        // Allow
        configuration.modules.hotbar.enabled = true;
        configuration.modules.hotbar.message = HotbarMessage as string;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§7${player.name}§f has enabled §6Hotbar`);
        Hotbar();
    }
    if (HotbarToggle === false) {
        // Deny
        configuration.modules.hotbar.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§7${player.name}§f has disabled §6Hotbar`);
    }
    if (HotbarToggle === false && HotbarRestDefaultMessageToggle === true) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to enable the hotbar toggle to reset the message!`);
        return paradoxui(player);
    }
    if (HotbarToggle === true && HotbarRestDefaultMessageToggle === true) {
        configuration.modules.hotbar.message = configMessageBackup.get(dummy);
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        Hotbar();
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { AFK } from "../../penrose/TickEvent/afk/afk.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";
export function uiAFK(afkResult: ModalFormResponse, player: Player) {
    if (!afkResult || afkResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [afkToggle] = afkResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure AFK`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (afkToggle === true) {
        // Allow
        configuration.modules.afk.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6AFK§f!`);
        AFK();
    }
    if (afkToggle === false) {
        // Deny
        configuration.modules.afk.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4AFK§f!`);
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

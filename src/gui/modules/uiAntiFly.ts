import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { paradoxui } from "../paradoxui.js";
import { sendMsgToPlayer, sendMsg } from "../../util.js";
import { FlyA } from "../../penrose/TickEvent/fly/fly_a.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiANTIFLY(antiflyResult: ModalFormResponse, player: Player) {
    if (!antiflyResult || antiflyResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [AntiFlyToggle] = antiflyResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Anti Fly`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiFlyToggle === true) {
        // Allow
        configuration.modules.flyA.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6FlyA§f!`);
        FlyA();
    }
    if (AntiFlyToggle === false) {
        // Deny
        configuration.modules.flyA.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4FlyA§f!`);
    }
    //show the main ui to the player once complete.
    return paradoxui(player);
}

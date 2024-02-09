import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { XrayA } from "../../penrose/PlayerBreakBlockAfterEvent/xray/xray_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiXRAY(xrayResult: ModalFormResponse, player: Player) {
    if (!xrayResult || xrayResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [XrayToggle] = xrayResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Xray`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (XrayToggle === true) {
        // Allow
        configuration.modules.xrayA.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6XrayA§f!`);
        XrayA();
    }
    if (XrayToggle === false) {
        // Deny
        configuration.modules.xrayA.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4XrayA§f!`);
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

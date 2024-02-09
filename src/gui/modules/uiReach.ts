import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { ReachB } from "../../penrose/EntityHitEntityAfterEvent/reach_b.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { BeforeReachA } from "../../penrose/PlayerPlaceBlockBeforeEvent/reach/reach_a.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiREACH(reachResult: ModalFormResponse, player: Player) {
    if (!reachResult || reachResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [ReachAToggle, ReachBToggle] = reachResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Reach`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Get Dynamic Property Boolean
    const reachABoolean = configuration.modules.reachA.enabled;
    const reachBBoolean = configuration.modules.reachB.enabled;

    if (ReachAToggle === true && reachABoolean === false) {
        // Allow
        configuration.modules.reachA.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6ReachA§f!`);
        BeforeReachA();
    }
    if (ReachAToggle === false && reachABoolean === true) {
        // Deny
        configuration.modules.reachA.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4ReachA§f!`);
    }
    if (ReachBToggle === true && reachBBoolean === false) {
        // Allow
        configuration.modules.reachB.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6ReachB§f!`);
        ReachB();
    }
    if (ReachBToggle === false && reachBBoolean === true) {
        // Deny
        configuration.modules.reachB.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4ReachB§f!`);
    }

    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);

    //show the main ui to the player once complete.
    return paradoxui(player);
}

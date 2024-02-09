import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { BadPackets1 } from "../../penrose/ChatSendBeforeEvent/spammer/badpackets_1.js";
import { BadPackets2 } from "../../penrose/TickEvent/badpackets2/badpackets2.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiBADPACKETS(badpacketsResult: ModalFormResponse, player: Player) {
    if (!badpacketsResult || badpacketsResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [BadPackets1Toggle, BadPackets2Toggle] = badpacketsResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Badpackets`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (BadPackets1Toggle === true && configuration.modules.badpackets1.enabled === false) {
        // Allow
        configuration.modules.badpackets1.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6Badpackets1§f!`);
        BadPackets1();
    }
    if (BadPackets1Toggle === false && configuration.modules.badpackets1.enabled === true) {
        // Deny
        configuration.modules.badpackets1.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4Badpackets1§f!`);
    }
    if (BadPackets2Toggle === true && configuration.modules.badpackets2.enabled === false) {
        // Allow
        configuration.modules.badpackets2.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6Badpackets2§f!`);
        BadPackets2();
    }
    if (BadPackets2Toggle === false && configuration.modules.badpackets2.enabled === true) {
        // Deny
        configuration.modules.badpackets2.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4Badpackets2§f!`);
    }

    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);

    //show the main ui to the player once complete.
    return paradoxui(player);
}

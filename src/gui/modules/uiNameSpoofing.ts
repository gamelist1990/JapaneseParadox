import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { NamespoofA } from "../../penrose/TickEvent/namespoof/namespoof_a.js";
import { NamespoofB } from "../../penrose/TickEvent/namespoof/namespoof_b.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiNAMESPOOFING(namespoofingResult: ModalFormResponse, player: Player) {
    if (!namespoofingResult || namespoofingResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [NameSpoofAToggle, NameSpoofBToggle] = namespoofingResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Name Spoofing`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Get Dynamic Property Boolean
    const nameSpoofABoolean = configuration.modules.namespoofA.enabled;
    const nameSpoofBBoolean = configuration.modules.namespoofB.enabled;

    if (NameSpoofAToggle === true && nameSpoofABoolean === false) {
        // Allow
        configuration.modules.namespoofA.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6NamespoofA§f!`);
        NamespoofA();
    }
    if (NameSpoofAToggle === false && nameSpoofABoolean === true) {
        // Deny
        configuration.modules.namespoofA.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4NamespoofA§f!`);
    }
    if (NameSpoofBToggle === true && nameSpoofBBoolean === false) {
        // Allow
        configuration.modules.namespoofB.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6NamespoofB§f!`);
        NamespoofB;
    }
    if (NameSpoofBToggle === false && nameSpoofBBoolean === true) {
        // Deny
        configuration.modules.namespoofB.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4NamespoofB§f!`);
    }

    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);

    //show the main ui to the player once complete.
    return paradoxui(player);
}

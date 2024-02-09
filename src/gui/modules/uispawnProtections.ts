import { Player, Vector } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { SpawnProtection } from "../../penrose/TickEvent/spawnprotection/spawnProtection.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util.js";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiSpawnProtection(spawnProtectionResult: ModalFormResponse, player: Player) {
    if (!spawnProtectionResult || spawnProtectionResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [spawnProtectionToggle, spawnProtection_X, spawnProtection_Y, spawnProtection_Z, spawnProtection_Radius] = spawnProtectionResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Spawn Protection`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (spawnProtectionToggle === true) {
        // Allow
        configuration.modules.spawnprotection.enabled = true;
        const vector3 = new Vector(Number(spawnProtection_X), Number(spawnProtection_Y), Number(spawnProtection_Z));
        configuration.modules.spawnprotection.enabled = true;
        configuration.modules.spawnprotection.vector3 = vector3;
        configuration.modules.spawnprotection.radius = Math.abs(Number(spawnProtection_Radius));
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6Spawn Protection§f!`);
        SpawnProtection();
    }
    if (spawnProtectionToggle === false) {
        // Deny
        configuration.modules.spawnprotection.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4Spawn Protection§f!`);
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

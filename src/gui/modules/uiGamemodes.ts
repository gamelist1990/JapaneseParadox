import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { Adventure } from "../../penrose/TickEvent/gamemode/adventure.js";
import { Creative } from "../../penrose/TickEvent/gamemode/creative.js";
import { Survival } from "../../penrose/TickEvent/gamemode/survival.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiGAMEMODES(gamemodeResult: ModalFormResponse, player: Player) {
    if (!gamemodeResult || gamemodeResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [AdventureGM, CreativeGM, SurvivalGM] = gamemodeResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure gamemodes`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AdventureGM === true && CreativeGM === true && SurvivalGM === true) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You can't disable all gamemodes!`);
    }
    //Adventure gamemode
    if (AdventureGM === true && configuration.modules.adventureGM.enabled === false) {
        // Allow
        configuration.modules.adventureGM.enabled = true;
        // Make sure at least one is allowed since this could cause serious issues if all were locked down
        // We will allow Adventure Mode in this case
        if (configuration.modules.survivalGM.enabled === true && configuration.modules.creativeGM.enabled === true) {
            configuration.modules.adventureGM.enabled = false;
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f Since all gamemodes were disallowed, Adventure mode has been enabled.`);
            Adventure();
        }
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disallowed §4Gamemode 2 (Adventure)§f to be used!`);
        Adventure();
    }
    if (AdventureGM === false && configuration.modules.adventureGM.enabled === true) {
        // Deny
        configuration.modules.adventureGM.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has allowed §6Gamemode 2 (Adventure)§f to be used!`);
    }
    //Creative gamemode
    if (CreativeGM === true && configuration.modules.creativeGM.enabled === false) {
        // Allow
        configuration.modules.creativeGM.enabled = true;
        // Make sure at least one is allowed since this could cause serious issues if all were locked down
        // We will allow Adventure Mode in this case
        if (configuration.modules.adventureGM.enabled === true && configuration.modules.survivalGM.enabled === false) {
            configuration.modules.adventureGM.enabled = false;
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f Since all gamemodes were disallowed, Adventure mode has been enabled.`);
            Adventure();
        }
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disallowed §4Gamemode 1 (Creative)§f to be used!`);
        Creative();
    }
    if (CreativeGM === false && configuration.modules.creativeGM.enabled === true) {
        // Deny
        configuration.modules.creativeGM.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has allowed §6Gamemode 1 (Creative)§f to be used!`);
    }
    if (SurvivalGM === true && configuration.modules.survivalGM.enabled === false) {
        // Allow
        configuration.modules.survivalGM.enabled = true;
        // Make sure at least one is allowed since this could cause serious issues if all were locked down
        // We will allow Adventure Mode in this case
        if (configuration.modules.adventureGM.enabled === true && configuration.modules.creativeGM.enabled === true) {
            configuration.modules.adventureGM.enabled = false;
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f Since all gamemodes were disallowed, Adventure mode has been enabled.`);
            Adventure();
        }
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disallowed §4Gamemode 0 (Survival)§f to be used!`);
        Survival();
    }
    if (SurvivalGM === false && configuration.modules.survivalGM.enabled === true) {
        // Deny
        configuration.modules.survivalGM.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has allowed §6Gamemode 0 (Survival)§f to be used!`);
    }

    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);

    //show the main ui to the player one complete.
    return paradoxui(player);
}

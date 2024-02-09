import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { IllegalItemsB } from "../../penrose/PlayerPlaceBlockAfterEvent/illegalitems/illegalitems_b.js";
import { IllegalItemsA } from "../../penrose/TickEvent/illegalitems/illegalitems_a.js";
import { IllegalItemsC } from "../../penrose/TickEvent/illegalitems/illegalitems_c.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiILLEGALITEMS(illegalitemsResult: ModalFormResponse, player: Player) {
    if (!illegalitemsResult || illegalitemsResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [IllegalItemsAToggle, IllegalItemsBToggle, IllegalItemsCToggle, IllegalEnchanmentsToggle, IllegalLoreToggle, IllegalStackBanToggle] = illegalitemsResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Illegal Items`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    const illegalItemsABoolean = configuration.modules.illegalitemsA.enabled;
    const illegalItemsBBoolean = configuration.modules.illegalitemsB.enabled;
    const illegalItemsCBoolean = configuration.modules.illegalitemsC.enabled;
    const illegalEnchantmentBoolean = configuration.modules.illegalEnchantment.enabled;
    const illegalLoresBoolean = configuration.modules.illegalLores.enabled;
    const stackBanBoolean = configuration.modules.stackBan.enabled;

    if (IllegalItemsAToggle === true && illegalItemsABoolean === false) {
        // Allow
        configuration.modules.illegalitemsA.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6IllegalItemsA§f!`);
        IllegalItemsA();
    }
    if (IllegalItemsAToggle === false && illegalItemsABoolean === true) {
        configuration.modules.illegalitemsA.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4IllegalItemsA§f!`);
    }
    if (IllegalItemsBToggle === true && illegalItemsBBoolean === false) {
        // Allow
        configuration.modules.illegalitemsB.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6IllegalItemsB§f!`);
        IllegalItemsB();
    }
    if (IllegalItemsBToggle === false && illegalItemsBBoolean === true) {
        // Deny
        configuration.modules.illegalitemsB.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4IllegalItemsB§f!`);
    }
    if (IllegalItemsCToggle === true && illegalItemsCBoolean === false) {
        // Allow
        configuration.modules.illegalitemsC.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6IllegalItemsC§f!`);
        IllegalItemsC();
    }
    if (IllegalItemsCToggle === false && illegalItemsABoolean === true) {
        // Deny
        configuration.modules.illegalitemsC.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4IllegalItemsC§f!`);
    }
    if (IllegalEnchanmentsToggle === true && illegalEnchantmentBoolean === false) {
        configuration.modules.illegalEnchantment.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6IllegalEnchantments§f!`);
    }
    if (IllegalEnchanmentsToggle === false && illegalEnchantmentBoolean === true) {
        configuration.modules.illegalEnchantment.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4IllegalEnchantments§f!`);
    }
    if (IllegalLoreToggle === true && illegalLoresBoolean === false) {
        // Allow
        configuration.modules.illegalLores.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6IllegalLores§f!`);
    }
    if (IllegalLoreToggle === false && illegalLoresBoolean === true) {
        // Deny
        configuration.modules.illegalLores.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4IllegalLores§f!`);
    }
    //Check to make sure that Illegal Items are on
    if (!IllegalItemsAToggle === true && !IllegalItemsBToggle === true && !IllegalItemsCToggle === true && IllegalStackBanToggle === true) {
        // Turn it off just incase!
        configuration.modules.stackBan.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to enable Illegal Items to use this feature.`);
        return paradoxui(player);
    }

    if (IllegalStackBanToggle === true && stackBanBoolean === false) {
        // Allow
        configuration.modules.stackBan.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6StackBans§f!`);
    }
    if (IllegalStackBanToggle === false && stackBanBoolean === true) {
        // Deny
        configuration.modules.stackBan.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4StackBans§f!`);
    }

    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);

    //show the main ui to the player once complete.
    return paradoxui(player);
}

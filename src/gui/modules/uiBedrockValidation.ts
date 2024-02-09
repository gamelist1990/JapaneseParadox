import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { BedrockValidate } from "../../penrose/TickEvent/bedrock/bedrockvalidate.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiBEDROCKVALIDATION(bedrockvalidationResult: ModalFormResponse, player: Player) {
    if (!bedrockvalidationResult || bedrockvalidationResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [BedrockValidationToggle] = bedrockvalidationResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Bedrock Validation`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (BedrockValidationToggle === true) {
        // Allow
        configuration.modules.bedrockValidate.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6BedrockValidate§f!`);
        BedrockValidate();
    }
    if (BedrockValidationToggle === false) {
        // Deny
        configuration.modules.bedrockValidate.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4BedrockValidate§f!`);
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

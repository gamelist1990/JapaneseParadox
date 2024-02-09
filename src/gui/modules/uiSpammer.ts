import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { SpammerA } from "../../penrose/ChatSendBeforeEvent/spammer/spammer_a.js";
import { SpammerB } from "../../penrose/ChatSendBeforeEvent/spammer/spammer_b.js";
import { SpammerC } from "../../penrose/ChatSendBeforeEvent/spammer/spammer_c.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiSPAMMER(spamResult: ModalFormResponse, player: Player) {
    if (!spamResult || spamResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [SpammerAToggle, SpammerBToggle, SpammerCToggle] = spamResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure Spammer`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Get Dynamic Property Boolean
    const spammerABoolean = configuration.modules.spammerA.enabled;
    const spammerBBoolean = configuration.modules.spammerB.enabled;
    const spammerCBoolean = configuration.modules.spammerC.enabled;

    if (SpammerAToggle === true && spammerABoolean === false) {
        // Allow
        configuration.modules.spammerA.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6SpammerA§f!`);
        SpammerA();
    }
    if (SpammerAToggle === false && spammerABoolean === true) {
        //Deny
        configuration.modules.spammerA.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4SpammerA§f!`);
    }
    if (SpammerBToggle === true && spammerBBoolean === false) {
        // Allow
        configuration.modules.spammerB.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6SpammerB§f!`);
        SpammerB();
    }
    if (SpammerBToggle === false && spammerBBoolean === true) {
        // Deny
        configuration.modules.spammerB.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4SpammerB§f!`);
    }
    if (SpammerCToggle === true && spammerCBoolean === false) {
        // Allow
        configuration.modules.spammerC.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6SpammerC§f!`);
        SpammerC();
    }
    if (SpammerCToggle === false && spammerCBoolean === true) {
        // Deny
        configuration.modules.spammerC.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4SpammerC§f!`);
    }

    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);

    //show the main ui to the player once complete.
    return paradoxui(player);
}

import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { onJoinrules } from "../PlayerSpawnAfterEvent/rules/rules.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiRULES(banResult: ModalFormResponse, player: Player) {
    if (!banResult || banResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [EnabledRules, EnableKick] = banResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to configure the rules.`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    const showrulesBoolean = configuration.modules.showrules.enabled;
    const KickOnDeclineBoolean = configuration.modules.showrules.kick;
    if (EnabledRules === true && showrulesBoolean === false) {
        configuration.modules.showrules.enabled = true;
        //remember to call the function!
        onJoinrules();
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6showrules§f!`);
    }
    if (EnabledRules === false && showrulesBoolean === true) {
        configuration.modules.showrules.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4showrules§f!`);
    }
    if (EnableKick === true && KickOnDeclineBoolean === false) {
        configuration.modules.showrules.kick = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §4KickOnDecline§f!`);
    }
    if (EnableKick === false && KickOnDeclineBoolean === true) {
        configuration.modules.showrules.kick = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4KickOnDecline§f!`);
    }

    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);

    //show the main ui to the player one complete.
    return paradoxui(player);
}

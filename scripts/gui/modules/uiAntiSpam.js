import { world } from "@minecraft/server";
import { beforeAntiSpam } from "../../penrose/ChatSendBeforeEvent/chat/antispam.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
export function uiANTISPAM(antispamResult, player) {
    if (!antispamResult || antispamResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [AntiSpamToggle] = antispamResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Get Dynamic Property Boolean
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません to configure Anti Spam`);
    }
    if (AntiSpamToggle === true) {
        /// Allow
        dynamicPropertyRegistry.set("antispam_b", true);
        world.setDynamicProperty("antispam_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6Anti Spam§f!`);
        beforeAntiSpam();
    }
    if (AntiSpamToggle === false) {
        // Deny
        dynamicPropertyRegistry.set("antispam_b", false);
        world.setDynamicProperty("antispam_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4Anti Spam§f!`);
    }
    //show the main ui to the player once complete.
    return paradoxui(player);
}

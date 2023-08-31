import { world } from "@minecraft/server";
import { NoSlowA } from "../../penrose/TickEvent/noslow/noslow_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
export function uiNOWSLOW(noslowResult, player) {
    if (!noslowResult || noslowResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [NoSlowToggle] = noslowResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Get Dynamic Property Boolean
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません to configure No Slow`);
    }
    if (NoSlowToggle === true) {
        // Allow
        dynamicPropertyRegistry.set("noslowa_b", true);
        world.setDynamicProperty("noslowa_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6NoSlowA§f!`);
        NoSlowA();
    }
    if (NoSlowToggle === false) {
        // Deny
        dynamicPropertyRegistry.set("noslowa_b", false);
        world.setDynamicProperty("noslowa_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4NoSlowA§f!`);
    }
    //show the main ui to the player once complete.
    return paradoxui(player);
}

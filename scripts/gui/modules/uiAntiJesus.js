import { world } from "@minecraft/server";
import { JesusA } from "../../penrose/TickEvent/jesus/jesus_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
export function uiANTIJESUS(antijesusResult, player) {
    if (!antijesusResult || antijesusResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [AntiJesusToggle] = antijesusResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Get Dynamic Property Boolean
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません to configure Anti Jesus`);
    }
    if (AntiJesusToggle === true) {
        // Allow
        dynamicPropertyRegistry.set("jesusa_b", true);
        world.setDynamicProperty("jesusa_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6JesusA§f!`);
        JesusA();
    }
    if (AntiJesusToggle === false) {
        // Deny
        dynamicPropertyRegistry.set("jesusa_b", false);
        world.setDynamicProperty("jesusa_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4JesusA§f!`);
    }
    //show the main ui to the player once complete.
    return paradoxui(player);
}

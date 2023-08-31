import { world } from "@minecraft/server";
import { InvalidSprintA } from "../../penrose/TickEvent/invalidsprint/invalidsprint_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
export function uiINVALIDSPRINT(invalidsprintResult, player) {
    if (!invalidsprintResult || invalidsprintResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [InvalidSprintToggle] = invalidsprintResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Get Dynamic Property Boolean
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません to configure Invalid Sprint`);
    }
    if (InvalidSprintToggle === true) {
        // Allow
        dynamicPropertyRegistry.set("invalidsprinta_b", true);
        world.setDynamicProperty("invalidsprinta_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6InvalidSprintA§f!`);
        InvalidSprintA();
    }
    if (InvalidSprintToggle === false) {
        dynamicPropertyRegistry.set("invalidsprinta_b", false);
        world.setDynamicProperty("invalidsprinta_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4InvalidSprintA§f!`);
    }
    //show the main ui to the player once complete.
    return paradoxui(player);
}

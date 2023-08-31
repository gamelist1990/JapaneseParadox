import { world } from "@minecraft/server";
import { CrasherA } from "../../penrose/TickEvent/crasher/crasher_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
export function uiANTICRASHER(anticrasherResult, player) {
    if (!anticrasherResult || anticrasherResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [AntiCrasherToggle] = anticrasherResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Get Dynamic Property Boolean
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません to configure Anti Crasher`);
    }
    if (AntiCrasherToggle === true) {
        // Allow
        dynamicPropertyRegistry.set("crashera_b", true);
        world.setDynamicProperty("crashera_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6CrasherA§f!`);
        CrasherA();
    }
    if (AntiCrasherToggle === false) {
        // Deny
        dynamicPropertyRegistry.set("crashera_b", false);
        world.setDynamicProperty("crashera_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4CrasherA§f!`);
    }
    //show the main ui to the player once complete.
    return paradoxui(player);
}

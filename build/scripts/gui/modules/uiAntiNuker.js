import { world } from "@minecraft/server";
import { NukerA } from "../../penrose/BlockBreakAfterEvent/nuker/nuker_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
export function uiANTINUKER(antinukerResult, player) {
    if (!antinukerResult || antinukerResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [AntiNukerToggle] = antinukerResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Get Dynamic Property Boolean
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません to configure Anti Nuker`);
    }
    if (AntiNukerToggle === true) {
        // Allow
        dynamicPropertyRegistry.set("antinukera_b", true);
        world.setDynamicProperty("antinukera_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6AntiNukerA§f!`);
        NukerA();
    }
    if (AntiNukerToggle === false) {
        dynamicPropertyRegistry.set("antinukera_b", false);
        world.setDynamicProperty("antinukera_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4AntiNukerA§f!`);
    }
    //show the main ui to the player once complete.
    return paradoxui(player);
}

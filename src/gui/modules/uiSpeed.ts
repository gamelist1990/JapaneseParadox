import { Player, world, Vector3 } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { SpeedA } from "../../penrose/TickEvent/speed/speed_a.js";

import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util.js";
import { paradoxui } from "../paradoxui.js";

export function uiSPEED(speedResult: ModalFormResponse, player: Player) {
    if (!speedResult || speedResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [SpeedToggle] = speedResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません to configure SpeedA`);
    }
    if (SpeedToggle === true) {
        // Allow
        dynamicPropertyRegistry.set("speeda_b", true);
        world.setDynamicProperty("speeda_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6SpeedA§f!`);
        SpeedA();
    }
    if (SpeedToggle === false) {
        // Deny
        dynamicPropertyRegistry.set("speeda_b", false);
        world.setDynamicProperty("speeda_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4SpeedA§f!`);
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

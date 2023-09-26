import { Player, world, Vector3 } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { AFK } from "../../penrose/TickEvent/afk/afk.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
export function uiAFK(afkResult: ModalFormResponse, player: Player) {
    if (!afkResult || afkResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [afkToggle] = afkResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Get Dynamic Property Boolean

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません to configure AFK`);
    }
    if (afkToggle === true) {
        // Allow
        dynamicPropertyRegistry.set("afk_b", true);
        world.setDynamicProperty("afk_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6AFK§f!`);
        AFK();
    }
    if (afkToggle === false) {
        // Deny
        dynamicPropertyRegistry.set("afk_b", false);
        world.setDynamicProperty("afk_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4AFK§f!`);
    }

    //show the main ui to the player once complete.
    return paradoxui(player);
}

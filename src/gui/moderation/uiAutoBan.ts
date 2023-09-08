import { Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
//import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { AutoBan } from "../../penrose/TickEvent/ban/autoban.js";

export function uiAUTOBAN(autobanResult: ModalFormResponse, player: Player) {
    if (!autobanResult || autobanResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [autobanToggle] = autobanResult.formValues;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    const autoBanBoolean = dynamicPropertyRegistry.get("autoban_b");
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません.`);
    }
    if (autobanToggle === true && autoBanBoolean === false) {
        // Allow
        dynamicPropertyRegistry.set("autoban_b", true);
        world.setDynamicProperty("autoban_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6autoban§f!`);
        AutoBan();
    }
    if (autobanToggle === false && autoBanBoolean === true) {
        // Deny
        dynamicPropertyRegistry.set("autoban_b", false);
        world.setDynamicProperty("autoban_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4autoban§f!`);
    }

    return paradoxui(player);
}

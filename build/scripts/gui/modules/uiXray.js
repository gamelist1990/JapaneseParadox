import { world } from "@minecraft/server";
import { XrayA } from "../../penrose/BlockBreakAfterEvent/xray/xray_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
export function uiXRAY(xrayResult, player) {
    if (!xrayResult || xrayResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [XrayToggle] = xrayResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Get Dynamic Property Boolean
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません to configure Xray`);
    }
    if (XrayToggle === true) {
        // Allow
        dynamicPropertyRegistry.set("xraya_b", true);
        world.setDynamicProperty("xraya_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6XrayA§f!`);
        XrayA();
    }
    if (XrayToggle === false) {
        // Deny
        dynamicPropertyRegistry.set("xraya_b", false);
        world.setDynamicProperty("xraya_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4XrayA§f!`);
    }
    //show the main ui to the player once complete.
    return paradoxui(player);
}

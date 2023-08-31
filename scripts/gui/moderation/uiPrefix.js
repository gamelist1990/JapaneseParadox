import { world } from "@minecraft/server";
import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
function resetPrefix(player) {
    const sanitize = player.getTags();
    for (const tag of sanitize) {
        if (tag.startsWith("Prefix:")) {
            player.removeTag(tag);
            config.customcommands.prefix = "!";
        }
    }
    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Prefix has been reset!`);
}
export function uiPREFIX(prefixResult, onlineList, player) {
    if (!prefixResult || prefixResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [value, textField, toggle] = prefixResult.formValues;
    let member = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限がないと実行できません！！`);
    }
    if (textField.length && !toggle) {
        /**
         * Make sure we are not attempting to set a prefix that can break commands
         */
        if (textField === "/") {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f /は使えません！！`);
            return paradoxui;
        }
        // Change Prefix command under conditions
        if (textField.length <= 1 && textField.length >= 1) {
            resetPrefix(member);
            config.customcommands.prefix = textField;
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 接頭辞が次のように変更された'${textField}'! 変更者＝＞ ${member.name}`);
            member.addTag("Prefix:" + textField);
        }
        else {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 接頭辞の長さは2文字まで！`);
        }
    }
    // Reset has been toggled
    if (toggle) {
        resetPrefix(player);
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f リセットしました　変更者＝＞ ${member.name}!`);
    }
    return paradoxui(player);
}
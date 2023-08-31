import { queueUnban } from "../../commands/moderation/unban.js";
//import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
export function uiUNBAN(unbanResult, player) {
    if (!unbanResult || unbanResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [textField, deleteUnban] = unbanResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません to Ban a player.`);
    }
    if (deleteUnban === true) {
        queueUnban.delete(textField);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${textField} は禁止解除リストから削除されました！`);
    }
    // Add player to queue
    queueUnban.add(textField);
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${textField} が禁止解除のキューに入っている！`);
    return paradoxui(player);
}
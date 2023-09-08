import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { queueUnban } from "../../commands/moderation/unban.js";
//import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";

export function uiUNBAN(unbanResult: ModalFormResponse, player: Player) {
    if (!unbanResult || unbanResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [textField, deleteUnban] = unbanResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f自分自身には実行できません`);
    }
    if (deleteUnban === true) {
        queueUnban.delete(textField as string);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${textField} はBAN解除リストから削除されました!`);
    }
    // Add player to queue
    queueUnban.add(textField as string);
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${textField} が禁止解除のリストに追加`);
    return paradoxui(player);
}

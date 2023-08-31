import { world } from "@minecraft/server";
//import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
export function uiBAN(banResult, onlineList, player) {
    if (!banResult || banResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [value, textField] = banResult.formValues;
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
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません to Ban a player.`);
    }
    //make sure the player doesnt ban themselfs
    if (member === player) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 自分自身には実行できません`);
    }
    // Make sure the reason is not blank.
    if (!textField) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 出場禁止の理由を書いてください！`);
        return paradoxui(player);
    }
    try {
        member.addTag("Reason:" + textField);
        member.addTag("By:" + player.name);
        member.addTag("isBanned");
    }
    catch (error) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f I was unable to ban that player! Error: ${error}`);
        return paradoxui(player);
    }
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§fは${member.name}をBANした§f. 理由: ${textField}`);
    return paradoxui(player);
}

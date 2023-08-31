import { world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
export function uiCHATRANKS(notifyResult, onlineList, predefinedrank, player) {
    if (!notifyResult || notifyResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [value, predefinedrankvalue, customrank, ChatRanksToggle] = notifyResult.formValues;
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
    const chatRanksBoolean = dynamicPropertyRegistry.get("chatranks_b");
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できませんまたチートの通知が無効です`);
    }
    if (!customrank) {
        try {
            const memberscurrentags = member.getTags();
            let custom;
            memberscurrentags.forEach((t) => {
                if (t.startsWith("Rank:")) {
                    custom = t;
                }
            });
            if (member.hasTag(custom)) {
                member.removeTag(custom);
            }
        }
        catch (error) {
            //This will throw if the player has no tags
            //sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Something went wrong! Error: ${error}`);
        }
        member.addTag("Rank:" + predefinedrank[predefinedrankvalue]);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§fが ${member.name}のランクを変えた.`);
        return paradoxui(player);
    }
    if (customrank) {
        try {
            const memberscurrentags = member.getTags();
            let custom;
            memberscurrentags.forEach((t) => {
                if (t.startsWith("Rank:")) {
                    custom = t;
                }
            });
            if (member.hasTag(custom)) {
                member.removeTag(custom);
            }
        }
        catch (error) {
            // This will throw if the player has no tags that match.
            //sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Something went wrong! Error: ${error}`);
        }
        member.addTag("Rank:" + customrank);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f　${player.name}§f が ${member.name} のランクを更新した`);
        if (ChatRanksToggle === true && chatRanksBoolean === false) {
            // Allow
            dynamicPropertyRegistry.set("chatranks_b", true);
            world.setDynamicProperty("chatranks_b", true);
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6ChatRanks§f!`);
        }
        if (ChatRanksToggle === false && chatRanksBoolean === true) {
            // Deny
            dynamicPropertyRegistry.set("chatranks_b", false);
            world.setDynamicProperty("chatranks_b", false);
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4ChatRanks§f!`);
        }
        return paradoxui(player);
    }
    return paradoxui;
}

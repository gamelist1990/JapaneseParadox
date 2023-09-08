import { world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { crypto, sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import config from "../../data/config.js";
//Function provided by Visual1mpact
export function uiDEOP(opResult, onlineList, player) {
    if (!opResult || opResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [value] = opResult.formValues;
    // Need player object
    let member = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    // Check for hash/salt and validate password from member
    const memberHash = member.getDynamicProperty("hash");
    const memberSalt = member.getDynamicProperty("salt");
    // Use either the operator's ID or the encryption password as the key
    const key = config.encryption.password ? config.encryption.password : member.id;
    // Generate the hash
    const memberEncode = crypto(memberSalt, key) ?? null;
    if (memberHash !== undefined && memberHash === memberEncode) {
        member.removeDynamicProperty("hash");
        member.removeDynamicProperty("salt");
        dynamicPropertyRegistry.delete(member.id);
        member.removeTag("paradoxOpped");
        if (player.name !== member.name) {
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${member.name}§f が管理者ではなくなりました.`);
        }
        sendMsgToPlayer(member, `§f§4[§6Paradox§4]§f 管理者ではなくなりました`);
        return paradoxui(player);
    }
    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ${member.name} Op権限がなかった。`);
    return paradoxui(player);
}

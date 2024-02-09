import { Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import ConfigInterface from "../../interfaces/Config.js";

//Function provided by Visual1mpact
export function uiDEOP(opResult: ModalFormResponse, onlineList: string[], player: Player) {
    if (!opResult || opResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [value] = opResult.formValues;
    // Need player object
    let member: Player = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value as number].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    // Check for hash/salt and validate password from member
    const memberHash = member.getDynamicProperty("hash");
    const memberSalt = member.getDynamicProperty("salt");

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Use either the operator's ID or the encryption password as the key
    const key = configuration.encryption.password ? configuration.encryption.password : member.id;

    // Generate the hash
    const memberEncode: string = (world as WorldExtended).hashWithSalt(memberSalt as string, key);

    if (memberEncode && memberHash !== undefined && memberHash === memberEncode) {
        member.setDynamicProperty("hash");
        member.setDynamicProperty("salt");
        dynamicPropertyRegistry.deleteProperty(member, member.id);
        member.removeTag("paradoxOpped");
        if (player.name !== member.name) {
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${member.name}§f is no longer Paradox-Opped.`);
        }
        sendMsgToPlayer(member, `§f§4[§6Paradox§4]§f Your OP status has been revoked!`);
        return paradoxui(player);
    }
    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f §7${member.name}§f did not have Op permissions.`);
    return paradoxui(player);
}

import { world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { crypto, isValidUUID, sendMsg, sendMsgToPlayer, UUID } from "../../util";
import { paradoxui } from "../paradoxui.js";
import config from "../../data/config.js";
//Function provided by Visual1mpact
export function uiOP(opResult, salt, hash, player, onlineList) {
    if (!opResult || opResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    if (!hash || !salt || (hash !== crypto?.(salt, config.encryption.password || player.id) && isValidUUID(salt))) {
        if (!config.encryption.password) {
            if (!player.isOp()) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません.`);
                return paradoxui(player);
            }
        }
    }
    if ("formValues" in opResult) {
        // It's a ModalFormResponse
        const [value] = opResult.formValues;
        // Try to find the player requested
        let targetPlayer;
        if (onlineList.length > 0) {
            const players = world.getPlayers();
            for (const pl of players) {
                if (pl.name.toLowerCase().includes(onlineList[value].toLowerCase().replace(/"|\\|@/g, ""))) {
                    targetPlayer = pl;
                    break;
                }
            }
        }
        else {
            targetPlayer = player;
            if (config.encryption.password !== value) {
                // Incorrect password
                return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f パスワードが違います. 管理者しか実行できません.`);
            }
        }
        if (targetPlayer) {
            const targetHash = targetPlayer.getDynamicProperty("hash");
            if (targetHash === undefined) {
                const targetSalt = UUID.generate();
                targetPlayer.setDynamicProperty("salt", targetSalt);
                // Use either the operator's ID or the encryption password as the key
                const targetKey = config.encryption.password ? config.encryption.password : targetPlayer.id;
                // Generate the hash
                const newHash = crypto?.(targetSalt, targetKey);
                targetPlayer.setDynamicProperty("hash", newHash);
                dynamicPropertyRegistry.set(targetPlayer.id, targetPlayer.name);
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限を ${targetPlayer.name}に与えた`);
                sendMsgToPlayer(targetPlayer, `§f§4[§6Paradox§4]§f 管理者になりました`);
                sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${targetPlayer.name}§f 新しい管理者が来たよ！.`);
                targetPlayer.addTag("paradoxOpped");
                return paradoxui(player);
            }
            else {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ${targetPlayer.name} 既に管理者です`);
                return paradoxui(player);
            }
        }
        else {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 見つかりませんでした ${targetPlayer.name}.`);
            return paradoxui(player);
        }
    }
    else if ("selection" in opResult) {
        // It's an ActionFormResponse
        if (opResult.selection === 0) {
            // player wants to change their own password
            const targetSalt = UUID.generate();
            const newHash = crypto?.(targetSalt, player.id);
            player.setDynamicProperty("hash", newHash);
            player.setDynamicProperty("salt", targetSalt);
            player.addTag("paradoxOpped");
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者になりました`);
            dynamicPropertyRegistry.set(player.id, player.name);
            return paradoxui(player);
        }
        return paradoxui(player);
    }
    else {
        return paradoxui(player);
    }
}

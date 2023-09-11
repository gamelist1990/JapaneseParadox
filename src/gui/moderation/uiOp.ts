import { Player, world } from "@minecraft/server";
import { ActionFormResponse, ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import {  sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import config from "../../data/config.js";
import { EncryptionManager } from "../../classes/EncryptionManager.js";
import { UUIDManager } from "../../classes/UUIDManager.js";

//Function provided by Visual1mpact
export function uiOP(opResult: ModalFormResponse | ActionFormResponse, salt: string | number | boolean, hash: string | number | boolean, player: Player, onlineList?: string[]) {
    if (!opResult || opResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    if (!hash || !salt || (hash !== EncryptionManager.hashWithSalt(salt as string, config.encryption.password || player.id) && UUIDManager.isValidUUID(salt as string))) {
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
        let targetPlayer: Player;

        if (onlineList.length > 0) {
            const players = world.getPlayers();
            for (const pl of players) {
                if (pl.name.toLowerCase().includes(onlineList[value as number].toLowerCase().replace(/"|\\|@/g, ""))) {
                    targetPlayer = pl;
                    break;
                }
            }
        } else {
            targetPlayer = player;
            if (config.encryption.password !== value) {
                // Incorrect password
                return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f パスワードが違います. 管理者しか実行できません.`);
            }
        }

        if (targetPlayer) {
            const targetHash = targetPlayer.getDynamicProperty("hash");

            if (targetHash === undefined) {
                const targetSalt = UUIDManager.generateRandomUUID();
                targetPlayer.setDynamicProperty("salt", targetSalt);

                // Use either the operator's ID or the encryption password as the key
                const targetKey = config.encryption.password ? config.encryption.password : targetPlayer.id;

                // Generate the hash
                const newHash = EncryptionManager.hashWithSalt(targetSalt, targetKey);

                targetPlayer.setDynamicProperty("hash", newHash);

                dynamicPropertyRegistry.set(targetPlayer.id, targetPlayer.name);

                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限を ${targetPlayer.name}に与えた`);
                sendMsgToPlayer(targetPlayer, `§f§4[§6Paradox§4]§f 管理者になりました`);
                sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${targetPlayer.name}§f 新しい管理者が来たよ！.`);
                targetPlayer.addTag("paradoxOpped");
                return paradoxui(player);
            } else {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ${targetPlayer.name} 既に管理者です`);
                return paradoxui(player);
            }
        } else {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 見つかりませんでした ${targetPlayer.name}.`);
            return paradoxui(player);
        }
    } else if ("selection" in opResult) {
        // It's an ActionFormResponse
        if (opResult.selection === 0) {
            // player wants to change their own password
            const targetSalt = UUIDManager.generateRandomUUID();
            const newHash = EncryptionManager.hashWithSalt(targetSalt, player.id);

            player.setDynamicProperty("hash", newHash);
            player.setDynamicProperty("salt", targetSalt);
            player.addTag("paradoxOpped");

            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者になりました`);

            dynamicPropertyRegistry.set(player.id, player.name);

            return paradoxui(player);
        }
        return paradoxui(player);
    } else {
        return paradoxui(player);
    }
}

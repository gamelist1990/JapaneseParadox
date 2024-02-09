import { Player, world } from "@minecraft/server";
import { ActionFormResponse, ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import ConfigInterface from "../../interfaces/Config.js";

//Function provided by Visual1mpact
export function uiOP(opResult: ModalFormResponse | ActionFormResponse, salt: string | number | boolean, hash: string | number | boolean, player: Player, onlineList?: string[]) {
    if (!opResult || opResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (!hash || !salt || (hash !== (world as WorldExtended).hashWithSalt(salt as string, configuration.encryption.password || player.id) && (world as WorldExtended).isValidUUID(salt as string))) {
        if (!configuration.encryption.password) {
            if (!player.isOp()) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Operator to use this command.`);
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
            if (configuration.encryption.password !== value) {
                // Incorrect password
                return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Incorrect password. You need to be Operator to use this command.`);
            }
        }

        if (targetPlayer) {
            const targetHash = targetPlayer.getDynamicProperty("hash");

            if (targetHash === undefined) {
                const targetSalt = (world as WorldExtended).generateRandomUUID();
                targetPlayer.setDynamicProperty("salt", targetSalt);

                // Use either the operator's ID or the encryption password as the key
                const targetKey = configuration.encryption.password ? configuration.encryption.password : targetPlayer.id;

                // Generate the hash
                const newHash = (world as WorldExtended).hashWithSalt(targetSalt, targetKey);

                targetPlayer.setDynamicProperty("hash", newHash);

                dynamicPropertyRegistry.setProperty(targetPlayer, targetPlayer.id, targetPlayer.name);

                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You have granted Paradox-Op to §7${targetPlayer.name}§f.`);
                sendMsgToPlayer(targetPlayer, `§f§4[§6Paradox§4]§f You are now op!`);
                sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${targetPlayer.name}§f is now Paradox-Opped.`);
                targetPlayer.addTag("paradoxOpped");
                return paradoxui(player);
            } else {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f §7${targetPlayer.name}§f is already Paradox-Opped.`);
                return paradoxui(player);
            }
        } else {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Could not find player §7${targetPlayer.name}§f.`);
            return paradoxui(player);
        }
    } else if ("selection" in opResult) {
        // It's an ActionFormResponse
        if (opResult.selection === 0) {
            // player wants to change their own password
            const targetSalt = (world as WorldExtended).generateRandomUUID();
            const newHash = (world as WorldExtended).hashWithSalt(targetSalt, player.id);

            player.setDynamicProperty("hash", newHash);
            player.setDynamicProperty("salt", targetSalt);
            player.addTag("paradoxOpped");

            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You are now Paradox-Opped!`);

            dynamicPropertyRegistry.setProperty(player, player.id, player.name);

            return paradoxui(player);
        }
        return paradoxui(player);
    } else {
        return paradoxui(player);
    }
}

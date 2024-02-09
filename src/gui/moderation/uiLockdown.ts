import { Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Handles the result of a modal form used for initiating a server lockdown.
 *
 * @name uiLOCKDOWN
 * @param {ModalFormResponse} lockdownResult - The result of the lockdown modal form.
 * @param {Player} player - The player who triggered the lockdown modal form.
 */
export function uiLOCKDOWN(lockdownResult: ModalFormResponse, player: Player) {
    handleUILockdown(lockdownResult, player).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // Extract stack trace information
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });
}

async function handleUILockdown(lockdownResult: ModalFormResponse, player: Player) {
    if (!lockdownResult || lockdownResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [reason, LockdownToggle] = lockdownResult.formValues;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped.`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (LockdownToggle === true) {
        // Lock it down
        const players = world.getPlayers();
        for (const pl of players) {
            // Check for hash/salt and validate password
            const hash = pl.getDynamicProperty("hash");
            const salt = pl.getDynamicProperty("salt");

            // Use either the operator's ID or the encryption password as the key
            const key = configuration.encryption.password ? configuration.encryption.password : pl.id;

            // Generate the hash
            const encode = (world as WorldExtended).hashWithSalt(salt as string, key);
            if (encode && hash !== undefined && encode === hash) {
                continue;
            }
            // Kick players from server
            pl.runCommandAsync(`kick ${pl.name} §f\n\n${reason}`).catch(() => {
                // Despawn players from server
                pl.triggerEvent("paradox:kick");
            });
        }
        // Shutting it down
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f Server is in lockdown!`);
        configuration.modules.lockdown.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has enabled §6Lockdown§f!`);
    }
    //Disable
    if (LockdownToggle === false) {
        configuration.modules.lockdown.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disabled §4Lockdown§f!`);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f Server is no longer in lockdown!`);
    }
    return paradoxui;
}

import { Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { crypto, sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import config from "../../data/config.js";

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
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません.`);
    }
    if (LockdownToggle === true) {
        // Lock it down
        const players = world.getPlayers();
        for (const pl of players) {
            // Check for hash/salt and validate password
            const hash = pl.getDynamicProperty("hash");
            const salt = pl.getDynamicProperty("salt");

            // Use either the operator's ID or the encryption password as the key
            const key = config.encryption.password ? config.encryption.password : pl.id;

            // Generate the hash
            const encode = crypto?.(salt, key);
            if (hash !== undefined && encode === hash) {
                continue;
            }
            // Kick players from server
            pl.runCommandAsync(`kick ${pl.name} §f\n\n${reason}`).catch(() => {
                // Despawn players from server
                pl.triggerEvent("paradox:kick");
            });
        }
        // Shutting it down
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f サーバーがメンテナンス中です`);
        dynamicPropertyRegistry.set("lockdown_b", true);
        world.setDynamicProperty("lockdown_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ §6Lockdown§f!`);
    }
    //Disable
    if (LockdownToggle === false) {
        dynamicPropertyRegistry.set("lockdown_b", false);
        world.setDynamicProperty("lockdown_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ §4Lockdown§f!`);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f メンテナンス終了しました`);
    }
    return paradoxui;
}

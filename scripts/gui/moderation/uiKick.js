import { world } from "@minecraft/server";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
/**
 * Handles the result of a modal form used for kicking players.
 *
 * @name uiKICK
 * @param {ModalFormResponse} banResult - The result of the kick player modal form.
 * @param {string[]} onlineList - The list of online player names.
 * @param {Player} player - The player who triggered the kick player modal form.
 */
export function uiKICK(banResult, onlineList, player) {
    handleUIKick(banResult, onlineList, player).catch((error) => {
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
async function handleUIKick(banResult, onlineList, player) {
    if (!banResult || banResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [value, reason] = banResult.formValues;
    let member = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    if (!member) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f プレイヤーが存在しない又はオフラインです`);
        return paradoxui(player);
    }
    // make sure they dont kick themselves
    if (member === player) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 自分自身には実行できません`);
        return paradoxui(player);
    }
    player.runCommandAsync(`kick "${member.name}" §f\n\n${reason}`).catch((error) => {
        console.warn(`${new Date()} | ` + error);
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f キックできませんでした`);
    });
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§fは ${member.name}をキックしました§f. 理由: ${reason}`);
    return paradoxui(player);
}
import { Player, world, Vector3 } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
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
export function uiKICK(banResult: ModalFormResponse, onlineList: string[], player: Player) {
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

async function handleUIKick(banResult: ModalFormResponse, onlineList: string[], player: Player) {
    if (!banResult || banResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [value, reason] = banResult.formValues;
    let member: Player = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value as number].toLowerCase().replace(/"|\\|@/g, ""))) {
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
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者にしか実行できません`);
        return paradoxui(player);
    }

    player.runCommandAsync(`kick "${member.name}" §f\n\n${reason}`).catch((error) => {
        console.warn(`${new Date()} | ` + error);
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f キックできませんでした`);
    });
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f が ${member.name}をキック§f. 理由: ${reason}`);
    return paradoxui(player);
}

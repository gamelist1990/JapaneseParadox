import { world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
function mayflydisable(player, member) {
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が無効です！＝＞ fly mode for ${player === member ? "themselves" : member.name}.`);
}
function mayflyenable(player, member) {
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f 以下の機能が有効です！＝＞ fly mode for ${player === member ? "themselves" : member.name}.`);
}
/**
 * Handles the result of a modal form used for toggling flight mode.
 *
 * @name uiFLY
 * @param {ModalFormResponse} flyResult - The result of the flight mode toggle modal form.
 * @param {string[]} onlineList - The list of online player names.
 * @param {Player} player - The player who triggered the flight mode toggle modal form.
 */
export function uiFLY(flyResult, onlineList, player) {
    handleUIFly(flyResult, onlineList, player).catch((error) => {
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
async function handleUIFly(flyResult, onlineList, player) {
    if (!flyResult || flyResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [value] = flyResult.formValues;
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
    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません.`);
    }
    // Are they online?
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f プレイヤーが存在しない又はオフラインです`);
    }
    const membertag = member.getTags();
    if (!membertag.includes("noflying") && !membertag.includes("flying")) {
        member
            .runCommandAsync(`ability @s mayfly true`)
            .then(() => {
            member.addTag("flying");
            mayflyenable(player, member);
        })
            .catch(() => {
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Education Editionが無効です！！`);
        });
        return;
    }
    if (membertag.includes("flying")) {
        member.addTag("noflying");
    }
    if (member.hasTag("noflying")) {
        member
            .runCommandAsync(`ability @s mayfly false`)
            .then(() => {
            member.removeTag("flying");
            mayflydisable(player, member);
            member.removeTag("noflying");
        })
            .catch(() => {
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Education Editionが無効です！！.`);
        });
        return;
    }
    return paradoxui(player);
}

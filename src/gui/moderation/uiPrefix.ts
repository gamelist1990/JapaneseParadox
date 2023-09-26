import { Player, world, Vector3 } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
function resetPrefix(player: Player) {
    const sanitize = player.getTags();
    for (const tag of sanitize) {
        if (tag.startsWith("Prefix:")) {
            player.removeTag(tag);
            config.customcommands.prefix = "!";
        }
    }
    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Prefix has been reset!`);
}

export function uiPREFIX(prefixResult: ModalFormResponse, onlineList: string[], player: Player) {
    if (!prefixResult || prefixResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [value, textField, toggle] = prefixResult.formValues;
    let member: Player = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value as number].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限がないと実行できません！！`);
    }
    if ((textField as string).length && !toggle) {
        /**
         * Make sure we are not attempting to set a prefix that can break commands
         */
        if (textField === "/") {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f'/' を使用することはできません！`);
            return paradoxui;
        }

        // Change Prefix command under conditions
        if ((textField as string).length <= 1 && (textField as string).length >= 1) {
            resetPrefix(member);
            config.customcommands.prefix = textField as string;
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 起動文字を '${textField}'変更 ${member.name}`);
            member.addTag("Prefix:" + textField);
        } else {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 設定できるのは二文字までです!`);
        }
    }

    // Reset has been toggled
    if (toggle) {
        resetPrefix(player);
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f リセットしました ${member.name}!`);
    }
    return paradoxui(player);
}

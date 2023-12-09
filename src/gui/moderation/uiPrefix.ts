import { Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";
function resetPrefix(player: Player, configuration: ConfigInterface) {
    const sanitize = player.getTags();
    for (const tag of sanitize) {
        if (tag.startsWith("Prefix:")) {
            player.removeTag(tag);
            configuration.customcommands.prefix = "!";
        }
    }
    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f接頭辞がリセットされた！`);
}

export function uiPREFIX(prefixResult: ModalFormResponse, onlineList: string[], player: Player) {
    if (!prefixResult || prefixResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
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
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if ((textField as string).length && !toggle) {
        /**
         * Make sure we are not attempting to set a prefix that can break commands
         */
        if (textField === "/") {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 接頭辞 '§7/§f' の使用は許されない！`);
            return paradoxui;
        }

        // 条件下での接頭辞変更コマンド
        if ((textField as string).length <= 1 && (textField as string).length >= 1) {
            resetPrefix(member, configuration);
            configuration.customcommands.prefix = textField as string;
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Prefix has been changed to '§7${textField}§f'! for §7${member.name}§f`);
            member.addTag("Prefix:" + textField);
        } else {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f接頭辞の長さを2文字以上にすることはできない！`);
        }
    }

    // リセットが切り替えられた
    if (toggle) {
        resetPrefix(player, configuration);
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f プレフィックスがリセットされました §7${member.name}§f!`);
    }
    return paradoxui(player);
}

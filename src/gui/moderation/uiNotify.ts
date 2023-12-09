import { Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";

export function uiNOTIFY(notifyResult: ModalFormResponse, onlineList: string[], player: Player) {
    if (!notifyResult || notifyResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [value, Enabled] = notifyResult.formValues;
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
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f通知をBooleanにするには、Paradox-Oppedにする必要があります。`);
    }
    if (Enabled === true) {
        try {
            if (member.hasTag("nonotify")) {
                member.removeTag("nonotify");
            }
            member.addTag("notify");
        } catch (error) {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Something went wrong! Error: ${error}`);
            paradoxui(player);
        }
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ notifications.`);
        paradoxui(player);
    }
    if (Enabled === false) {
        try {
            if (member.hasTag("notify")) {
                member.removeTag("notify");
            }
            member.addTag("nonotify");
        } catch (error) {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Something went wrong! Error: ${error}`);
            paradoxui(player);
        }
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ notifications.`);
        paradoxui(player);
    }
    return paradoxui(player);
}

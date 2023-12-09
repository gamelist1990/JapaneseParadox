import { Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";

export function uiBAN(banResult: ModalFormResponse, onlineList: string[], player: Player) {
    if (!banResult || banResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [value, textField] = banResult.formValues;
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
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fプレイヤーをBANするにはParadox・オッ プする必要がある。`);
    }

    //プレーヤーが自分自身を追放しないようにする。
    if (member === player) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 自分自身を禁止することはできない。`);
    }
    // 理由が空白でないことを確認してください。
    if (!textField) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 禁止の理由を含めなければならない!`);
        return paradoxui(player);
    }

    try {
        member.addTag("Reason:" + textField);
        member.addTag("By:" + player.name);
        member.addTag("isBanned");
    } catch (error) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f BANできませんでした Error: ${error}`);
        return paradoxui(player);
    }
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f が §7${member.name}をBANしました§f. 理由: §7${textField}§f`);
    return paradoxui(player);
}

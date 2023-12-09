import { Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsgToPlayer, setTimer } from "../../util";
import { paradoxui } from "../paradoxui.js";

export function uiTPA(tpaResult: ModalFormResponse, onlineList: string[], player: Player) {
    if (!tpaResult || tpaResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [value, toggleToTarget, toggleTargetTo] = tpaResult.formValues;
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
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたはパラドックス・オップされる必要がある。`);
    }
    // オンラインですか？
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6パラドックス§4]§f その選手は見つからなかった！`);
    }
    // 選手が両方のオプションをBooleanにしていないか確認する。
    if (toggleTargetTo === true && toggleToTarget === true) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f両方のオプションをBooleanにすることはできません。`);
        return paradoxui(player);
    }
    //は、プレーヤーがBoolean＝＞少なくとも1つの選択肢を持っていることを確認します。
    if (toggleTargetTo === false && toggleToTarget === false) {
        sendMsgToPlayer(player, `§f§4[§6パラドックス§4]§f 一つのオプションをBooleanにしなければならない。`);
        return paradoxui(player);
    }
    if (toggleToTarget === true) {
        // オペをターゲットに送る
        // その選手のところにテレポートしよう
        setTimer(player.id);
        player.teleport(member.location, {
            dimension: member.dimension,
            rotation: { x: 0, y: 0 },
            facingLocation: { x: 0, y: 0, z: 0 },
            checkForBlocks: true,
            keepVelocity: false,
        });
        // テレポートしたことを知らせる
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Teleported §7${player.name}§f to §7${member.name}§f`);
    }

    if (toggleTargetTo === true) {
        //ターゲットからオペへ
        setTimer(member.id);
        member.teleport(player.location, {
            dimension: player.dimension,
            rotation: { x: 0, y: 0 },
            facingLocation: { x: 0, y: 0, z: 0 },
            checkForBlocks: true,
            keepVelocity: false,
        });
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Teleported §7${member.name}§f to §7${player.name}§f`);
    }

    return paradoxui(player);
}

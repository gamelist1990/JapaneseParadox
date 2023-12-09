import { EntityInventoryComponent, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { ModalFormResponse } from "@minecraft/server-ui";

/**
 * Handles the result of a modal form used for player punishments.
 *
 * @name uiPUNISH
 * @param {ModalFormResponse} punishResult - The result of the player punishment modal form.
 * @param {string[]} onlineList - The list of online player names.
 * @param {Player} player - The player who triggered the player punishment modal form.
 */
export function uiPUNISH(punishResult: ModalFormResponse, onlineList: string[], player: Player) {
    handleUIPunish(punishResult, onlineList, player).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // スタックトレース情報の抽出
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });
}

async function handleUIPunish(punishResult: ModalFormResponse, onlineList: string[], player: Player) {
    if (!punishResult || punishResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [value] = punishResult.formValues;
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
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f罰則を使うにはParadox・オップである必要がある。`);
    }

    // オンラインですか？
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f その選手は見つからなかった！`);
    }

    // 自分自身を罰することがないようにする
    if (member === player) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f あなた自身を罰することはできない。`);
    }
    //スタッフに罰を与えないようにする！
    if (member.hasTag("paradoxOpped")) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f スタッフを罰することはできない。`);
    }
    // 0から29までの30個のスロットがある。
    // エンダーの胸を一掃しよう
    for (let slot = 0; slot < 30; slot++) {
        member.runCommand(`replaceitem entity @s slot.enderchest ${slot} air`);
    }

    // リクエストされた選手のインベントリーを取得し、それを消去できるようにする。
    const inventoryContainer = member.getComponent("minecraft:inventory") as EntityInventoryComponent;
    const inventory = inventoryContainer.container;

    for (let i = 0; i < inventory.size; i++) {
        const inventory_item = inventory.getItem(i);
        if (!inventory_item) {
            continue;
        }
        try {
            inventory.setItem(i, undefined);
        } catch {}
    }
    // 罰が行われたことをスタッフと選手に通知する。
    sendMsgToPlayer(member, `§f§4[§6Paradox§4]§f あなたがたは自分の行いのために罰を受けた！`);
    // タグ「通知」を誰も持っていない場合は、try/catchを使用する。
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は §7${member.name}§f を罰した`);
    return paradoxui(player);
}

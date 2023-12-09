import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";

/**
 * Handles the result of a modal form used for toggling enchanted armor mode.
 *
 * @name uiENCHANTEDARMOR
 * @param {ModalFormResponse} enchantedarmorResult - The result of the enchanted armor mode toggle modal form.
 * @param {Player} player - The player who triggered the enchanted armor mode toggle modal form.
 */
export function uiENCHANTEDARMOR(enchantedarmorResult: ModalFormResponse, player: Player) {
    handleUIEnchantedArmor(enchantedarmorResult, player).catch((error) => {
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

async function handleUIEnchantedArmor(enchantedarmorResult: ModalFormResponse, player: Player) {
    if (!enchantedarmorResult || enchantedarmorResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [EnchantedArmorToggle] = enchantedarmorResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f エンチャント・アーマーを設定するには、Paradox・オッ プする必要がある。`);
    }
    if (EnchantedArmorToggle === true) {
        // 許可する
        player.runCommand(`scoreboard players set paradox:config encharmor 1`);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6Anti Enchanted Armor§f!`);
    }
    if (EnchantedArmorToggle === false) {
        // 拒否する
        player.runCommand(`scoreboard players set paradox:config encharmor 0`);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4Anti Enchanted Armor§f!`);
    }
    player.runCommand(`scoreboard players operation @a encharmor = paradox:config encharmor`);
    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

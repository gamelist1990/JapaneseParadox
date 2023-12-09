import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { AntiKnockbackA } from "../../penrose/TickEvent/knockback/antikb_a.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Handles the result of a modal form used for toggling anti-knockback mode.
 *
 * @name uiANTIKNOCKBACK
 * @param {ModalFormResponse} antiknockbackResult - The result of the anti-knockback mode toggle modal form.
 * @param {Player} player - The player who triggered the anti-knockback mode toggle modal form.
 */
export function uiANTIKNOCKBACK(antiknockbackResult: ModalFormResponse, player: Player) {
    handleUIAntiKnockback(antiknockbackResult, player).catch((error) => {
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

async function handleUIAntiKnockback(antiknockbackResult: ModalFormResponse, player: Player) {
    if (!antiknockbackResult || antiknockbackResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [AntiKnockBackToggle] = antiknockbackResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fアンチノックバックの設定にはParadox・オッ プが必要です。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiKnockBackToggle === true) {
        // 許可する
        configuration.modules.antikbA.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6Anti Knockback§f!`);
        AntiKnockbackA();
    }
    if (AntiKnockBackToggle === false) {
        // 拒否する
        configuration.modules.antikbA.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4Anti Knockback§f!`);
    }

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

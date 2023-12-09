import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { KillAura } from "../../penrose/EntityHitEntityAfterEvent/killaura";
import ConfigInterface from "../../interfaces/Config";

/**
 * Handles the result of a modal form used for toggling anti-kill aura mode.
 *
 * @name uiANTIKILLAURA
 * @param {ModalFormResponse} antikillauraResult - The result of the anti-kill aura mode toggle modal form.
 * @param {Player} player - The player who triggered the anti-kill aura mode toggle modal form.
 */
export function uiANTIKILLAURA(antikillauraResult: ModalFormResponse, player: Player) {
    handleUIAntiKillAura(antikillauraResult, player).catch((error) => {
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

async function handleUIAntiKillAura(antikillauraResult: ModalFormResponse, player: Player) {
    if (!antikillauraResult || antikillauraResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [AntiKillAuraToggle] = antikillauraResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f アンチ・キラウラを設定するには、Paradox・オップである必要がある。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiKillAuraToggle === false) {
        // 拒否する
        configuration.modules.antiKillAura.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4AntiKillAura§f!`);
    } else if (AntiKillAuraToggle === true) {
        // 許可する
        configuration.modules.antiKillAura.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6AntiKillAura§f!`);
        KillAura();
    }
    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

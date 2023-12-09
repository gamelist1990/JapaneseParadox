import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { paradoxui } from "../paradoxui.js";
import { sendMsgToPlayer, sendMsg } from "../../util.js";
import { AntiFallA } from "../../penrose/TickEvent/antifalla/antifall_a.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Handles the result of a modal form used for toggling anti-fall mode.
 *
 * @name uiANTIFALL
 * @param {ModalFormResponse} antifallResult - The result of the anti-fall mode toggle modal form.
 * @param {Player} player - The player who triggered the anti-fall mode toggle modal form.
 */
export function uiANTIFALL(antifallResult: ModalFormResponse, player: Player) {
    handleUIAntiFall(antifallResult, player).catch((error) => {
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

async function handleUIAntiFall(antifallResult: ModalFormResponse, player: Player) {
    if (!antifallResult || antifallResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [AntiFallToggle] = antifallResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f アンチフォールを設定するには、Paradox・オプ状態にする必要がある。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiFallToggle === true) {
        // 許可する
        configuration.modules.antifallA.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6AntiFallA§f!`);
        AntiFallA();
    }
    if (AntiFallToggle === false) {
        // 拒否する
        configuration.modules.antifallA.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4AntiFallA§f!`);
    }

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

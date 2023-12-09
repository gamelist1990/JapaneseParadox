import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { AutoClicker } from "../../penrose/EntityHitEntityAfterEvent/autoclicker";
import ConfigInterface from "../../interfaces/Config";

/**
 * Handles the result of a modal form used for toggling anti-auto clicker mode.
 *
 * @name uiANTIAUTOCLICKER
 * @param {ModalFormResponse} antiautoclickerResult - The result of the anti-auto clicker mode toggle modal form.
 * @param {Player} player - The player who triggered the anti-auto clicker mode toggle modal form.
 */
export function uiANTIAUTOCLICKER(antiautoclickerResult: ModalFormResponse, player: Player) {
    handleUIAntiAutoClicker(antiautoclickerResult, player).catch((error) => {
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

async function handleUIAntiAutoClicker(antiautoclickerResult: ModalFormResponse, player: Player) {
    if (!antiautoclickerResult || antiautoclickerResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [AntiAutoClickerToggle] = antiautoclickerResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fオートクリッカーを設定するには、Paradox-Oppedにする必要があります。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiAutoClickerToggle === true) {
        // 許可する
        configuration.modules.autoclicker.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6AutoClicker§f!`);
        AutoClicker();
    }
    if (AntiAutoClickerToggle === false) {
        // 拒否する
        configuration.modules.autoclicker.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4AutoClicker§f!`);
    }

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

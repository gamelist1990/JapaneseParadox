import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { ScaffoldA } from "../../penrose/PlayerPlaceBlockAfterEvent/scaffold/scaffold_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Handles the result of a modal form used for toggling anti-scaffold mode.
 *
 * @name uiANTISCAFFOLD
 * @param {ModalFormResponse} antiscaffoldResult - The result of the anti-scaffold mode toggle modal form.
 * @param {Player} player - The player who triggered the anti-scaffold mode toggle modal form.
 */
export function uiANTISCAFFOLD(antiscaffoldResult: ModalFormResponse, player: Player) {
    handleUIAntiScaffold(antiscaffoldResult, player).catch((error) => {
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

async function handleUIAntiScaffold(antiscaffoldResult: ModalFormResponse, player: Player) {
    if (!antiscaffoldResult || antiscaffoldResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [AntiScaffoldToggle] = antiscaffoldResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fアンチ・スカフォールドを設定するには、Paradox・オッピングが必要です。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiScaffoldToggle === true) {
        // 許可する
        configuration.modules.antiscaffoldA.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6AntiScaffoldA§f!`);
        ScaffoldA();
    }
    if (AntiScaffoldToggle === false) {
        // 拒否する
        configuration.modules.antiscaffoldA.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4AntiScaffoldA§f!`);
    }

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

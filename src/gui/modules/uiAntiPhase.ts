import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { AntiPhaseA } from "../../penrose/TickEvent/phase/phase_a.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiANTIPHASE(antiphaseResult: ModalFormResponse, player: Player) {
    if (!antiphaseResult || antiphaseResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    // ダイナミック・プロパティ・ブール値の取得
    const [AntiPhaseToggle] = antiphaseResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f アンチフェイズを設定するには、Paradox・オプ状態にする必要がある。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiPhaseToggle === true) {
        // 許可する
        configuration.modules.antiphaseA.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6AntiPhaseA§f!`);
        AntiPhaseA();
    }
    if (AntiPhaseToggle === false) {
        configuration.modules.antiphaseA.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4AntiPhaseA§f!`);
    }

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

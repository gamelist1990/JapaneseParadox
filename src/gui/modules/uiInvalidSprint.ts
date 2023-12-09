import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { InvalidSprintA } from "../../penrose/TickEvent/invalidsprint/invalidsprint_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiINVALIDSPRINT(invalidsprintResult: ModalFormResponse, player: Player) {
    if (!invalidsprintResult || invalidsprintResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [InvalidSprintToggle] = invalidsprintResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6パラドックス§4]§f 無効なスプリントを設定するには、パラドックス・オップである必要があります。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (InvalidSprintToggle === true) {
        // 許可する
        configuration.modules.invalidsprintA.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6InvalidSprintA§f!`);
        InvalidSprintA();
    }

    if (InvalidSprintToggle === false) {
        configuration.modules.invalidsprintA.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4InvalidSprintA§f!`);
    }

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

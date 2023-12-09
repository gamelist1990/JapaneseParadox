import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { ClearLag } from "../../penrose/TickEvent/clearlag/clearlag.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiLAGCLEAR(lagclearResult: ModalFormResponse, player: Player) {
    if (!lagclearResult || lagclearResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [LagClearToggle] = lagclearResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f「クリアラグ」を設定するには、パラドックス・オップである必要があります。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (LagClearToggle === true) {
        // 許可する
        configuration.modules.clearLag.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6ClearLag§f!`);
        ClearLag();
    }
    if (LagClearToggle === false) {
        // 拒否する
        configuration.modules.clearLag.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4ClearLag§f!`);
    }

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

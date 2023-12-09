import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { paradoxui } from "../paradoxui.js";
import { sendMsgToPlayer, sendMsg } from "../../util.js";
import { FlyA } from "../../penrose/TickEvent/fly/fly_a.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiANTIFLY(antiflyResult: ModalFormResponse, player: Player) {
    if (!antiflyResult || antiflyResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [AntiFlyToggle] = antiflyResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fアンチフライを設定するには、Paradox・オッピングが必要です。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiFlyToggle === true) {
        // 許可する
        configuration.modules.flyA.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6FlyA§f!`);
        FlyA();
    }
    if (AntiFlyToggle === false) {
        // 拒否する
        configuration.modules.flyA.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4FlyA§f!`);
    }
    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

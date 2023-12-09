import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { Hotbar } from "../../penrose/TickEvent/hotbar/hotbar.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

const configMessageBackup = new WeakMap();
// ダミーオブジェクト
const dummy: object = [];

export function uiHOTBAR(hotbarResult: ModalFormResponse, player: Player) {
    if (!hotbarResult || hotbarResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [HotbarMessage, HotbarToggle, HotbarRestDefaultMessageToggle] = hotbarResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fホットバーを設定するには、Paradox-Opped にする必要があります。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (configMessageBackup.has(dummy) === false) {
        configMessageBackup.set(dummy, configuration.modules.hotbar.message);
    }
    if (HotbarToggle === true && HotbarRestDefaultMessageToggle === false) {
        // 許可する
        configuration.modules.hotbar.enabled = true;
        configuration.modules.hotbar.message = HotbarMessage as string;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§7${player.name}§f Boolean＝＞ §6Hotbar`);
        Hotbar();
    }
    if (HotbarToggle === false) {
        // 拒否する
        configuration.modules.hotbar.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§7${player.name}§f 無効＝＞ §6Hotbar`);
    }
    if (HotbarToggle === false && HotbarRestDefaultMessageToggle === true) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fメッセージをリセットするには、ホットバーのトグルをBooleanにする必要があります！`);
        return paradoxui(player);
    }
    if (HotbarToggle === true && HotbarRestDefaultMessageToggle === true) {
        configuration.modules.hotbar.message = configMessageBackup.get(dummy);
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        Hotbar();
    }

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

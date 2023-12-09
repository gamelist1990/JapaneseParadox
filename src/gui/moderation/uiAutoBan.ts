import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { AutoBan } from "../../penrose/TickEvent/ban/autoban.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiAUTOBAN(autobanResult: ModalFormResponse, player: Player) {
    if (!autobanResult || autobanResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [autobanToggle] = autobanResult.formValues;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたはParadox・オップされる必要がある。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    const autoBanBoolean = configuration.modules.autoBan.enabled;

    if (autobanToggle === true && autoBanBoolean === false) {
        // 許可する
        configuration.modules.autoBan.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6autoban§f!`);
        AutoBan();
    }
    if (autobanToggle === false && autoBanBoolean === true) {
        // 拒否する
        configuration.modules.autoBan.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4autoban§f!`);
    }

    return paradoxui(player);
}

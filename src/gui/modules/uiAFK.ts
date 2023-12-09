import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { AFK } from "../../penrose/TickEvent/afk/afk.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";
export function uiAFK(afkResult: ModalFormResponse, player: Player) {
    if (!afkResult || afkResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [afkToggle] = afkResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f AFKを設定するには、Paradox・オプ状態にする必要がある。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (afkToggle === true) {
        // 許可する
        configuration.modules.afk.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6AFK§f!`);
        AFK();
    }
    if (afkToggle === false) {
        // 拒否する
        configuration.modules.afk.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4AFK§f!`);
    }

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

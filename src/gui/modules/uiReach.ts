import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { ReachB } from "../../penrose/EntityHitEntityAfterEvent/reach_b.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { BeforeReachA } from "../../penrose/PlayerPlaceBlockBeforeEvent/reach/reach_a.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiREACH(reachResult: ModalFormResponse, player: Player) {
    if (!reachResult || reachResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [ReachAToggle, ReachBToggle] = reachResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fリーチを設定するには、Paradox・オップである必要がある。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // ダイナミック・プロパティ・ブール値の取得
    const reachABoolean = configuration.modules.reachA.enabled;
    const reachBBoolean = configuration.modules.reachB.enabled;

    if (ReachAToggle === true && reachABoolean === false) {
        // 許可する
        configuration.modules.reachA.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6ReachA§f!`);
        BeforeReachA();
    }
    if (ReachAToggle === false && reachABoolean === true) {
        // 拒否する
        configuration.modules.reachA.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4ReachA§f!`);
    }
    if (ReachBToggle === true && reachBBoolean === false) {
        // 許可する
        configuration.modules.reachB.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6ReachB§f!`);
        ReachB();
    }
    if (ReachBToggle === false && reachBBoolean === true) {
        // 拒否する
        configuration.modules.reachB.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4ReachB§f!`);
    }

    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

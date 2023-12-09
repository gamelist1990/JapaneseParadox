import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { onJoinrules } from "../PlayerSpawnAfterEvent/rules/rules.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiRULES(banResult: ModalFormResponse, player: Player) {
    if (!banResult || banResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [EnabledRules, EnableKick] = banResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fルールを設定するためには、Paradox-Oppedである必要がある。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    const showrulesBoolean = configuration.modules.showrules.enabled;
    const KickOnDeclineBoolean = configuration.modules.showrules.kick;
    if (EnabledRules === true && showrulesBoolean === false) {
        configuration.modules.showrules.enabled = true;
        //関数を呼び出すのを忘れないように！
        onJoinrules();
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6showrules§f!`);
    }
    if (EnabledRules === false && showrulesBoolean === true) {
        configuration.modules.showrules.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4showrules§f!`);
    }
    if (EnableKick === true && KickOnDeclineBoolean === false) {
        configuration.modules.showrules.kick = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §4KickOnDecline§f!`);
    }
    if (EnableKick === false && KickOnDeclineBoolean === true) {
        configuration.modules.showrules.kick = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4KickOnDecline§f!`);
    }

    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);

    //メインUIをプレイヤーに表示する。
    return paradoxui(player);
}

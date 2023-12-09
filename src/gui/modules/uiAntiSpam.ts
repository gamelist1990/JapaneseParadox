import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { beforeAntiSpam } from "../../penrose/ChatSendBeforeEvent/chat/antispam.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiANTISPAM(antispamResult: ModalFormResponse, player: Player) {
    if (!antispamResult || antispamResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [AntiSpamToggle] = antispamResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f迷惑メール対策を設定するには、Paradox-Oppedが必要です。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AntiSpamToggle === true) {
        /// 許可する
        configuration.modules.antispam.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6Anti Spam§f!`);
        beforeAntiSpam();
    }
    if (AntiSpamToggle === false) {
        // 拒否する
        configuration.modules.antispam.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4Anti Spam§f!`);
    }

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

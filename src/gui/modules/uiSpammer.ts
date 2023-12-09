import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { SpammerA } from "../../penrose/ChatSendBeforeEvent/spammer/spammer_a.js";
import { SpammerB } from "../../penrose/ChatSendBeforeEvent/spammer/spammer_b.js";
import { SpammerC } from "../../penrose/ChatSendBeforeEvent/spammer/spammer_c.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiSPAMMER(spamResult: ModalFormResponse, player: Player) {
    if (!spamResult || spamResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [SpammerAToggle, SpammerBToggle, SpammerCToggle] = spamResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6パラドックス§4]§f スパマーを設定するには、パラドックス・オッピングが必要です。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // ダイナミック・プロパティ・ブール値の取得
    const spammerABoolean = configuration.modules.spammerA.enabled;
    const spammerBBoolean = configuration.modules.spammerB.enabled;
    const spammerCBoolean = configuration.modules.spammerC.enabled;

    if (SpammerAToggle === true && spammerABoolean === false) {
        // 許可する
        configuration.modules.spammerA.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6SpammerA§f!`);
        SpammerA();
    }
    if (SpammerAToggle === false && spammerABoolean === true) {
        //拒否する
        configuration.modules.spammerA.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4SpammerA§f!`);
    }
    if (SpammerBToggle === true && spammerBBoolean === false) {
        // 許可する
        configuration.modules.spammerB.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6SpammerB§f!`);
        SpammerB();
    }
    if (SpammerBToggle === false && spammerBBoolean === true) {
        // 拒否する
        configuration.modules.spammerB.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4SpammerB§f!`);
    }
    if (SpammerCToggle === true && spammerCBoolean === false) {
        // 許可する
        configuration.modules.spammerC.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6SpammerC§f!`);
        SpammerC();
    }
    if (SpammerCToggle === false && spammerCBoolean === true) {
        // 拒否する
        configuration.modules.spammerC.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4SpammerC§f!`);
    }

    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

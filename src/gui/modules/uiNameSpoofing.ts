import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { NamespoofA } from "../../penrose/TickEvent/namespoof/namespoof_a.js";
import { NamespoofB } from "../../penrose/TickEvent/namespoof/namespoof_b.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiNAMESPOOFING(namespoofingResult: ModalFormResponse, player: Player) {
    if (!namespoofingResult || namespoofingResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [NameSpoofAToggle, NameSpoofBToggle] = namespoofingResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f名前スプーフィングを設定するには、Paradox・オッピングが必要です。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // ダイナミック・プロパティ・ブール値の取得
    const nameSpoofABoolean = configuration.modules.namespoofA.enabled;
    const nameSpoofBBoolean = configuration.modules.namespoofB.enabled;

    if (NameSpoofAToggle === true && nameSpoofABoolean === false) {
        // 許可する
        configuration.modules.namespoofA.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6NamespoofA§f!`);
        NamespoofA();
    }
    if (NameSpoofAToggle === false && nameSpoofABoolean === true) {
        // 拒否する
        configuration.modules.namespoofA.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4NamespoofA§f!`);
    }
    if (NameSpoofBToggle === true && nameSpoofBBoolean === false) {
        // 許可する
        configuration.modules.namespoofB.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6NamespoofB§f!`);
        NamespoofB;
    }
    if (NameSpoofBToggle === false && nameSpoofBBoolean === true) {
        // 拒否する
        configuration.modules.namespoofB.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4NamespoofB§f!`);
    }

    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { BedrockValidate } from "../../penrose/TickEvent/bedrock/bedrockvalidate.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiBEDROCKVALIDATION(bedrockvalidationResult: ModalFormResponse, player: Player) {
    if (!bedrockvalidationResult || bedrockvalidationResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [BedrockValidationToggle] = bedrockvalidationResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f岩盤検証の設定には Paradox-Opped が必要です。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (BedrockValidationToggle === true) {
        // 許可する
        configuration.modules.bedrockValidate.enabled = true;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6BedrockValidate§f!`);
        BedrockValidate();
    }
    if (BedrockValidationToggle === false) {
        // 拒否する
        configuration.modules.bedrockValidate.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4BedrockValidate§f!`);
    }

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

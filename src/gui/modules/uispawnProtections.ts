import { Player, Vector } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { SpawnProtection } from "../../penrose/TickEvent/spawnprotection/spawnProtection.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util.js";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiSpawnProtection(spawnProtectionResult: ModalFormResponse, player: Player) {
    if (!spawnProtectionResult || spawnProtectionResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [spawnProtectionToggle, spawnProtection_X, spawnProtection_Y, spawnProtection_Z, spawnProtection_Radius] = spawnProtectionResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fスポーンプロテクションを設定するには、パラドックスオプする必要があります。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (spawnProtectionToggle === true) {
        // 許可する
        configuration.modules.spawnprotection.enabled = true;
        const vector3 = new Vector(Number(spawnProtection_X), Number(spawnProtection_Y), Number(spawnProtection_Z));
        configuration.modules.spawnprotection.enabled = true;
        configuration.modules.spawnprotection.vector3 = vector3;
        configuration.modules.spawnprotection.radius = Math.abs(Number(spawnProtection_Radius));
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6Spawn Protection§f!`);
        SpawnProtection();
    }
    if (spawnProtectionToggle === false) {
        // 拒否する
        configuration.modules.spawnprotection.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4Spawn Protection§f!`);
    }

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { WorldBorder } from "../../penrose/TickEvent/worldborder/worldborder.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiWORLDBORDER(worldborderResult: ModalFormResponse, player: Player) {
    if (!worldborderResult || worldborderResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [OverworldValueTextfield, NetherValueTextfield, EndValueTextfield, WorldBorderToggle] = worldborderResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fワールド・ボーダーを設定するには、Paradox・オッピングが必要です。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (WorldBorderToggle === true) {
        configuration.modules.worldBorder.enabled = true;
        configuration.modules.worldBorder.overworld = Math.abs(Number(OverworldValueTextfield));
        configuration.modules.worldBorder.nether = Math.abs(Number(NetherValueTextfield));
        configuration.modules.worldBorder.end = Math.abs(Number(EndValueTextfield));
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        WorldBorder();
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has set the §6World Border§f! Overworld: §7${OverworldValueTextfield}§f Nether: §7${NetherValueTextfield}§f End: §7${EndValueTextfield}§f`);
    }
    if (WorldBorderToggle === false) {
        configuration.modules.worldBorder.enabled = false;
        configuration.modules.worldBorder.overworld = 0;
        configuration.modules.worldBorder.nether = 0;
        configuration.modules.worldBorder.end = 0;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ the §6World Border§f!`);
    }

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

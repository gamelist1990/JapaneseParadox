import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { Adventure } from "../../penrose/TickEvent/gamemode/adventure.js";
import { Creative } from "../../penrose/TickEvent/gamemode/creative.js";
import { Survival } from "../../penrose/TickEvent/gamemode/survival.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiGAMEMODES(gamemodeResult: ModalFormResponse, player: Player) {
    if (!gamemodeResult || gamemodeResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [AdventureGM, CreativeGM, SurvivalGM] = gamemodeResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fゲームモードを設定するには、Paradox-Oppedになる必要があります。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (AdventureGM === true && CreativeGM === true && SurvivalGM === true) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f全てのゲームモードを無効にすることはできません！`);
    }
    //アドベンチャー・ゲームモード
    if (AdventureGM === true && configuration.modules.adventureGM.enabled === false) {
        // 許可する
        configuration.modules.adventureGM.enabled = true;
        // すべてがロックされた場合、深刻な問題を引き起こす可能性があるため、少なくとも1つは許可されていることを確認する。
        // この場合、アドベンチャー・モードを許可する
        if (configuration.modules.survivalGM.enabled === true && configuration.modules.creativeGM.enabled === true) {
            configuration.modules.adventureGM.enabled = false;
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f全てのゲームモードが禁止されたため、アドベンチャーモードがBooleanになりました。`);
            Adventure();
        }
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disallowed §4Gamemode 2 (Adventure)§f to be used!`);
        Adventure();
    }
    if (AdventureGM === false && configuration.modules.adventureGM.enabled === true) {
        // 拒否する
        configuration.modules.adventureGM.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has allowed §6Gamemode 2 (Adventure)§f to be used!`);
    }
    //クリエイティブなゲームモード
    if (CreativeGM === true && configuration.modules.creativeGM.enabled === false) {
        // 許可する
        configuration.modules.creativeGM.enabled = true;
        // すべてがロックされた場合、深刻な問題を引き起こす可能性があるため、少なくとも1つは許可されていることを確認する。
        // この場合、アドベンチャー・モードを許可する
        if (configuration.modules.adventureGM.enabled === true && configuration.modules.survivalGM.enabled === false) {
            configuration.modules.adventureGM.enabled = false;
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f全てのゲームモードが使用不可となったため、アドベンチャーモ ードを使用可能にしました。`);
            Adventure();
        }
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disallowed §4Gamemode 1 (Creative)§f to be used!`);
        Creative();
    }
    if (CreativeGM === false && configuration.modules.creativeGM.enabled === true) {
        // 拒否する
        configuration.modules.creativeGM.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has allowed §6Gamemode 1 (Creative)§f to be used!`);
    }
    if (SurvivalGM === true && configuration.modules.survivalGM.enabled === false) {
        // 許可する
        configuration.modules.survivalGM.enabled = true;
        // すべてがロックされた場合、深刻な問題を引き起こす可能性があるため、少なくとも1つは許可されていることを確認する。
        // この場合、アドベンチャー・モードを許可する
        if (configuration.modules.adventureGM.enabled === true && configuration.modules.creativeGM.enabled === true) {
            configuration.modules.adventureGM.enabled = false;
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f全てのゲームモードが禁止されたため、アドベンチャーモードがBooleanになりました。`);
            Adventure();
        }
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has disallowed §4Gamemode 0 (Survival)§f to be used!`);
        Survival();
    }
    if (SurvivalGM === false && configuration.modules.survivalGM.enabled === true) {
        // 拒否する
        configuration.modules.survivalGM.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has allowed §6Gamemode 0 (Survival)§f to be used!`);
    }

    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);

    //メインUIをプレイヤーに表示する。
    return paradoxui(player);
}

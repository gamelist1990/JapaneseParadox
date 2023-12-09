import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { IllegalItemsB } from "../../penrose/PlayerPlaceBlockAfterEvent/illegalitems/illegalitems_b.js";
import { IllegalItemsA } from "../../penrose/TickEvent/illegalitems/illegalitems_a.js";
import { IllegalItemsC } from "../../penrose/TickEvent/illegalitems/illegalitems_c.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import ConfigInterface from "../../interfaces/Config.js";

export function uiILLEGALITEMS(illegalitemsResult: ModalFormResponse, player: Player) {
    if (!illegalitemsResult || illegalitemsResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [IllegalItemsAToggle, IllegalItemsBToggle, IllegalItemsCToggle, IllegalEnchanmentsToggle, IllegalLoreToggle, IllegalStackBanToggle] = illegalitemsResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6パラドックス§4]§f 違法アイテムの設定には、パラドックス・オプが必要です。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    const illegalItemsABoolean = configuration.modules.illegalitemsA.enabled;
    const illegalItemsBBoolean = configuration.modules.illegalitemsB.enabled;
    const illegalItemsCBoolean = configuration.modules.illegalitemsC.enabled;
    const illegalEnchantmentBoolean = configuration.modules.illegalEnchantment.enabled;
    const illegalLoresBoolean = configuration.modules.illegalLores.enabled;
    const stackBanBoolean = configuration.modules.stackBan.enabled;

    if (IllegalItemsAToggle === true && illegalItemsABoolean === false) {
        // 許可する
        configuration.modules.illegalitemsA.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6IllegalItemsA§f!`);
        IllegalItemsA();
    }
    if (IllegalItemsAToggle === false && illegalItemsABoolean === true) {
        configuration.modules.illegalitemsA.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4IllegalItemsA§f!`);
    }
    if (IllegalItemsBToggle === true && illegalItemsBBoolean === false) {
        // 許可する
        configuration.modules.illegalitemsB.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6IllegalItemsB§f!`);
        IllegalItemsB();
    }
    if (IllegalItemsBToggle === false && illegalItemsBBoolean === true) {
        // 拒否する
        configuration.modules.illegalitemsB.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4IllegalItemsB§f!`);
    }
    if (IllegalItemsCToggle === true && illegalItemsCBoolean === false) {
        // 許可する
        configuration.modules.illegalitemsC.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6IllegalItemsC§f!`);
        IllegalItemsC();
    }
    if (IllegalItemsCToggle === false && illegalItemsABoolean === true) {
        // 拒否する
        configuration.modules.illegalitemsC.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4IllegalItemsC§f!`);
    }
    if (IllegalEnchanmentsToggle === true && illegalEnchantmentBoolean === false) {
        configuration.modules.illegalEnchantment.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6IllegalEnchantments§f!`);
    }
    if (IllegalEnchanmentsToggle === false && illegalEnchantmentBoolean === true) {
        configuration.modules.illegalEnchantment.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4IllegalEnchantments§f!`);
    }
    if (IllegalLoreToggle === true && illegalLoresBoolean === false) {
        // 許可する
        configuration.modules.illegalLores.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6IllegalLores§f!`);
    }
    if (IllegalLoreToggle === false && illegalLoresBoolean === true) {
        // 拒否する
        configuration.modules.illegalLores.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4IllegalLores§f!`);
    }
    //違法アイテムがオンになっていることを確認する
    if (!IllegalItemsAToggle === true && !IllegalItemsBToggle === true && !IllegalItemsCToggle === true && IllegalStackBanToggle === true) {
        // 念のため電源を切っておく！
        configuration.modules.stackBan.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこの機能を使うには、Illegal ItemsをBooleanにする必要があります。`);
        return paradoxui(player);
    }

    if (IllegalStackBanToggle === true && stackBanBoolean === false) {
        // 許可する
        configuration.modules.stackBan.enabled = true;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6StackBans§f!`);
    }
    if (IllegalStackBanToggle === false && stackBanBoolean === true) {
        // 拒否する
        configuration.modules.stackBan.enabled = false;
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4StackBans§f!`);
    }

    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);

    //完了したら、プレイヤーにメインUIを表示する。
    return paradoxui(player);
}

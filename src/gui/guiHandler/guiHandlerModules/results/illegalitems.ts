import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiILLEGALITEMS } from "../../../modules/uiIllegaItems";
import ConfigInterface from "../../../../interfaces/Config";

export function illegalItemsHandler(player: Player) {
    //違法な項目 これはいくつかのモジュールをカバーするので、1つのUIにまとめます。
    const modulesillegalitemsui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const illegalItemsABoolean = configuration.modules.illegalitemsA.enabled;
    const illegalItemsBBoolean = configuration.modules.illegalitemsB.enabled;
    const illegalItemsCBoolean = configuration.modules.illegalitemsC.enabled;
    const illegalEnchantmentBoolean = configuration.modules.illegalEnchantment.enabled;
    const illegalLoresBoolean = configuration.modules.illegalLores.enabled;
    const stackBanBoolean = configuration.modules.stackBan.enabled;
    modulesillegalitemsui.title("§4Illegal Itemsメニュー§4");
    modulesillegalitemsui.toggle("不正アイテムA - 不正なアイテムをインベントリに入れているプレイヤーをチェックする：", illegalItemsABoolean);
    modulesillegalitemsui.toggle("不正アイテムB - 不正なアイテムを置いたプレーヤーをチェックする：", illegalItemsBBoolean);
    modulesillegalitemsui.toggle("Illegal Items C - 不正な落下物がないかチェックする：", illegalItemsCBoolean);
    modulesillegalitemsui.toggle("違法エンチャント - 違法なエンチャントが施されたアイテムをチェックする：", illegalEnchantmentBoolean);
    modulesillegalitemsui.toggle("不正な伝承 - アイテムに不正な伝承がないかチェックします：", illegalLoresBoolean);
    modulesillegalitemsui.toggle("スタック禁止 - 不正なスタックを持つプレイヤーをチェックする：", stackBanBoolean);
    modulesillegalitemsui
        .show(player)
        .then((illegalitemsResult) => {
            uiILLEGALITEMS(illegalitemsResult, player);
        })
        .catch((error) => {
            console.error("Paradoxの未処理拒否：", error);
            // スタックトレース情報の抽出
            if (error instanceof Error) {
                const stackLines = error.stack.split("\n");
                if (stackLines.length > 1) {
                    const sourceInfo = stackLines;
                    console.error("エラーの原因", sourceInfo[0]);
                }
            }
        });
}

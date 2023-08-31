import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiILLEGALITEMS } from "../../../modules/uiIllegaItems";
export function illegalItemsHandler(player) {
    //Illegal items this will cover a few modules so will group these into one UI.
    const modulesillegalitemsui = new ModalFormData();
    const illegalItemsABoolean = dynamicPropertyRegistry.get("illegalitemsa_b");
    const illegalItemsBBoolean = dynamicPropertyRegistry.get("illegalitemsb_b");
    const illegalItemsCBoolean = dynamicPropertyRegistry.get("illegalitemsc_b");
    const illegalEnchantmentBoolean = dynamicPropertyRegistry.get("illegalenchantment_b");
    const illegalLoresBoolean = dynamicPropertyRegistry.get("illegallores_b");
    const stackBanBoolean = dynamicPropertyRegistry.get("stackban_b");
    modulesillegalitemsui.title("§4禁止アイテム§4");
                        modulesillegalitemsui.toggle("Illegal Items A -インベントリに不正なアイテムがないかチェックする：", illegalItemsABoolean);
                        modulesillegalitemsui.toggle("Illegal Items B - 不正なアイテムを置くプレーヤーをチェックする:", illegalItemsBBoolean);
                        modulesillegalitemsui.toggle("Illegal Items C - 違法な落し物のチェック:", illegalItemsCBoolean);
                        modulesillegalitemsui.toggle("Illegal Enchants - 不正なエンチャントが施されたアイテムをチェックする：", illegalEnchantmentBoolean);
                        modulesillegalitemsui.toggle("Illegal Lores - アイテムに違法な名前がないかチェックする：", illegalLoresBoolean);
                        modulesillegalitemsui.toggle("Stack Ban - 不正なスタックを持つプレイヤーをチェックする：", stackBanBoolean);
    modulesillegalitemsui
        .show(player)
        .then((illegalitemsResult) => {
        uiILLEGALITEMS(illegalitemsResult, player);
    })
        .catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // Extract stack trace information
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });
}

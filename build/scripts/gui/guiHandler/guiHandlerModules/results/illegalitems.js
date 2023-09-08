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
    modulesillegalitemsui.title("§4メニュー：Illegal Items§4");
    modulesillegalitemsui.toggle("不正なアイテムをインベントリに入れているプレイヤーをチェックする：", illegalItemsABoolean);
    modulesillegalitemsui.toggle("不正アイテムを置いたプレーヤーをチェックする。:", illegalItemsBBoolean);
    modulesillegalitemsui.toggle("不正な落とし物がないかチェックする：", illegalItemsCBoolean);
    modulesillegalitemsui.toggle("違法なエンチャントが施されたアイテムをチェックする：", illegalEnchantmentBoolean);
    modulesillegalitemsui.toggle("アイテムに不正な名前がないかチェックします：", illegalLoresBoolean);
    modulesillegalitemsui.toggle("アイテムが64以上超えていたら検知します", stackBanBoolean);
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

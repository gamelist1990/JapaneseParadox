import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiEXPSALVAGESYSTEM } from "../../../modules/uiExpSalvageSystem";
import ConfigInterface from "../../../../interfaces/Config";

export function salvageHandler(player: Player) {
    //新スラベージ・システム
    const modulesexpsavlagesystem = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const salvageBoolean = configuration.modules.salvage.enabled;
    modulesexpsavlagesystem.title("§4Salvage Systemメニュー§4");
    modulesexpsavlagesystem.toggle("サルベージシステム - すべてのアイテムをサルベージする：", salvageBoolean);
    modulesexpsavlagesystem
        .show(player)
        .then((salvagesystemResult) => {
            uiEXPSALVAGESYSTEM(salvagesystemResult, player);
        })
        .catch((error) => {
            console.error("パラドックスの未処理拒否：", error);
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
